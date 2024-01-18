import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CommentInputModel } from '../api/models/input/comment-input.model';
import { LikeStatusInputModel } from '../../posts/api/models/input/like-status-input.model';
import { Comment } from '../domain/comment.entity';
import { CommentLike } from '../domain/comment-like.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async updateComment(
    commentId: number,
    commentInputModel: CommentInputModel,
  ): Promise<boolean> {
    return this.dataSource.transaction(async (): Promise<boolean> => {
      const result = await this.dataSource
        .createQueryBuilder()
        .update(Comment)
        .set({ content: commentInputModel.content })
        .where('id = :id', { id: commentId })
        .execute();

      return result.affected === 1;
    });
  }

  async commentLikeStatus(
    commentId: number,
    userId: number,
    likeStatusInputModel: LikeStatusInputModel,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const existingLike = await this.dataSource
        .createQueryBuilder()
        .select('id')
        .from(CommentLike, 'CommentLike')
        .where('"commentId" = :commentId', { commentId: commentId })
        .andWhere('"userId" = :userId', { userId: userId })
        .execute();

      if (existingLike && existingLike.length > 0) {
        await this.dataSource
          .createQueryBuilder()
          .update(CommentLike)
          .set({ likeStatus: likeStatusInputModel.likeStatus })
          .where('"commentId" = :commentId', { commentId: commentId })
          .andWhere('"userId" = :userId', { userId: userId })
          .execute();

        return existingLike[0].id;
      } else {
        const newLike = await this.dataSource
          .createQueryBuilder()
          .insert()
          .into(CommentLike)
          .values({
            commentId: commentId,
            userId: userId,
            likeStatus: likeStatusInputModel.likeStatus,
          })
          .execute();

        return newLike.identifiers[0].id;
      }
    });
  }

  async deleteComment(commentId: number): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Comment)
      .where('id = :id', { id: commentId })
      .execute();

    return result.affected === 1;
  }
}
