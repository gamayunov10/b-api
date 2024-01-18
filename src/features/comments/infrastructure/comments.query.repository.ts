import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CommentViewModel } from '../api/models/output/comment-view.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { CommentQueryModel } from '../api/models/input/comment.query.model';
import { LikeStatus } from '../../../base/enums/like_status.enum';
import { User } from '../../users/domain/user.entity';
import { CommentLike } from '../domain/comment-like.entity';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findCommentsByPostId(
    query: CommentQueryModel,
    postId: number,
    userId: number | null,
  ) {
    const comment = await this.dataSource
      .createQueryBuilder()
      .select([
        'c.id as id',
        'c.content as content',
        'u.id as "userId"',
        'u.login as "userLogin"',
        'c.createdAt as "createdAt"',
      ])
      .from(Comment, 'c')
      .leftJoin(User, 'u', 'c."userId" = u.id')
      .where('c."postId" = :postId', { postId })
      .getRawMany();

    if (!comment) {
      return null;
    }
    const commentId = comment[0].id;

    const likesCount = await this.getCommentLikesCount(
      'commentId',
      commentId,
      LikeStatus.LIKE,
    );

    const dislikesCount = await this.getCommentLikesCount(
      'commentId',
      commentId,
      LikeStatus.DISLIKE,
    );
    const myStatus = await this.getUserLikeStatus(
      'commentId',
      commentId,
      userId,
    );

    const totalCount = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(Comment, 'c')
      .where('c."postId" = "postId"', { postId })
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.commentsMapping(
        comment,
        likesCount,
        dislikesCount,
        myStatus,
      ),
    });
  }

  async findComment(
    commentId: number,
    userId?: number | null,
  ): Promise<CommentViewModel | null> {
    const comment = await this.dataSource
      .createQueryBuilder()
      .select([
        'c.id as id',
        'c.content as content',
        'u.id as "userId"',
        'u.login as "userLogin"',
        'c.createdAt as "createdAt"',
      ])
      .from(Comment, 'c')
      .leftJoin(User, 'u', 'c."userId" = u.id')
      .where('c.id = :commentId', { commentId })
      .getRawMany();

    if (!comment) {
      return null;
    }

    const likesCount = await this.getCommentLikesCount(
      'commentId',
      commentId,
      LikeStatus.LIKE,
    );
    const dislikesCount = await this.getCommentLikesCount(
      'commentId',
      commentId,
      LikeStatus.DISLIKE,
    );
    const myStatus = await this.getUserLikeStatus(
      'commentId',
      commentId,
      userId,
    );

    const comments = await this.commentsMapping(
      comment,
      likesCount,
      dislikesCount,
      myStatus,
    );

    return comments[0];
  }

  private async getCommentLikesCount(
    column: string,
    id: number,
    likeStatus: string,
  ): Promise<number> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(CommentLike, 'cl')
      .where(`cl."${column}" = :id`, { id })
      .andWhere('cl."likeStatus" = :likeStatus', { likeStatus })
      .getCount();

    return result || 0;
  }

  private async getUserLikeStatus(
    column: string,
    id: number,
    userId?: number | null,
  ): Promise<LikeStatus> {
    if (!userId) {
      return LikeStatus.NONE;
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .select('"likeStatus"')
      .from(CommentLike, 'cl')
      .where(`cl."${column}" = :id`, { id })
      .andWhere('cl."userId" = :userId', { userId })
      .getRawOne();

    return result.likeStatus;
  }

  private async commentsMapping(
    comments: any,
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
  ): Promise<CommentViewModel[]> {
    return comments.map((c) => {
      return {
        id: c.id.toString(),
        content: c.content,
        commentatorInfo: {
          userId: c.userId.toString(),
          userLogin: c.userLogin,
        },
        createdAt: c.createdAt,
        likesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikesCount,
          myStatus: myStatus,
        },
      };
    });
  }
}
