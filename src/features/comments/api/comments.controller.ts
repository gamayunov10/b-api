import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
  commentIDField,
  commentNotFound,
} from '../../../base/constants/constants';
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Returns comment by id',
  })
  async findCommentById(@Param('id') commentId: string) {
    if (isNaN(+commentId)) {
      throw new NotFoundException();
    }

    const result = await this.commentsQueryRepository.findComment(+commentId);

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        commentNotFound,
        commentIDField,
      );
    }

    return result;
  }
}
