import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import sharp from 'sharp';

import { BlogInputModel } from '../api/models/input/blog-input-model';
import { Blog } from '../domain/blog.entity';
import { User } from '../../users/domain/user.entity';
import { BlogBan } from '../domain/blog-ban.entity';
import { BlogMainImage } from '../domain/blog-main-image.entity';
import { TransactionHelper } from '../../../base/transactions/transaction.helper';
import { BlogWallpaperImage } from '../domain/blog-wallpaper-image.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly transactionHelper: TransactionHelper,
  ) {}

  async createBlog(
    blogInputModel: BlogInputModel,
    user: User,
  ): Promise<number | boolean> {
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        const blog = new Blog();
        blog.user = user;
        blog.name = blogInputModel.name;
        blog.description = blogInputModel.description;
        blog.websiteUrl = blogInputModel.websiteUrl;
        blog.createdAt = new Date();
        blog.isMembership = false;

        const savedBlog = await entityManager.save(blog);

        const blogBan = new BlogBan();
        blogBan.blog = blog;
        blogBan.isBanned = false;
        blogBan.banDate = null;
        await entityManager.save(blogBan);

        return savedBlog.id;
      },
    );
  }

  async banBlog(blog: Blog): Promise<boolean> {
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        await entityManager
          .createQueryBuilder()
          .update(BlogBan)
          .set({ isBanned: true, banDate: new Date() })
          .where('blogId = :blogId', { blogId: blog.id })
          .execute();

        return true;
      },
    );
  }

  async unBanBlog(blog: Blog): Promise<boolean> {
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        await entityManager
          .createQueryBuilder()
          .update(BlogBan)
          .set({ isBanned: false, banDate: null })
          .where('blogId = :blogId', { blogId: blog.id })
          .execute();

        return true;
      },
    );
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

  async uploadBlogWallpaperImage(
    metadata: sharp.Metadata,
    s3Key: string,
    blog: Blog,
  ): Promise<number | boolean> {
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        const wallpaperImage = new BlogWallpaperImage();
        wallpaperImage.blog = blog;
        wallpaperImage.url = s3Key;
        wallpaperImage.width = metadata.width;
        wallpaperImage.height = metadata.height;
        wallpaperImage.size = metadata.size;

        const savedMainImage = await entityManager.save(wallpaperImage);
        return savedMainImage.id;
      },
    );
  }

  async updateBlogWallpaperImage(
    metadata: sharp.Metadata,
    s3Key: string,
    blogId: number,
  ): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      const result = await this.dataSource
        .createQueryBuilder()
        .update(BlogWallpaperImage)
        .set({
          url: s3Key,
          width: metadata.width,
          height: metadata.height,
          size: metadata.size,
        })
        .where('blogId = :blogId', { blogId })
        .execute();

      return result.affected === 1;
    });
  }

  async uploadBlogMainImage(
    metadata: sharp.Metadata,
    s3Key: string,
    blog: Blog,
  ): Promise<number | boolean> {
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        const mainImage = new BlogMainImage();
        mainImage.blog = blog;
        mainImage.url = s3Key;
        mainImage.width = metadata.width;
        mainImage.height = metadata.height;
        mainImage.size = metadata.size;

        const savedMainImage = await entityManager.save(mainImage);
        return savedMainImage.id;
      },
    );
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
