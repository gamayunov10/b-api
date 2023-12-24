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
    const users = await this.dataSource.query(
      `SELECT u.id,
              u.login,
              u.email,
              u."createdAt"
       FROM public.users u
       ORDER BY "${query.sortBy}" ${query.sortDirection}
       LIMIT ${query.pageSize} OFFSET (${query.pageNumber} - 1) * ${query.pageSize}
       `,
    );

    const totalCount = await this.dataSource.query(
      `SELECT count(*)
       FROM public.users`,
    );

    return Paginator.paginate({
      pageNumber: Number(query.pageNumber),
      pageSize: Number(query.pageSize),
      totalCount: Number(totalCount[0].count),
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
