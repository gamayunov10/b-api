import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CommentViewModel } from '../api/models/output/comment-view.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { CommentQueryModel } from '../api/models/input/comment.query.model';
import { LikeStatus } from '../../../base/enums/like_status.enum';
import { User } from '../../users/domain/user.entity';
import { Comment } from '../domain/comment.entity';
import { CommentLike } from '../domain/comment-like.entity';
import { BloggerCommentsViewModel } from '../../blogs/api/models/output/blogger-comments-view.model';
import { ICommentsForBlogSelect } from '../api/models/select/comments-for-blogger.select';
import { ICommentsSelect } from '../api/models/select/comments.select';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}
  async findCommentsByPostId(
    query: CommentQueryModel,
    postId: number,
    userId: number | null,
  ) {
    const sortDirection = query.sortDirection.toUpperCase();

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('c')
      .select([
        'c.id as id',
        'c.content as content',
        'u.id as "userId"',
        'u.login as "userLogin"',
        'c.createdAt as "createdAt"',
      ])
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.userBanInfo', 'ubi')
            .where('cl.commentId = c.id')
            .andWhere('ubi.isBanned = false')
            .andWhere(`cl.likeStatus = 'Like'`),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.userBanInfo', 'ubi')
            .where('cl.commentId = c.id')
            .andWhere('ubi.isBanned = false')
            .andWhere(`cl.likeStatus = 'Dislike'`),
        'dislikesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select('cl.likeStatus')
            .from(CommentLike, 'cl')
            .where('cl.commentId = c.id')
            .andWhere('cl.userId = :userId', { userId }),
        'myStatus',
      )
      .where('c."postId" = :postId', { postId })
      .andWhere('ubi.isBanned = false')
      .orderBy(
        `c."${query.sortBy}" ${
          query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize);

    const comments = await queryBuilder.getRawMany();
    const totalCount = await queryBuilder.getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.commentsMapping(comments),
    });
  }

  async findCommentsForBlogger(
    query: CommentQueryModel,
    userId: number | null,
  ) {
    const sortDirection = query.sortDirection.toUpperCase();

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('c')
      .select([
        'c.id as id',
        'c.content as content',
        'u.id as "userId"',
        'u.login as "userLogin"',
        'c.createdAt as "createdAt"',
        'p.id as "postId"',
        'p.title as title',
        'p.blogId as "blogId"',
        'p.blogName as "blogName"',
      ])
      .leftJoin('c.user', 'u')
      .leftJoin('c.post', 'p')
      .leftJoin('u.userBanInfo', 'ubi')
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.userBanInfo', 'ubi')
            .where('cl.commentId = c.id')
            .andWhere('ubi.isBanned = false')
            .andWhere(`cl.likeStatus = 'Like'`),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.userBanInfo', 'ubi')
            .where('cl.commentId = c.id')
            .andWhere('ubi.isBanned = false')
            .andWhere(`cl.likeStatus = 'Dislike'`),
        'dislikesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select('cl.likeStatus')
            .from(CommentLike, 'cl')
            .where('cl.commentId = c.id')
            .andWhere('cl.userId = :userId', { userId }),
        'myStatus',
      )
      .where('ubi.isBanned = false')
      .orderBy(
        `c."${query.sortBy}" ${
          query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize);

    const comments = await queryBuilder.getRawMany();
    const totalCount = await queryBuilder.getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.commentsMappingForBlogger(comments),
    });
  }

  async findComment(
    commentId: number,
    userId?: number | null,
  ): Promise<CommentViewModel> {
    const comment = await this.commentsRepository
      .createQueryBuilder('c')
      .select([
        'c.id as id',
        'c.content as content',
        'u.id as "userId"',
        'u.login as "userLogin"',
        'c.createdAt as "createdAt"',
      ])
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.userBanInfo', 'ubi')
            .where('cl.commentId = c.id')
            .andWhere('ubi.isBanned = false')
            .andWhere(`cl.likeStatus = 'Like'`),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`COUNT(*)`)
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.userBanInfo', 'ubi')
            .where('cl.commentId = c.id')
            .andWhere('ubi.isBanned = false')
            .andWhere(`cl.likeStatus = 'Dislike'`),
        'DislikesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select('cl.likeStatus')
            .from(CommentLike, 'cl')
            .where('cl.commentId = c.id')
            .andWhere('cl.userId = :userId', { userId }),
        'myStatus',
      )
      .leftJoin('c.user', 'u')
      .leftJoinAndSelect('u.userBanInfo', 'ubi')
      .where('c.id = :commentId', { commentId })
      .andWhere('ubi.isBanned = false')
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

  private async commentsMapping(
    comments: ICommentsSelect[],
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
          likesCount: +c.likesCount || 0,
          dislikesCount: +c.dislikesCount || 0,
          myStatus: c.myStatus || LikeStatus.NONE,
        },
      };
    });
  }

  private async commentsMappingForBlogger(
    comments: ICommentsForBlogSelect[],
  ): Promise<BloggerCommentsViewModel[]> {
    return comments.map((c: ICommentsForBlogSelect) => {
      return {
        id: c.id.toString(),
        content: c.content,
        commentatorInfo: {
          userId: c.userId.toString(),
          userLogin: c.userLogin,
        },
        createdAt: c.createdAt,
        likesInfo: {
          likesCount: +c.likesCount || 0,
          dislikesCount: +c.dislikesCount || 0,
          myStatus: c.myStatus || LikeStatus.NONE,
        },
        postInfo: {
          id: c.postId.toString(),
          title: c.title,
          blogId: c.blogId.toString(),
          blogName: c.blogName,
        },
      };
    });
  }
}
