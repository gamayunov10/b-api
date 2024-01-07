import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CommentInputModel } from '../api/models/input/comment-input.model';

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
