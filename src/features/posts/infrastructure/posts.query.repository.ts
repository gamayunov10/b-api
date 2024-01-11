import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PostViewModel } from '../api/models/output/post-view.model';
import { LikeStatus } from '../../../base/enums/like_status.enum';
import { Paginator } from '../../../base/pagination/_paginator';
import { SABlogQueryModel } from '../../blogs/api/models/input/sa-blog.query.model';
import { Post } from '../domain/post.entity';

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
    const posts = await this.getPosts(query, userId);

    const totalCount = await this.getTotalPostCount();

    return Paginator.paginate({
      pageNumber: Number(query.pageNumber),
      pageSize: Number(query.pageSize),
      totalCount: Number(totalCount[0].count),
      items: await this.postsMapping(posts),
    });
  }

  async findPostsByBlogId(
    query: SABlogQueryModel,
    blogId: number,
    userId: number | null,
  ): Promise<Paginator<PostViewModel[]>> {
    const posts = await this.getPostsByBlogId(query, blogId, userId);

    const totalCount = await this.dataSource.query(
      `SELECT count(*)
              FROM public.posts p
              LEFT JOIN public.blogs b on b.id = p."blogId"
              WHERE "blogId" = $1;`,
      [blogId],
    );

    return Paginator.paginate({
      pageNumber: Number(query.pageNumber),
      pageSize: Number(query.pageSize),
      totalCount: Number(totalCount[0].count),
      items: await this.postsMapping(posts),
    });
  }

  async findPostByPostId(
    postId: number,
    userId?: number | null,
  ): Promise<PostViewModel | null> {
    const posts = await this.getPostById(postId, userId);

    const mappedPosts = await this.postsMapping(posts);

    if (mappedPosts.length === 0) {
      return null;
    }

    return mappedPosts[0];
  }

  private async getPostById(postId: number, userId: number | null) {
    return await this.dataSource.query(
      `
            WITH 
              NewestLikes AS (
                SELECT 
                  pl."postId",
                  json_build_object(
                    'addedAt', pl."addedAt",
                    'userId', pl."userId",
                    'login', u.login
                  ) AS user_details
                FROM 
                  public.post_likes pl
                LEFT JOIN 
                  public.users u ON pl."userId" = u.id
                WHERE 
                  pl."likeStatus" = 'Like'
                ORDER BY 
                  pl."addedAt" DESC 
                LIMIT 
                  3
              ),
              PostLikes AS (
                SELECT "postId", COUNT(*) as "likesCount" 
                FROM public.post_likes 
                WHERE "likeStatus" = 'Like' 
                GROUP BY "postId"
              ),
              PostDislikes AS (
                SELECT "postId", COUNT(*) as "dislikesCount" 
                FROM public.post_likes 
                WHERE "likeStatus" = 'Dislike' 
                GROUP BY "postId"
              ),
              UserLikeStatus AS (
                SELECT "postId", "likeStatus" 
                FROM public.post_likes 
                WHERE "userId" = $2
              )
            SELECT 
              p.id,
              p.title,
              p."shortDescription",
              p.content,
              b.id as "blogId",
              b.name as "blogName",
              p."createdAt",
              COALESCE(pl."likesCount", 0) as "likesCount",
              COALESCE(pd."dislikesCount", 0) as "dislikesCount",
              COALESCE(uls."likeStatus", 'None') as "myStatus",
              json_agg(nl.user_details) as "newestUserDetails"
            FROM 
              public.posts p
            LEFT JOIN 
              public.blogs b ON b.id = p."blogId"
            LEFT JOIN 
              PostLikes pl ON p.id = pl."postId"
            LEFT JOIN 
              PostDislikes pd ON p.id = pd."postId"
            LEFT JOIN 
              UserLikeStatus uls ON p.id = uls."postId"
            LEFT JOIN 
              NewestLikes nl ON p.id = nl."postId"
            WHERE 
              p.id = $1
            GROUP BY 
              p.id, b.id, pl."likesCount", pd."dislikesCount", uls."likeStatus";
          `,
      [postId, userId],
    );
  }

  private async getPostsByBlogId(
    query: SABlogQueryModel,
    blogId: number,
    userId: number | null,
  ) {
    return await this.dataSource.query(
      `
            WITH 
              NewestLikes AS (
                SELECT 
                  pl."postId",
                  json_build_object(
                    'addedAt', pl."addedAt",
                    'userId', pl."userId",
                    'login', u.login
                  ) AS user_details
                FROM 
                  public.post_likes pl
                LEFT JOIN 
                  public.users u ON pl."userId" = u.id
                WHERE 
                  pl."likeStatus" = 'Like'
                ORDER BY 
                  pl."addedAt" DESC 
                LIMIT 
                  3
              ),
              PostLikes AS (
                SELECT "postId", COUNT(*) as "likesCount" 
                FROM public.post_likes 
                WHERE "likeStatus" = 'Like' 
                GROUP BY "postId"
              ),
              PostDislikes AS (
                SELECT "postId", COUNT(*) as "dislikesCount" 
                FROM public.post_likes 
                WHERE "likeStatus" = 'Dislike' 
                GROUP BY "postId"
              ),
              UserLikeStatus AS (
                SELECT "postId", "likeStatus" 
                FROM public.post_likes 
                WHERE "userId" = $2
              )
              SELECT 
                p.id,
                p.title,
                p."shortDescription",
                p.content,
                b.id as "blogId",
                b.name as "blogName",
                p."createdAt",
                COALESCE(pl."likesCount", 0) as "likesCount",
                COALESCE(pd."dislikesCount", 0) as "dislikesCount",
                COALESCE(uls."likeStatus", 'None') as "myStatus",
                json_agg(nl.user_details) as "newestUserDetails"
              FROM 
                public.posts p
              LEFT JOIN 
                public.blogs b ON b.id = p."blogId"
              LEFT JOIN 
                PostLikes pl ON p.id = pl."postId"
              LEFT JOIN 
                PostDislikes pd ON p.id = pd."postId"
              LEFT JOIN 
                UserLikeStatus uls ON p.id = uls."postId"
              LEFT JOIN 
                NewestLikes nl ON p.id = nl."postId"
              WHERE b.id = $1
              GROUP BY 
                p.id, b.id, pl."likesCount", pd."dislikesCount", uls."likeStatus"
              ORDER BY 
                "${query.sortBy}" 
                ${query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''} 
                ${query.sortDirection}
              LIMIT 
                ${query.pageSize} OFFSET (${query.pageNumber} - 1) * ${
        query.pageSize
      };
                `,
      [blogId, userId],
    );
  }

  private async getPosts(query: SABlogQueryModel, userId: number) {
    return await this.dataSource.query(
      `
            WITH 
              NewestLikes AS (
                SELECT 
                  pl."postId",
                  json_build_object(
                    'addedAt', pl."addedAt",
                    'userId', pl."userId",
                    'login', u.login
                  ) AS user_details,
                  ROW_NUMBER() OVER (PARTITION BY pl."postId" ORDER BY pl."addedAt" DESC) AS rn
                FROM 
                  public.post_likes pl
                LEFT JOIN 
                  public.users u ON pl."userId" = u.id
                WHERE 
                  pl."likeStatus" = 'Like'
              ),
              FilteredNewestLikes AS (
                SELECT 
                  "postId",
                  user_details
                FROM 
                  NewestLikes
                WHERE 
                  rn <= 3
              ),
              PostLikes AS (
                SELECT "postId", COUNT(*) as "likesCount" 
                FROM public.post_likes 
                WHERE "likeStatus" = 'Like' 
                GROUP BY "postId"
              ),
              PostDislikes AS (
                SELECT "postId", COUNT(*) as "dislikesCount" 
                FROM public.post_likes 
                WHERE "likeStatus" = 'Dislike' 
                GROUP BY "postId"
              ),
              UserLikeStatus AS (
                SELECT "postId", "likeStatus" 
                FROM public.post_likes 
                WHERE "userId" = $1
              )
            SELECT 
              p.id,
              p.title,
              p."shortDescription",
              p.content,
              b.id as "blogId",
              b.name as "blogName",
              p."createdAt",
              COALESCE(pl."likesCount", 0) as "likesCount",
              COALESCE(pd."dislikesCount", 0) as "dislikesCount",
              COALESCE(uls."likeStatus", 'None') as "myStatus",
              json_agg(fn.user_details) as "newestUserDetails"
            FROM 
              public.posts p
            LEFT JOIN 
              public.blogs b ON b.id = p."blogId"
            LEFT JOIN 
              PostLikes pl ON p.id = pl."postId"
            LEFT JOIN 
              PostDislikes pd ON p.id = pd."postId"
            LEFT JOIN 
              UserLikeStatus uls ON p.id = uls."postId"
            LEFT JOIN 
              FilteredNewestLikes fn ON p.id = fn."postId"
            GROUP BY 
              p.id, b.id, pl."likesCount", pd."dislikesCount", uls."likeStatus"
            ORDER BY 
              "${query.sortBy}" 
              ${query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''} 
              ${query.sortDirection}
            LIMIT 
              ${query.pageSize} OFFSET (${query.pageNumber} - 1) * ${
        query.pageSize
      };
            `,
      [userId],
    );
  }

  private async getTotalPostCount() {
    return await this.dataSource.query(`
    SELECT count(*)
    FROM public.posts
  `);
  }

  private async postsMapping(posts: any): Promise<PostViewModel[]> {
    return posts.map((p) => {
      const mappedNewestLikes =
        p.newestUserDetails[0] === null
          ? []
          : p.newestUserDetails.map((detail: any) => ({
              addedAt: detail?.addedAt?.toString(),
              userId: detail?.userId.toString(),
              login: detail?.login,
            }));

      return {
        id: p.id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId.toString(),
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: +p.likesCount || +0,
          dislikesCount: +p.dislikesCount || +0,
          myStatus: p.myStatus || LikeStatus.NONE,
          newestLikes: mappedNewestLikes || [],
        },
      };
    });
  }
}
