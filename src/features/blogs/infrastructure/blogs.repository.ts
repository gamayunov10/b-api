import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { BlogInputModel } from '../api/models/input/blog-input-model';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async createBlog(blogInputModel: BlogInputModel): Promise<number> {
    return this.dataSource.transaction(async () => {
      const blog = await this.dataSource.query(
        `INSERT INTO public.blogs 
                    (name, description, "websiteUrl", "isMembership")
         VALUES ($1, $2, $3, $4)
         RETURNING id;`,
        [
          blogInputModel.name,
          blogInputModel.description,
          blogInputModel.websiteUrl,
          true,
        ],
      );

      return blog[0].id;
    });
  }

  async updateBlog(
    blogInputModel: BlogInputModel,
    blogId: number,
  ): Promise<boolean> {
    try {
      return this.dataSource.transaction(async () => {
        await this.dataSource.query(
          `UPDATE public.blogs 
                  SET    name = $2, description = $3, "websiteUrl" = $4
                  WHERE id = $1;`,
          [
            blogId,
            blogInputModel.name,
            blogInputModel.description,
            blogInputModel.websiteUrl,
          ],
        );

        return true;
      });
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteBlog(blogId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE
       FROM public.blogs
       WHERE id = $1;`,
      [blogId],
    );

    return result[1] === 1;
  }
}
