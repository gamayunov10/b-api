import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PostViewModel } from '../api/models/output/post-view.model';
import { LikeStatus } from '../../../base/enums/like_status.enum';
import { Paginator } from '../../../base/pagination/_paginator';
import { SABlogQueryModel } from '../../blogs/api/models/input/sa-blog.query.model';
import { Post } from '../domain/post.entity';
import { Blog } from '../../blogs/domain/blog.entity';

export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

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
      .where('p.id = :postId', { postId })
      .getRawMany();

    const mappedPosts = await this.postsMapping(post);

    return mappedPosts[0];
  }

  private async postsMapping(posts: any): Promise<PostViewModel[]> {
    return posts.map((p) => {
      return {
        id: p.id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId.toString(),
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: +p.likesCount ?? 0,
          dislikesCount: +p.dislikesCount ?? 0,
          myStatus: p.myStatus ?? LikeStatus.NONE,
          newestLikes: p.newestLikes.map((l) => {
            return { ...l, userId: l.userId.toString() };
          }),
        },
      };
    });
  }
}
