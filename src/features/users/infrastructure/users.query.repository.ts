import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UserQueryModel } from '../api/models/input/user.query.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { SuperAdminUserViewModel } from '../api/models/output/user-view.model';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUsers(query: UserQueryModel) {
    const whereConditions = [];
    const params = [];

    if (query.searchLoginTerm) {
      whereConditions.push(`u.login ILIKE $${params.length + 1}`);
      params.push(`%${query.searchLoginTerm}%`);
    }

    if (query.searchEmailTerm) {
      whereConditions.push(`u.email ILIKE $${params.length + 1}`);
      params.push(`%${query.searchEmailTerm}%`);
    }

    let whereClause = '';
    if (whereConditions.length > 0) {
      whereClause = 'WHERE ' + whereConditions.join(' AND ');
    }

    const users = await this.dataSource.query(
      `SELECT u.id, u.login, u.email, u."createdAt"
       FROM public.users u
       ${whereClause}
       ORDER BY "${query.sortBy}" ${query.sortDirection}
       LIMIT $${params.length + 1} OFFSET ($${params.length + 2} - 1) * $${
        params.length + 3
      }`,
      [...params, query.pageSize, query.pageNumber, query.pageSize],
    );

    const totalCount = await this.dataSource.query(
      `SELECT count(*)
       FROM public.users u
       ${whereClause}`,
      params,
    );

    return Paginator.paginate({
      pageNumber: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: +totalCount[0].count,
      items: await this.usersMapping(users),
    });
  }

  async findUserById(id: number): Promise<SuperAdminUserViewModel> {
    const users = await this.dataSource.query(
      `SELECT u.id,
              u.login,
              u.email,
              u."createdAt"
       FROM public.users u
       WHERE id = $1`,
      [id],
    );

    const mappedUsers = await this.usersMapping(users);
    return mappedUsers[0];
  }

  private async usersMapping(array: any): Promise<SuperAdminUserViewModel[]> {
    return array.map((u) => {
      return {
        id: u.id.toString(),
        login: u.login,
        email: u.email,
        createdAt: u.createdAt,
      };
    });
  }
}
