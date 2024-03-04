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
import { PostMainImage } from '../domain/post-main-image.entity';

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
              .leftJoin('pl.user', 'u')
              .leftJoin('u.userBanInfo', 'ubi')
              .where('p."id" = pl."postId"')
              .andWhere('ubi.isBanned = false')
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
        .addSelect(
          (qb) =>
            qb
              .select(
                `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
              )
              .from((qb) => {
                return qb
                  .select(`url, width, height, size`)
                  .from(PostMainImage, 'pmi')
                  .where('pmi.postId = p.id');
              }, 'agg'),

          'mainImages',
        )
        .leftJoin('p.postMainImages', 'pmi')
        .leftJoin('p.blog', 'b')
        .leftJoin('b.blogBan', 'bb')
        .leftJoin('b.user', 'u')
        .leftJoin('u.userBanInfo', 'ubi')
        .where('b.id = :blogId', { blogId })
        .andWhere(`bb.isBanned = false`)
        .andWhere(`ubi.isBanned = false`)
        .orderBy(
          `p."${query.sortBy}" ${
            query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
          }`,
          sortDirection as 'ASC' | 'DESC',
        )
        .limit(+query.pageSize)
        .offset((+query.pageNumber - 1) * +query.pageSize)
        .groupBy(`p.id, b.id, bb.id, u.id, ubi.id`);

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
            .select(`count(*)`)
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
                        WHERE pl."postId" = p."id" AND pl."likeStatus" = 'Like'
                        ORDER BY "addedAt" DESC
                        LIMIT 3
                    ) row
                ),'[]')`,
        'newestLikes',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`url, width, height, size`)
                .from(PostMainImage, 'pmi')
                .where('pmi.postId = p.id');
            }, 'agg'),

        'mainImages',
      )
      .leftJoin('p.postMainImages', 'pmi')
      .leftJoin('p.blog', 'b', 'b.id = p."blogId"')
      .leftJoinAndSelect('b.blogBan', 'bb')
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .leftJoin('p.postLike', 'pl')
      .where(`bb.isBanned = false`)
      .andWhere(`ubi.isBanned = false`)
      .orderBy(
        `"${query.sortBy}" ${
          query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize)
      .groupBy(`p.id, b.id, bb.id, u.id, ubi.id`);

    const posts = await queryBuilder.getRawMany();
    const totalCount = await queryBuilder.getCount();

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
      .leftJoin('p.postMainImages', 'pmi')
      .leftJoin('p.blog', 'b')
      .leftJoin('p.postLike', 'pl')
      .leftJoin('b.blogBan', 'bb')
      .leftJoin('b.user', 'u')
      .leftJoin('u.userBanInfo', 'ubi')
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
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`url, width, height, size`)
                .from(PostMainImage, 'pmi')
                .where('pmi.postId = p.id');
            }, 'agg'),

        'mainImages',
      )
      .where('b.id = :blogId', { blogId })
      .andWhere(`bb.isBanned = false`)
      .andWhere(`ubi.isBanned = false`)
      .orderBy(
        `"${query.sortBy}" ${
          query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize)
      .groupBy('p.id, b.id, bb.id');

    const post = await queryBuilder.getRawMany();

    return Paginator.paginate({
      pageNumber: Number(query.pageNumber),
      pageSize: Number(query.pageSize),
      totalCount: post.length,
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
      .leftJoin('p.postMainImages', 'pmi')
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
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`url, width, height, size`)
                .from(PostMainImage, 'pmi')
                .where('pmi.postId = p.id');
            }, 'agg'),

        'mainImages',
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
      images: {
        main: [],
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

  async findPostEntity(postId: number): Promise<Post | false> {
    const post = await this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .where('p.id = :postId', { postId })
      .getOne();

    if (!post) {
      return false;
    }

    return post;
  }

  async findPostMainImages(postId: number) {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.postMainImages', 'pmi')
        .where(`pmi.postId = :postId`, {
          postId,
        })
        .getMany();

      const mappedPosts = await this.postsMainImagesMapping(posts);
      return mappedPosts[0];
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }
      return false;
    }
  }

  private async postsMainImagesMapping(posts: any): Promise<PostViewModel[]> {
    return posts.map((p) => {
      let mainImages = [];

      if (p.postMainImages) {
        mainImages = p.postMainImages.map((pmi) => {
          return {
            url: process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN + pmi.url,
            width: Number(pmi.width),
            height: Number(pmi.height),
            fileSize: Number(pmi.size),
          };
        });
      }

      return {
        main: mainImages,
      };
    });
  }

  private async postsMapping(posts: any): Promise<PostViewModel[]> {
    return posts.map((p) => {
      let mainImages = [];

      if (p.mainImages) {
        mainImages = p.mainImages.map((pmi) => {
          return {
            url: process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN + pmi.url,
            width: Number(pmi.width),
            height: Number(pmi.height),
            fileSize: Number(pmi.size),
          };
        });
      }

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
        images: {
          main: mainImages,
        },
      };
    });
  }
}
