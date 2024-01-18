import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { BlogViewModel } from '../api/models/output/blog-view.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { BlogQueryModel } from '../api/models/input/blog.query.model';
import { blogsFilter } from '../../../base/pagination/blogs-filter.paginator';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findBlogs(query: BlogQueryModel) {
    const filter = blogsFilter(query.searchNameTerm);

    const blogs = await this.dataSource
      .createQueryBuilder()
      .select([
        'b.id',
        'b.name',
        'b.description',
        'b.websiteUrl',
        'b.createdAt',
        'b.isMembership',
      ])
      .from(Blog, 'b')
      .where('b.name ILIKE :name', { name: filter.name })
      .orderBy(`b.${query.sortBy}`, query.sortDirection)
      .skip((+query.pageNumber - 1) * +query.pageSize)
      .take(+query.pageSize)
      .getMany();

    const totalCount = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(Blog, 'b')
      .where('b.name ILIKE :name', { name: filter.name })
      .getCount();

    return Paginator.paginate({
      pageNumber: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: totalCount,
      items: await this.blogsMapping(blogs),
    });
  }

  async findBlogById(blogId: number): Promise<BlogViewModel | null> {
    const blog = await this.dataSource
      .createQueryBuilder()
      .select([
        'b.id',
        'b.name',
        'b.description',
        'b.websiteUrl',
        'b.createdAt',
        'b.isMembership',
      ])
      .from(Blog, 'b')
      .where('b.id = :blogId', { blogId })
      .getOne();

    if (!blog) {
      return null;
    }

    const mappedBlog = await this.blogsMapping([blog]);

    return mappedBlog[0];
  }

  private async blogsMapping(array: any): Promise<BlogViewModel[]> {
    return array.map((b) => {
      return {
        id: b.id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
      };
    });
  }
}
