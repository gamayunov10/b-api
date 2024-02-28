import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { BlogViewModel } from '../api/models/output/blog-view.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { BlogQueryModel } from '../api/models/input/blog.query.model';
import { blogsFilter } from '../../../base/pagination/blogs-filter.paginator';
import { Blog } from '../domain/blog.entity';
import { BlogOwnerStatus } from '../../../base/enums/blog-owner.enum';
import { BlogWithOwnerViewModel } from '../api/models/output/blog-with-owner-view.model';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findBlogs(query: BlogQueryModel) {
    const filter = blogsFilter(query.searchNameTerm);
    const sortDirection = query.sortDirection.toUpperCase();

    const queryBuilder = this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'b.id',
        'b.name',
        'b.description',
        'b.websiteUrl',
        'b.createdAt',
        'b.isMembership',
      ])
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

    const blogs = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();

    return Paginator.paginate({
      pageNumber: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: totalCount,
      items: await this.blogsMapping(blogs),
    });
  }

  async findBlogsWithBanInfo(
    query: BlogQueryModel,
  ): Promise<Paginator<BlogViewModel[]>> {
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
        'b.id',
        'b.name',
        'b.description',
        'b.websiteUrl',
        'b.createdAt',
        'b.isMembership',
      ])
      .leftJoin('b.blogBan', 'bb')
      .where('b.id = :blogId', { blogId })
      .andWhere('bb.isBanned = false')
      .getOne();

    if (!blog) {
      return null;
    }

    const mappedBlog = await this.blogsMapping([blog]);

    return mappedBlog[0];
  }
  async findBlogsByOwnerId(query: BlogQueryModel, userId: number) {
    const filter = blogsFilter(query.searchNameTerm);
    const sortDirection = query.sortDirection.toUpperCase();

    const blogs = await this.blogsRepository
      .createQueryBuilder('b')
      .where('b.name ILIKE :name', { name: filter.name })
      .andWhere(`u.id = :userId`, {
        userId,
      })
      .leftJoin('b.user', 'u')
      .orderBy(
        `b."${query.sortBy}" ${
          query.sortBy.toLowerCase() !== 'createdat' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize)
      .getMany();

    const totalCount = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(Blog, 'b')
      .where('b.name ILIKE :name', { name: filter.name })
      .andWhere(`u.id = :userId`, {
        userId,
      })
      .leftJoin('b.user', 'u')
      .getCount();

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

  private async SABlogsMapping(array: any): Promise<BlogViewModel[]> {
    return array.map((b) => {
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
