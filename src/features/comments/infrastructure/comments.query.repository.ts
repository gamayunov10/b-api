import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CommentViewModel } from '../api/models/output/comment-view.model';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
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
