import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { usersFilter } from 'src/base/pagination/users-filter.paginator';
import { Paginator } from 'src/base/pagination/_paginator';

import { UserQueryModel } from '../api/models/input/user.query.model';
import { SuperAdminUserViewModel } from '../api/models/output/user-view.model';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUsers(query: UserQueryModel) {
    const filter = usersFilter(query.searchLoginTerm, query.searchEmailTerm);
    const users = await this.dataSource.query(
      `SELECT u.id,
              u.login,
              u.email,
              u."createdAt"
       FROM public.users u
       WHERE (login ILIKE $1 or email ILIKE $2)
       ORDER BY "${query.sortBy}" ${
        query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
      } ${query.sortDirection}
       LIMIT ${query.pageSize} OFFSET (${query.pageNumber} - 1) * ${
        query.pageSize
      }`,
      [filter.login, filter.email],
    );

    const totalCount = await this.dataSource.query(
      `SELECT count(*)
       FROM public.users
       WHERE (login ILIKE $1 or email ILIKE $2);`,
      [filter.login, filter.email],
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
