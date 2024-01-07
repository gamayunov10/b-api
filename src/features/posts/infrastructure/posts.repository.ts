import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PostInputModel } from '../api/models/input/post-input-model';
import { CommentInputModel } from '../../comments/api/models/input/comment-input.model';
import { LikeStatusInputModel } from '../api/models/input/like-status-input.model';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async createPostForSpecificBlog(
    postInputModel: PostInputModel,
    blogId: number,
    blogName: string,
  ): Promise<number> {
    const posts = await this.dataSource.query(
      `INSERT INTO public.posts 
                (title, "shortDescription", content, "blogId", "blogName")
       VALUES ($1, $2, $3, $4, $5)
       returning id;`,
      [
        postInputModel.title,
        postInputModel.shortDescription,
        postInputModel.content,
        blogId,
        blogName,
      ],
    );

    return posts[0].id;
  }

  async updatePost(
    postInputModel: PostInputModel,
    postId: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public.posts
              SET "title" = $1,
                   "shortDescription" = $2,
                   "content" = $3
       WHERE "id" = $4;`,
      [
        postInputModel.title,
        postInputModel.shortDescription,
        postInputModel.content,
        postId,
      ],
    );

    return result[1] === 1;
  }

  async createCommentForSpecificPost(
    postId: number,
    userId: number,
    commentInputModel: CommentInputModel,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const comments = await this.dataSource.query(
        `INSERT INTO public.comments 
                    (content, "commentatorId", "postId")
         VALUES ($1, $2, $3)
         RETURNING id;`,
        [commentInputModel.content, userId, postId],
      );

      return comments[0].id;
    });
  }

  async postLikeStatus(
    postId: number,
    userId: number,
    likeStatusInputModel: LikeStatusInputModel,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const existingLike = await this.dataSource.query(
        `SELECT id 
                FROM public.post_likes 
                WHERE "postId" = $1 
                AND "userId" = $2;`,
        [postId, userId],
      );

      if (existingLike && existingLike.length > 0) {
        await this.dataSource.query(
          `UPDATE public.post_likes 
                  SET "likeStatus" = $1 
                  WHERE "postId" = $2 
                  AND "userId" = $3;`,
          [likeStatusInputModel.likeStatus, postId, userId],
        );
        return existingLike[0].id;
      } else {
        const newLike = await this.dataSource.query(
          `INSERT INTO public.post_likes ("postId", "userId", "likeStatus")
                  VALUES ($1, $2, $3)
                  RETURNING id;`,
          [postId, userId, likeStatusInputModel.likeStatus],
        );
        return newLike[0].id;
      }
    });
  }

  async deletePost(postId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE
              FROM public.posts
              WHERE id = $1;`,
      [postId],
    );

    return result[1] === 1;
  }
}
