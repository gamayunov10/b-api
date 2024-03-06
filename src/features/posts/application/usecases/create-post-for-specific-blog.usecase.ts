import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { PostInputModel } from '../../api/models/input/post-input-model';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import {
  blogIdField,
  blogNotFound,
  userIdField,
  userNotFound,
} from '../../../../base/constants/constants';
import { Role } from '../../../../base/enums/roles.enum';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { TgBlogSubscribersQueryRepository } from '../../../integrations/telegram/infrastructure/tg.blog.subscribers.query.repository';
import { TelegramAdapter } from '../../../integrations/telegram/adapters/telegram.adapter';
import { TgBlogSubscriber } from '../../../integrations/telegram/domain/tg.blog.subscriber.entity';

export class PostCreatePostForSpecificBlogCommand {
  constructor(
    public postInputModel: PostInputModel,
    public blogId: string,
    public userId?: string,
    public role?: Role,
  ) {}
}

@CommandHandler(PostCreatePostForSpecificBlogCommand)
export class PostCreatePostForSpecificBlogUseCase
  implements ICommandHandler<PostCreatePostForSpecificBlogCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly tgBlogSubscribersQueryRepository: TgBlogSubscribersQueryRepository,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  async execute(
    command: PostCreatePostForSpecificBlogCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.blogId)) {
      throw new NotFoundException();
    }

    const blog = await this.blogsQueryRepository.findBlogWithOwner(
      +command.blogId,
    );

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIdField,
        message: blogNotFound,
      };
    }

    const blogName = blog.name;

    if (command.role === Role.BLOGGER) {
      if (isNaN(+command.userId)) {
        throw new NotFoundException();
      }

      const user = await this.usersQueryRepository.findUserById(
        +command.userId,
      );

      if (!user) {
        return {
          data: false,
          code: ResultCode.BadRequest,
          field: userIdField,
          message: userNotFound,
        };
      }

      if (blog.userId !== +command.userId) {
        return {
          data: false,
          code: ResultCode.Forbidden,
        };
      }
    }

    const postId = await this.postsRepository.createPostForSpecificBlog(
      command.postInputModel,
      +command.blogId,
      blogName,
    );

    await this.sendTelegramNotification(+command.blogId, blog.name);

    return {
      data: true,
      code: ResultCode.Success,
      response: postId,
    };
  }

  private async sendTelegramNotification(blogId: number, blogName: string) {
    const recipients: TgBlogSubscriber[] =
      await this.tgBlogSubscribersQueryRepository.findSubscribersForTelegramNotification(
        blogId,
      );

    if (recipients?.length === 0) {
      return null;
    }

    const message = `New post published for blog ${blogName}`;

    recipients.forEach((s: TgBlogSubscriber) => {
      return this.telegramAdapter.sendMessage(message, s.telegramId);
    });

    return recipients;
  }
}
