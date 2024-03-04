import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { BlogViewModel } from '../api/models/output/blog-view.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { BlogQueryModel } from '../api/models/input/blog.query.model';
import { blogsFilter } from '../../../base/pagination/blogs-filter.paginator';
import { Blog } from '../domain/blog.entity';
import { BlogOwnerStatus } from '../../../base/enums/blog-owner.enum';
import { BlogWithOwnerViewModel } from '../api/models/output/blog-with-owner-view.model';
import { IFindBlogsWithBanInfoSelect } from '../api/models/select/find-blogs-with-ban-info.select';
import { IBlogsSelect } from '../api/models/select/blogs.select';
import { BlogImagesViewModel } from '../api/models/output/blog-images-view.model';
import { BlogWallpaperImage } from '../domain/blog-wallpaper-image.entity';
import { BlogMainImage } from '../domain/blog-main-image.entity';

@Injectable()
export class BlogsQueryRepository {
  private readonly logger = new Logger(BlogsQueryRepository.name);
  private configService: ConfigService;
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectDataSource() private dataSource: DataSource,
    configService: ConfigService,
  ) {
    this.configService = configService;
  }

  async findBlogs(query: BlogQueryModel) {
    const filter = blogsFilter(query.searchNameTerm);
    const sortDirection = query.sortDirection.toUpperCase();

    const queryBuilder = this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'b.id as id',
        'b.name as name',
        'b.description as description',
        'b.websiteUrl as "websiteUrl"',
        'b.createdAt as "createdAt"',
        'b.isMembership as "isMembership"',
      ])
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`url, width, height, size`)
                .from(BlogMainImage, 'bmi')
                .where('bmi.blogId = b.id');
            }, 'agg'),

        'mainImages',
      )
      .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
      .leftJoin('b.blogBan', 'bb')
      .where('b.name ILIKE :name', { name: filter.name })
      .andWhere('bb.isBanned = false')
      .orderBy(
        `"${query.sortBy}" ${
          query.sortBy.toLowerCase() !== 'createdat' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize);

    const blogs = await queryBuilder.getRawMany();

    return Paginator.paginate({
      pageNumber: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: blogs.length,
      items: await this.blogsMapping(blogs),
    });
  }

  async findBlogsWithBanInfo(query: BlogQueryModel) {
    const sortDirection = query.sortDirection.toUpperCase();

    const queryBuilder = this.blogsRepository
      .createQueryBuilder('b')
      .where(`${query.searchNameTerm ? 'b.name ILIKE :nameTerm' : ''}`, {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .addSelect('u.id')
      .addSelect('u.login')
      .addSelect('bb.isBanned')
      .addSelect('bb.banDate')
      .leftJoin('b.user', 'u')
      .leftJoin('b.blogBan', 'bb')
      .orderBy(
        `b."${query.sortBy}" ${
          query.sortBy.toLowerCase() !== 'createdat' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize);

    const blogs = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.SABlogsMapping(blogs),
    });
  }

  async findBlogById(blogId: number): Promise<BlogViewModel | null> {
    const blog = await this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'b.id as id',
        'b.name as name',
        'b.description as description',
        'b.websiteUrl as "websiteUrl"',
        'b.createdAt as "createdAt"',
        'b.isMembership as "isMembership"',
      ])
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select('url, width, height, size')
                .from(BlogMainImage, 'bmi')
                .where('bmi.blogId = b.id');
            }, 'agg'),

        'mainImages',
      )
      .leftJoin('b.blogBan', 'bb')
      .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
      .where('b.id = :blogId', { blogId })
      .andWhere('bb.isBanned = false')
      .getRawMany();

    if (!blog) {
      return null;
    }

    const mappedBlog = await this.blogsMapping(blog);

    return mappedBlog[0];
  }
  async findBlogsByOwnerId(query: BlogQueryModel, userId: number) {
    const filter = blogsFilter(query.searchNameTerm);
    const sortDirection = query.sortDirection.toUpperCase();

    const queryBuilder = this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'b.id as id',
        'b.name as name',
        'b.description as description',
        'b.websiteUrl as "websiteUrl"',
        'b.createdAt as "createdAt"',
        'b.isMembership as "isMembership"',
      ])
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'size', agg.size)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`url, width, height, size`)
                .from(BlogMainImage, 'bmi')
                .where('bmi.blogId = b.id');
            }, 'agg'),

        'mainImages',
      )
      .where('b.name ILIKE :name', { name: filter.name })
      .andWhere(`u.id = :userId`, {
        userId,
      })
      .leftJoin('b.user', 'u')
      .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
      .orderBy(
        `b."${query.sortBy}" ${
          query.sortBy.toLowerCase() !== 'createdat' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize);

    const blogs = await queryBuilder.getRawMany();
    const totalCount = await queryBuilder.getCount();

    return Paginator.paginate({
      pageNumber: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: totalCount,
      items: await this.blogsMapping(blogs),
    });
  }

  async findBlogWithOwner(
    blogId: number,
  ): Promise<BlogWithOwnerViewModel | null> {
    const blog = await this.dataSource
      .createQueryBuilder()
      .select([
        'b.id as id',
        'b.name as name',
        'b.description as description',
        'b.websiteUrl as "websiteUrl"',
        'b.createdAt as "createdAt"',
        'b.isMembership as "isMembership"',
      ])
      .addSelect('u.id as "userId"')
      .addSelect('u.login as "login"')
      .from(Blog, 'b')
      .leftJoin('b.user', 'u')
      .where('b.id = :blogId', { blogId })
      .execute();

    if (blog.length === 0) {
      return null;
    }

    return blog[0];
  }

  async findBlogEntity(blogId: number): Promise<Blog | null> {
    const blog = await this.blogsRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'u')
      .where('b.id = :blogId', { blogId })
      .getOne();

    if (!blog) {
      return null;
    }

    return blog;
  }

  async findBlogWallpaperImageRecord(
    blogId: number,
  ): Promise<BlogWallpaperImage | boolean> {
    try {
      return await this.dataSource
        .createQueryBuilder()
        .from(BlogWallpaperImage, 'bwi')
        .where(`bwi.blogId = :blogId`, { blogId })
        .getOne();
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }
      return false;
    }
  }

  async findBlogMainImages(blogId: number) {
    try {
      const blogs = await this.blogsRepository
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.blogMainImages', 'bmi')
        .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
        .where(`b.id = :blogId`, {
          blogId,
        })
        .getMany();

      const mappedBlogs = await this.blogMainImagesMapping(blogs);
      return mappedBlogs[0];
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }
      return false;
    }
  }

  async findBlogImages(blogId: number): Promise<BlogImagesViewModel | boolean> {
    try {
      const blogs = await this.blogsRepository
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.blogWallpaperImage', 'bwi')
        .leftJoinAndSelect('b.blogMainImages', 'bmi')
        .where(`b.id = :blogId`, {
          blogId,
        })
        .getMany();

      const mappedBlogs = await this.blogImagesMapping(blogs);
      return mappedBlogs[0];
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }
      return false;
    }
  }

  private async blogImagesMapping(blogs: Blog[]) {
    return blogs.map((b) => {
      const wallpaperImage = {
        url:
          process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN + b.blogWallpaperImage.url,
        width: Number(b.blogWallpaperImage.width),
        height: Number(b.blogWallpaperImage.height),
        fileSize: Number(b.blogWallpaperImage.size),
      };

      return {
        wallpaper: wallpaperImage,
        main: b.blogMainImages.map((bmi) => {
          return {
            url: process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN + bmi.url,
            width: Number(bmi.width),
            height: Number(bmi.height),
            fileSize: Number(bmi.size),
          };
        }),
      };
    });
  }

  private async blogMainImagesMapping(blogs) {
    return blogs.map((b) => {
      let wallpaperImage = null;
      let mainImages = [];

      if (b?.blogWallpaperImage) {
        wallpaperImage = {
          url:
            process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN +
            b.blogWallpaperImage.url,
          width: Number(b.blogWallpaperImage.width),
          height: Number(b.blogWallpaperImage.height),
          fileSize: Number(b.blogWallpaperImage.size),
        };
      }

      if (b?.blogMainImages) {
        mainImages = b.blogMainImages.map((bmi) => {
          return {
            url: process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN + bmi.url,
            width: Number(bmi.width),
            height: Number(bmi.height),
            fileSize: Number(bmi.size),
          };
        });
      }

      return {
        wallpaper: wallpaperImage,
        main: mainImages,
      };
    });
  }

  private async blogsMapping(array): Promise<BlogViewModel[]> {
    return array.map((b: IBlogsSelect) => {
      let wallpaperImage = null;
      let mainImages = [];

      if (b?.bwi_url) {
        wallpaperImage = {
          url: process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN + b.bwi_url,
          width: Number(b.bwi_width),
          height: Number(b.bwi_height),
          fileSize: Number(b.bwi_size),
        };
      }

      if (b?.mainImages) {
        mainImages = b.mainImages.map((bmi) => {
          return {
            url: process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN + bmi.url,
            width: Number(bmi.width),
            height: Number(bmi.height),
            fileSize: Number(bmi.size),
          };
        });
      }

      return {
        id: b.id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        images: {
          wallpaper: wallpaperImage,
          main: mainImages,
        },
      };
    });
  }

  private async SABlogsMapping(array: IFindBlogsWithBanInfoSelect[]) {
    return array.map((b: IFindBlogsWithBanInfoSelect) => {
      return {
        id: b.id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        blogOwnerInfo: {
          userId: b.user.id.toString() ?? BlogOwnerStatus.NOT_BOUND,
          userLogin: b.user.login ?? BlogOwnerStatus.NOT_BOUND,
        },
        banInfo: {
          isBanned: b.blogBan.isBanned ?? false,
          banDate: b.blogBan.banDate ?? null,
        },
      };
    });
  }
}
