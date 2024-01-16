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
    await this.dataSource.query(`DELETE FROM public.users;`);
    await this.dataSource.query(`DELETE FROM public.device_auth_sessions;`);
    await this.dataSource.query(`DELETE FROM public.user_email_confirmation;`);
    await this.dataSource.query(`DELETE FROM public.user_password_recovery;`);
    await this.dataSource.query(`DELETE FROM public.blogs;`);
    await this.dataSource.query(`DELETE FROM public.posts;`);
  }
}
