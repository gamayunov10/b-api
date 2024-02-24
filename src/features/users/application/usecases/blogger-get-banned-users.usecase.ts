import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { UserBloggerQueryModel } from '../../api/models/input/user-blogger.query.model';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';
import { UsersQueryRepository } from '../../infrastructure/users.query.repository';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
} from '../../../../base/constants/constants';
import { Paginator } from '../../../../base/pagination/_paginator';
import { BloggerUserViewModel } from '../../api/models/output/blogger-user-view.model';

export class BloggerGetBannedUsersQuery {
  constructor(
    public userBloggerQueryModel: UserBloggerQueryModel,
    public blogId: string,
    public userId: string,
  ) {}
}

@QueryHandler(BloggerGetBannedUsersQuery)
export class BloggerGetBannedUsersUseCase
  implements IQueryHandler<BloggerGetBannedUsersQuery>
{
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    query: BloggerGetBannedUsersQuery,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+query.userId) || isNaN(+query.blogId)) {
      throw new UnauthorizedException();
    }

    const blog = await this.blogsQueryRepository.findBlogWithOwner(
      +query.blogId,
    );

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIdField,
        message: blogNotFound,
      };
    }

    if (blog.userId !== +query.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const response: Paginator<BloggerUserViewModel[]> =
      await this.usersQueryRepository.findUsersBannedByBlogger(
        query.userBloggerQueryModel,
        blog.id,
      );

    return {
      data: true,
      code: ResultCode.Success,
      response: response,
    };
  }
}
