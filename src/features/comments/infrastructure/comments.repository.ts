import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CommentInputModel } from '../api/models/input/comment-input.model';
import { LikeStatusInputModel } from '../../posts/api/models/input/like-status-input.model';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async updateComment(
    commentId: number,
    commentInputModel: CommentInputModel,
  ): Promise<boolean> {
    try {
      return this.dataSource.transaction(async (): Promise<boolean> => {
        const result = await this.dataSource.query(
          `UPDATE public.comments 
                  SET content = $2
                  WHERE id = $1;`,
          [commentId, commentInputModel.content],
        );

        return result[1] === 1;
      });
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async commentLikeStatus(
    commentId: number,
    userId: number,
    likeStatusInputModel: LikeStatusInputModel,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const existingLike = await this.dataSource.query(
        `SELECT id 
                FROM public.comment_likes 
                WHERE "commentId" = $1 
                AND "userId" = $2;`,
        [commentId, userId],
      );

      if (existingLike && existingLike.length > 0) {
        await this.dataSource.query(
          `UPDATE public.comment_likes 
                  SET "likeStatus" = $1 
                  WHERE "commentId" = $2 
                  AND "userId" = $3;`,
          [likeStatusInputModel.likeStatus, commentId, userId],
        );
        return existingLike[0].id;
      } else {
        const newLike = await this.dataSource.query(
          `INSERT INTO public.comment_likes ("commentId", "userId", "likeStatus")
                  VALUES ($1, $2, $3)
                  RETURNING id;`,
          [commentId, userId, likeStatusInputModel.likeStatus],
        );
        return newLike[0].id;
      }
    });
  }

  async deleteComment(commentId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE
       FROM public.comments
       WHERE id = $1;`,
      [commentId],
    );

    return result[1] === 1;
  }
}
