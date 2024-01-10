import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CommentViewModel } from '../api/models/output/comment-view.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { CommentQueryModel } from '../api/models/input/comment.query.model';
import { LikeStatus } from '../../../base/enums/like_status.enum';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findCommentsByPostId(
    query: CommentQueryModel,
    postId: number,
    userId: number | null,
  ) {
    const comments = await this.getComments(query, postId, userId);

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

  async findComment(
    commentId: number,
    userId?: number | null,
  ): Promise<CommentViewModel | null> {
    const comments = await this.getCommentById(commentId, userId);

    const mappedPosts = await this.commentsMapping(comments);

    if (mappedPosts.length === 0) {
      return null;
    }

    return mappedPosts[0];
  }

  private async getComments(
    query: CommentQueryModel,
    postId: number,
    userId: number | null,
  ) {
    return await this.dataSource.query(
      `WITH 
              CommentLikes AS (
                  SELECT "commentId", COUNT(*) as "likesCount" 
                  FROM public.comment_likes 
                  WHERE "likeStatus" = 'Like' 
                  GROUP BY "commentId"
              ),
              CommentDislikes AS (
                  SELECT "commentId", COUNT(*) as "dislikesCount" 
                  FROM public.comment_likes 
                  WHERE "likeStatus" = 'Dislike' 
                  GROUP BY "commentId"
              ),
              UserLikeStatus AS (
                  SELECT "commentId", "likeStatus" 
                  FROM public.comment_likes 
                  WHERE "userId" = $2
              )
            SELECT 
                c.id,
                c.content,
                u.id as "userId",
                u.login as "userLogin",
                c."createdAt",
                COALESCE(cl."likesCount", 0) as "likesCount",
                COALESCE(pd."dislikesCount", 0) as "dislikesCount",
                COALESCE(uls."likeStatus", 'None') as "myStatus"
            FROM 
              public.comments c
            LEFT JOIN public.users u
                ON c."commentatorId" = u.id
            LEFT JOIN 
              CommentLikes cl ON c.id = cl."commentId"
            LEFT JOIN 
              CommentDislikes pd ON c.id = pd."commentId"
            LEFT JOIN 
              UserLikeStatus uls ON c.id = uls."commentId"
            WHERE 
                c."postId" = $1
            GROUP BY 
                c.id, u.id, u.login, c."createdAt", cl."likesCount", pd."dislikesCount", uls."likeStatus"
            ORDER BY 
                "${query.sortBy}" 
                ${query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''} 
                ${query.sortDirection}
            LIMIT 
                ${query.pageSize} OFFSET (${query.pageNumber} - 1) * ${
        query.pageSize
      };
            `,
      [postId, userId],
    );
  }

  private async getCommentById(commentId: number, userId: number | null) {
    return await this.dataSource.query(
      `WITH 
              CommentLikes AS (
                  SELECT "commentId", COUNT(*) as "likesCount" 
                  FROM public.comment_likes 
                  WHERE "likeStatus" = 'Like' 
                  GROUP BY "commentId"
              ),
              CommentDislikes AS (
                  SELECT "commentId", COUNT(*) as "dislikesCount" 
                  FROM public.comment_likes 
                  WHERE "likeStatus" = 'Dislike' 
                  GROUP BY "commentId"
              ),
              UserLikeStatus AS (
                  SELECT "commentId", "likeStatus" 
                  FROM public.comment_likes 
                  WHERE "userId" = $2
              )
            SELECT 
                c.id,
                c.content,
                u.id as "userId",
                u.login as "userLogin",
                c."createdAt",
                COALESCE(cl."likesCount", 0) as "likesCount",
                COALESCE(pd."dislikesCount", 0) as "dislikesCount",
                COALESCE(uls."likeStatus", 'None') as "myStatus"
            FROM 
              public.comments c
            LEFT JOIN public.users u
                ON c."commentatorId" = u.id
            LEFT JOIN 
              CommentLikes cl ON c.id = cl."commentId"
            LEFT JOIN 
              CommentDislikes pd ON c.id = pd."commentId"
            LEFT JOIN 
              UserLikeStatus uls ON c.id = uls."commentId"
            WHERE 
                c.id = $1
            GROUP BY 
                c.id, u.id, u.login, c."createdAt", cl."likesCount", pd."dislikesCount", uls."likeStatus"
    `,
      [commentId, userId],
    );
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
          likesCount: +c.likesCount || +0,
          dislikesCount: +c.dislikesCount || +0,
          myStatus: c.myStatus || LikeStatus.NONE,
        },
      };
    });
  }
}
