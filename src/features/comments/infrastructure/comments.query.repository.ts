import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CommentViewModel } from '../api/models/output/comment-view.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { CommentQueryModel } from '../api/models/input/comment.query.model';
import { LikeStatus } from '../../../base/enums/like_status.enum';
import { User } from '../../users/domain/user.entity';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findCommentsByPostId(
    query: CommentQueryModel,
    postId: number,
    userId: number | null,
  ) {
    const sortDirection = query.sortDirection.toUpperCase();

    const comments = await this.dataSource
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
      .addSelect(
        `( SELECT COUNT(*)
                    FROM (
                        SELECT cl."commentId"
                        FROM comment_likes cl
                        WHERE c."id" = cl."commentId" AND cl."likeStatus" = 'Like'
                    ))`,
        'likesCount',
      )
      .addSelect(
        `
                  ( SELECT COUNT(*)
                    FROM (
                        SELECT cl."commentId"
                        FROM comment_likes cl
                        WHERE c."id" = cl."commentId" AND cl."likeStatus" = 'Dislike'
                    ))`,
        'dislikesCount',
      )
      .addSelect(
        `(SELECT cl."likeStatus"
                        FROM comment_likes cl
                        WHERE  c."id" = cl."commentId" AND cl."userId" = ${userId}
                  )`,
        'myStatus',
      )
      .where('c."postId" = :postId', { postId })
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
      .from(Comment, 'c')
      .where('c."postId" = :postId', { postId })
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.commentsMapping(comments),
    });
  }

  async findComment(
    commentId: number,
    userId?: number | null,
  ): Promise<CommentViewModel> {
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
      .addSelect(
        `( SELECT COUNT(*)
                    FROM (
                        SELECT cl."commentId"
                        FROM comment_likes cl
                        WHERE c."id" = cl."commentId" AND cl."likeStatus" = 'Like'
                    ))`,
        'likesCount',
      )
      .addSelect(
        `
                  ( SELECT COUNT(*)
                    FROM (
                        SELECT cl."commentId"
                        FROM comment_likes cl
                        WHERE c."id" = cl."commentId" AND cl."likeStatus" = 'Dislike'
                    ))`,
        'dislikesCount',
      )
      .addSelect(
        `(SELECT cl."likeStatus"
                        FROM comment_likes cl
                        WHERE  c."id" = cl."commentId" AND cl."userId" = ${userId}
                  )`,
        'myStatus',
      )
      .where('c.id = :commentId', { commentId })
      .getRawMany();

    const comments = await this.commentsMapping(comment);

    return comments[0];
  }

  async checkExistenceOfComment(commentId: number) {
    return await this.dataSource
      .createQueryBuilder()
      .select('c.id as id, c."userId" as "userId"')
      .from(Comment, 'c')
      .where('c.id = :commentId', { commentId })
      .getRawOne();
  }

  async findNewlyCreatedComment(commentId: number): Promise<CommentViewModel> {
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
      .getRawOne();

    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.NONE,
      },
    };
  }

  private async commentsMapping(comments: any): Promise<CommentViewModel[]> {
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
          likesCount: +c.likesCount ?? 0,
          dislikesCount: +c.dislikesCount ?? 0,
          myStatus: c.myStatus ?? LikeStatus.NONE,
        },
      };
    });
  }
}
