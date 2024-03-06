import { Controller, Delete, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { SwaggerOptions } from '../infrastructure/decorators/swagger';

@ApiTags('testing')
@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Delete('all-data')
  @SwaggerOptions(
    'Clear database: delete all data from all tables/collections',
    false,
    false,
    204,
    'All data is deleted',
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  )
  @HttpCode(204)
  async deleteAll() {
    await this.dataSource.query(
      `
        DELETE FROM public.comment_likes;
        DELETE FROM public.comments;
        DELETE FROM public.user_email_confirmation;
        DELETE FROM public.user_ban_info;
        DELETE FROM public.blog_bans;
        DELETE FROM public.blog_wallpaper_images;
        DELETE FROM public.blog_main_images;
        DELETE FROM public.tg_blog_subscribers;
        DELETE FROM public.user_password_recovery;
        DELETE FROM public.users; 
        DELETE FROM public.device_auth_sessions;
        DELETE FROM public.blogs;
        DELETE FROM public.post_likes;
        DELETE FROM public.posts;
        DELETE FROM public.quiz_answers;
        DELETE FROM public.quiz_games;
        DELETE FROM public.quiz_players;
        DELETE FROM public.quiz_questions;
        DELETE FROM public.quiz_questions_games_quiz_games;
        `,
    );
  }
}
