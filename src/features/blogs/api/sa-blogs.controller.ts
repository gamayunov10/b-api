import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';
import { ErrorsMessages } from '../../../base/schemas/api-errors-messages.schema';
import { BlogBindWithUserCommand } from '../application/usecases/bind-blog-with-user.usecase';
import { SABlogSchema } from '../../../base/schemas/sa-blog-schema';
import { SABlogBanCommand } from '../application/usecases/blog-ban.usecase';

import { BlogQueryModel } from './models/input/blog.query.model';
import { BanBlogInputModel } from './models/input/ban-blog-input.model';

@ApiTags('sa/blogs')
@Controller('sa/blogs')
export class SABlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  @Get()
  @SwaggerOptions(
    'Returns all blogs with paging',
    false,
    true,
    200,
    'Success',
    SABlogSchema,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(BasicAuthGuard)
  async findBlogs(@Query() query: BlogQueryModel) {
    return this.blogsQueryRepository.findBlogsWithBanInfo(query);
  }

  @Put(':blogId/ban')
  @SwaggerOptions(
    'Ban/unban blog',
    false,
    true,
    204,
    'No Content',
    SABlogSchema,
    true,
    ErrorsMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async banOperation(
    @Param('blogId') blogId: string,
    @Body() banBlogInputModel: BanBlogInputModel,
  ) {
    const result = await this.commandBus.execute(
      new SABlogBanCommand(banBlogInputModel, blogId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Put(':blogId/bind-with-user/:userId')
  @SwaggerOptions(
    "Bind Blog with user (if blog doesn't have an owner yet)",
    false,
    true,
    204,
    'No Content',
    false,
    'If the inputModel has incorrect values or blog already bound to any user',
    ErrorsMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async bindBlogWithUser(
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BlogBindWithUserCommand(blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
