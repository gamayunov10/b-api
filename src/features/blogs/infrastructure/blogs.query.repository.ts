import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { BlogViewModel } from '../api/models/output/blog-view.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { BlogQueryModel } from '../api/models/input/blog.query.model';
import { blogsFilter } from '../../../base/pagination/blogs-filter.paginator';
import { SABlogQueryModel } from '../api/models/input/sa-blog.query.model';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBlogs(query: BlogQueryModel) {
    const filter = blogsFilter(query.searchNameTerm);

    const blogs = await this.dataSource.query(
      `SELECT b.id,
              b.name,
              b.description,
              b."websiteUrl",
              b."createdAt",
              b."isMembership"
       FROM public.blogs b
       WHERE (name ILIKE $1)
       ORDER BY "${query.sortBy}" ${
        query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
      } ${query.sortDirection}
       LIMIT ${query.pageSize} OFFSET (${query.pageNumber} - 1) * ${
        query.pageSize
      }`,
      [filter.name],
    );

    const totalCount = await this.dataSource.query(
      `SELECT count(*)
       FROM public.blogs
       WHERE (name ILIKE $1);`,
      [filter.name],
    );

    return Paginator.paginate({
      pageNumber: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: +totalCount[0].count,
      items: await this.blogsMapping(blogs),
    });
  }

  async findBlogById(blogId: number): Promise<BlogViewModel | null> {
    const blogs = await this.dataSource.query(
      `SELECT 
                b.id,
                b.name,
                b.description,
                b."websiteUrl",
                b."createdAt",
                b."isMembership"
       FROM public.blogs b
       WHERE id = $1`,
      [blogId],
    );

    const mappedBlogs = await this.blogsMapping(blogs);
    return mappedBlogs[0];
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
