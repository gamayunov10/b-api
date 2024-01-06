import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CommentViewModel } from '../api/models/output/comment-view.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { CommentQueryModel } from '../api/models/input/comment.query.model';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findCommentsByPostId(postId: number, query: CommentQueryModel) {
    const comments = await this.dataSource.query(
      `SELECT 
              c.id,
              c.content,
              u.id as "userId",
              u.login as "userLogin",
              c."createdAt"
         FROM public.comments c
         LEFT JOIN public.users u
         ON c."commentatorId" = u.id
         WHERE c."postId" = $1
         ORDER BY "${query.sortBy}" ${
        query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
      } ${query.sortDirection}
         LIMIT ${query.pageSize} OFFSET (${query.pageNumber} - 1) * ${
        query.pageSize
      };`,
      [postId],
    );

    const totalCount = await this.dataSource.query(
      `SELECT count(*)
       FROM public.comments
       WHERE ("postId" = $1);`,
      [postId],
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount[0].count,
      items: await this.commentsMapping(comments),
    });
  }

  async findComment(commentId: number): Promise<CommentViewModel | null> {
    const comments = await this.dataSource.query(
      `SELECT 
              c.id,
              c.content,
              u.id as "userId",
              u.login as "userLogin",
              c."createdAt"
         FROM public.comments c
         LEFT JOIN public.users u
         ON c."commentatorId" = u.id
         WHERE c.id = $1;`,
      [commentId],
    );

    const mappedPosts = await this.commentsMapping(comments);

    if (mappedPosts.length === 0) {
      return null;
    }

    return mappedPosts[0];
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
        likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
      };
    });
  }
}
