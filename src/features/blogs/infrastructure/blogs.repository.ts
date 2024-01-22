import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { BlogInputModel } from '../api/models/input/blog-input-model';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async createBlog(blogInputModel: BlogInputModel): Promise<number> {
    return this.dataSource.transaction(async () => {
      const blog = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Blog)
        .values({
          name: blogInputModel.name,
          description: blogInputModel.description,
          websiteUrl: blogInputModel.websiteUrl,
          isMembership: false,
        })
        .returning('id')
        .execute();

      return blog.identifiers[0].id;
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
        .where('id = :id', { id: blogId })
        .execute();

      return result.affected === 1;
    });
  }

  async deleteBlog(blogId: number): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Blog)
      .where('id= :id', { id: blogId })
      .execute();

    return result.affected === 1;
  }
}
