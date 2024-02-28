import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PostViewModel } from '../api/models/output/post-view.model';
import { LikeStatus } from '../../../base/enums/like_status.enum';
import { Paginator } from '../../../base/pagination/_paginator';
import { SABlogQueryModel } from '../../blogs/api/models/input/sa-blog.query.model';
import { Post } from '../domain/post.entity';
import { Blog } from '../../blogs/domain/blog.entity';
import { PostOutputModel } from '../api/models/output/post-output.model';
import { PostLike } from '../domain/post-like.entity';
import { PostQueryModel } from '../api/models/input/post.query.model';

export class PostsQueryRepository {
  private readonly logger = new Logger(PostsQueryRepository.name);
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async findPostsForBlog(
    query: PostQueryModel,
    blogId: number,
    userId: number,
  ): Promise<Paginator<PostViewModel[]>> {
    try {
      const sortDirection = query.sortDirection.toUpperCase();

      const queryBuilder = this.postsRepository
        .createQueryBuilder('p')
        .select([
          'p.id as id',
          'p.title as title',
          'p.shortDescription as "shortDescription"',
          'p.content as content',
          'b.id as "blogId"',
          'b.name as "blogName"',
          'p.createdAt as "createdAt"',
        ])
        .addSelect(
          (qb) =>
            qb
              .select(`COUNT(*)`)
              .from(PostLike, 'pl')
              .where('p."id" = pl."postId"')
              .andWhere('pl."likeStatus" = \'Like\''),
          'likesCount',
        )
        .addSelect(
          (qb) =>
            qb
              .select(`COUNT(*)`)
              .from(PostLike, 'pl')
              .where('p."id" = pl."postId"')
              .andWhere('pl."likeStatus" = \'Dislike\''),
          'dislikesCount',
        )
        .addSelect(
          (qb) =>
            qb
              .select('pl.likeStatus')
              .from(PostLike, 'pl')
              .where('p."id" = pl."postId"')
              .andWhere('pl."userId" = :userId', { userId }),
          'myStatus',
        )
        .addSelect(
          `COALESCE((
                    SELECT json_agg(row)
                    FROM (
                        SELECT pl."addedAt", pl."userId", u."login"
                        FROM post_likes pl
                        LEFT JOIN users u on pl."userId" = u.id
                        LEFT JOIN user_ban_info ubi ON ubi.userId =  u.id
                        WHERE pl."postId" = p."id" AND pl."likeStatus" = 'Like' AND ubi.is_banned = false
                        ORDER BY "addedAt" DESC
                        LIMIT 3
                    ) row
                ),'[]')`,
          'newestLikes',
        )
        .leftJoin('p.blog', 'b')
        .leftJoin('b.blogBan', 'bb')
        .leftJoin('b.user', 'u')
        .leftJoin('u.userBanInfo', 'ubi')
        .where('b.id = :blogId', { blogId })
        .orderBy(
          `p."${query.sortBy}" ${
            query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
          }`,
          sortDirection as 'ASC' | 'DESC',
        )
        .limit(+query.pageSize)
        .offset((+query.pageNumber - 1) * +query.pageSize);

      const posts = await queryBuilder.getRawMany();
      const totalCount = await queryBuilder.getCount();

      return Paginator.paginate({
        pageNumber: Number(query.pageNumber),
        pageSize: Number(query.pageSize),
        totalCount: totalCount,
        items: await this.postsMapping(posts),
      });
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }
      return null;
    }
  }

  async findPosts(
    query: SABlogQueryModel,
    userId?: number,
  ): Promise<Paginator<PostViewModel[]>> {
    const sortDirection = query.sortDirection.toUpperCase();

    const posts = await this.dataSource
      .createQueryBuilder()
      .select([
        'p.id as id',
        'p.title as title',
        'p.shortDescription as "shortDescription"',
        'p.content as content',
        'b.id as "blogId"',
        'b.name as "blogName"',
        'p.createdAt as "createdAt"',
      ])
      .from(Post, 'p')
      .leftJoin(Blog, 'b', 'b.id = p."blogId"')
      .addSelect(
        `( SELECT COUNT(*)
                    FROM (
                        SELECT pl."postId"
                        FROM post_likes pl
                        WHERE p."id" = pl."postId" AND pl."likeStatus" = 'Like'
                    ))`,
        'likesCount',
      )
      .addSelect(
        `( SELECT COUNT(*)
                    FROM (
                        SELECT pl."postId"
                        FROM post_likes pl
                        WHERE p."id" = pl."postId" AND pl."likeStatus" = 'Dislike'
                    ))`,
        'dislikesCount',
      )
      .addSelect(
        `(SELECT pl."likeStatus"
                        FROM post_likes pl
                        WHERE p."id" = pl."postId" AND pl."userId" = ${userId}
                  )`,
        'myStatus',
      )
      .addSelect(
        `COALESCE((
                    SELECT json_agg(row)
                    FROM (
                        SELECT pl."addedAt", pl."userId", u."login"
                        FROM post_likes pl
                        LEFT JOIN users u on pl."userId" = u.id
                        WHERE pl."postId" = p."id" AND pl."likeStatus" = 'Like'
                        ORDER BY "addedAt" DESC
                        LIMIT 3
                    ) row
                ),'[]')`,
        'newestLikes',
      )
      .orderBy(
        `"${query.sortBy}" ${
          query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize)
      .getRawMany();

    const totalCount = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(Post, 'p')
      .getCount();

    return Paginator.paginate({
      pageNumber: Number(query.pageNumber),
      pageSize: Number(query.pageSize),
      totalCount: totalCount,
      items: await this.postsMapping(posts),
    });
  }

  async findPostsByBlogId(
    query: SABlogQueryModel,
    blogId: number,
    userId: number | null,
  ): Promise<Paginator<PostViewModel[]>> {
    const sortDirection = query.sortDirection.toUpperCase();

    const post = await this.dataSource
      .createQueryBuilder()
      .select([
        'p.id as id',
        'p.title as title',
        'p.shortDescription as "shortDescription"',
        'p.content as content',
        'b.id as "blogId"',
        'b.name as "blogName"',
        'p.createdAt as "createdAt"',
      ])
      .from(Post, 'p')
      .leftJoin(Blog, 'b', 'b.id = p."blogId"')
      .addSelect(
        `( SELECT COUNT(*)
                    FROM (
                        SELECT pl."postId"
                        FROM post_likes pl
                        WHERE p."id" = pl."postId" AND pl."likeStatus" = 'Like'
                    ))`,
        'likesCount',
      )
      .addSelect(
        `( SELECT COUNT(*)
                    FROM (
                        SELECT pl."postId"
                        FROM post_likes pl
                        WHERE p."id" = pl."postId" AND pl."likeStatus" = 'Dislike'
                    ))`,
        'dislikesCount',
      )
      .addSelect(
        `(SELECT pl."likeStatus"
                        FROM post_likes pl
                        WHERE p."id" = pl."postId" AND pl."userId" = ${userId}
                  )`,
        'myStatus',
      )
      .addSelect(
        `COALESCE((
                    SELECT json_agg(row)
                    FROM (
                        SELECT pl."addedAt", pl."userId", u."login"
                        FROM post_likes pl
                        LEFT JOIN users u on pl."userId" = u.id
                        WHERE pl."postId" = p."id" AND pl."likeStatus" = 'Like'
                        ORDER BY "addedAt" DESC
                        LIMIT 3
                    ) row
                ),'[]')`,
        'newestLikes',
      )
      .where('b.id = :blogId', { blogId })
      .orderBy(
        `"${query.sortBy}" ${
          query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize)
      .getRawMany();

    const totalCount = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(Post, 'p')
      .where('p."blogId" = :blogId', { blogId })
      .getCount();

    return Paginator.paginate({
      pageNumber: Number(query.pageNumber),
      pageSize: Number(query.pageSize),
      totalCount: totalCount,
      items: await this.postsMapping(post),
    });
  }

  async findPostByPostId(
    postId: number,
    userId?: number | null,
  ): Promise<PostViewModel | null> {
    const post = await this.postsRepository
      .createQueryBuilder('p')
      .select([
        'p.id as id',
        'p.title as title',
        'p.shortDescription as "shortDescription"',
        'p.content as content',
        'b.id as "blogId"',
        'b.name as "blogName"',
        'p.createdAt as "createdAt"',
      ])
      .leftJoin('p.blog', 'b')
      .leftJoin('b.blogBan', 'bb')
      .leftJoin('b.user', 'u')
      .leftJoin('u.userBanInfo', 'ubi')
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(PostLike, 'pl')
            .leftJoin('pl.user', 'u')
            .leftJoin('u.userBanInfo', 'ubi')
            .where('pl.postId = p.id')
            .andWhere('ubi.isBanned = false')
            .andWhere(`pl.likeStatus = 'Like'`),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(PostLike, 'pl')
            .leftJoin('pl.user', 'u')
            .leftJoin('u.userBanInfo', 'ubi')
            .where('pl.postId = p.id')
            .andWhere('ubi.isBanned = false')
            .andWhere(`pl.likeStatus = 'Dislike'`),
        'dislikesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select('pl.likeStatus')
            .from(PostLike, 'pl')
            .where('pl.postId = p.id')
            .andWhere('pl.userId = :userId', { userId }),
        'myStatus',
      )
      .addSelect(
        `COALESCE((
                    SELECT json_agg(row)
                    FROM (
                        SELECT pl."addedAt", pl."userId", u."login"
                        FROM post_likes pl
                        LEFT JOIN users u on pl."userId" = u.id
                        LEFT JOIN user_ban_info ubi on ubi.userId = u.id
                        WHERE pl."postId" = p."id" AND pl."likeStatus" = 'Like' AND ubi.isBanned = false
                        ORDER BY "addedAt" DESC
                        LIMIT 3
                    ) row
                ),'[]')`,
        'newestLikes',
      )
      .where('p.id = :postId', { postId })
      .andWhere('ubi.isBanned = false')
      .andWhere('bb.isBanned = false')
      .getRawMany();

    const mappedPosts = await this.postsMapping(post);

    return mappedPosts[0];
  }

  async findNewlyCreatedPost(postId: number): Promise<PostOutputModel> {
    const post = await this.dataSource
      .createQueryBuilder()
      .select([
        'p.id as id',
        'p.title as title',
        'p.shortDescription as "shortDescription"',
        'p.content as content',
        'b.id as "blogId"',
        'b.name as "blogName"',
        'p.createdAt as "createdAt"',
      ])
      .from(Post, 'p')
      .leftJoin(Blog, 'b', 'b.id = p."blogId"')
      .where('p.id = :postId', { postId })
      .getRawOne();

    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.NONE,
        newestLikes: [],
      },
    };
  }

  async checkExistenceOfPost(postId: number): Promise<number | undefined> {
    const post = await this.dataSource
      .createQueryBuilder()
      .select('p.id as id')
      .from(Post, 'p')
      .where('p.id = :postId', { postId })
      .getRawOne();

    return post?.id;
  }

  async findPost(postId: number): Promise<Post | null> {
    return await this.postsRepository
      .createQueryBuilder('p')
      .select([
        'id as id',
        'title as title',
        '"shortDescription" as "shortDescription"',
        'content as content',
        '"blogId" as "blogId"',
        '"blogName" as "blogName"',
        '"createdAt" as "createdAt"',
      ])
      .where('p.id = :postId', { postId })
      .getRawOne();
  }

  private async postsMapping(posts: any): Promise<PostViewModel[]> {
    return posts.map((p) => {
      return {
        id: p.id?.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId?.toString(),
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: +p.likesCount || 0,
          dislikesCount: +p.dislikesCount || 0,
          myStatus: p.myStatus || LikeStatus.NONE,
          newestLikes: p.newestLikes.map((l) => {
            return { ...l, userId: l.userId?.toString() };
          }),
        },
      };
    });
  }
}
