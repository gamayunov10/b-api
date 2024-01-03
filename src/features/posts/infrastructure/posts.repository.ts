import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PostInputModel } from '../api/models/input/post-input-model';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async createPostForSpecificBlog(
    postInputModel: PostInputModel,
    blogId: number,
  ): Promise<number> {
    const posts = await this.dataSource.query(
      `INSERT INTO public.posts 
                (title, "shortDescription", content, "blogId")
       VALUES ($1, $2, $3, $4)
       returning id;`,
      [
        postInputModel.title,
        postInputModel.shortDescription,
        postInputModel.content,
        blogId,
      ],
    );

    return posts[0].id;
  }

  async updatePost(
    postInputModel: PostInputModel,
    postId: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public.posts
              SET "title" = $1,
                   "shortDescription" = $2,
                   "content" = $3
       WHERE "id" = $4;`,
      [
        postInputModel.title,
        postInputModel.shortDescription,
        postInputModel.content,
        postId,
      ],
    );

    return result[1] === 1;
  }

  async deletePost(postId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE
              FROM public.posts
              WHERE id = $1;`,
      [postId],
    );

    return result[1] === 1;
  }
}
