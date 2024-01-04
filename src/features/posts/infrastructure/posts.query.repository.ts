import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PostViewModel } from '../api/models/output/post-view.model';
import { LikeStatus } from '../../../base/enums/like_status.enum';
import { Paginator } from '../../../base/pagination/_paginator';
import { SABlogQueryModel } from '../../blogs/api/models/input/sa-blog.query.model';

export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findPostsByBlogId(
    query: SABlogQueryModel,
    blogId: number,
  ): Promise<Paginator<PostViewModel[]>> {
    const posts = await this.dataSource.query(
      `SELECT 
                p.id,
                p.title,
                p."shortDescription",
                p.content,
                b.id as "blogId",
                b.name as "blogName",
                p."createdAt"
             FROM public.posts p
             LEFT JOIN public.blogs b
             ON b.id = p."blogId"
             WHERE p."blogId" = $1
             ORDER BY "${query.sortBy}" 
             ${query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''} ${
        query.sortDirection
      }
             LIMIT ${query.pageSize} OFFSET (${query.pageNumber} - 1) * ${
        query.pageSize
      }`,
      [blogId],
    );

    const totalCount = await this.dataSource.query(
      `SELECT count(*)
              FROM public.posts p
              LEFT JOIN public.blogs b on b.id = p."blogId"
              WHERE "blogId" = $1;`,
      [blogId],
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: Number(query.pageSize),
      totalCount: Number(totalCount[0].count),
      items: await this.postsMapping(posts),
    });
  }

  async findPostByPostId(postId: number): Promise<PostViewModel | null> {
    const posts = await this.dataSource.query(
      `SELECT 
              p.id,
              p.title,
              p."shortDescription",
              p.content,
              p."blogId",
              b.name as "blogName",
              p."createdAt"
         FROM public.posts p
         LEFT JOIN public.blogs b
         ON b.id = p."blogId"
         WHERE p.id = $1;`,
      [postId],
    );

    const mappedPosts = await this.postsMapping(posts);

    if (mappedPosts.length === 0) {
      return null;
    }

    return mappedPosts[0];
  }

  private async postsMapping(posts: any): Promise<PostViewModel[]> {
    return posts.map((p) => {
      let newestLikes = p.newestLikes;

      if (!newestLikes) {
        newestLikes = [];
      }

      return {
        id: p.id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId.toString(),
        blogName: p.blogName, // +
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: p.likeStatus || LikeStatus.NONE,
          newestLikes: newestLikes.map((nl) => {
            return {
              addedAt: nl.addedAt,
              userId: nl.userId.toString(),
              login: nl.login,
            };
          }),
        },
      };
    });
  }
}
