import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { BlogInputModel } from '../api/models/input/blog-input-model';
import { Blog } from '../domain/blog.entity';
import { User } from '../../users/domain/user.entity';

@Injectable()
export class BlogsRepository {
  private readonly logger = new Logger(BlogsRepository.name);
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async createBlog(
    blogInputModel: BlogInputModel,
    user: User,
  ): Promise<number | boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const blog = new Blog();
      blog.user = user;
      blog.name = blogInputModel.name;
      blog.description = blogInputModel.description;
      blog.websiteUrl = blogInputModel.websiteUrl;
      blog.createdAt = new Date();
      blog.isMembership = false;

      const savedBlog = await queryRunner.manager.save(blog);

      await queryRunner.commitTransaction();
      return savedBlog.id;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(error);
      }
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async bindBlogWithUser(blogId: number, userId: number): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      const result = await this.dataSource
        .createQueryBuilder()
        .update(Blog)
        .set({
          ownerId: userId,
        })
        .where('id = :blogId', { blogId })
        .execute();

      return result.affected === 1;
    });
  }

  async updateBlog(
    blogInputModel: BlogInputModel,
    blogId: number,
  ): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      const result = await this.dataSource
        .createQueryBuilder()
        .update(Blog)
        .set({
          name: blogInputModel.name,
          description: blogInputModel.description,
          websiteUrl: blogInputModel.websiteUrl,
        })
        .where('id = :blogId', { blogId })
        .execute();

      return result.affected === 1;
    });
  }

  async deleteBlog(blogId: number): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Blog)
      .where('id= :blogId', { blogId })
      .execute();

    return result.affected === 1;
  }
}
