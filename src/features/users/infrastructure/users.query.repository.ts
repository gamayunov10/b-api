import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UserQueryModel } from '../api/models/input/user.query.model';
import { SuperAdminUserViewModel } from '../api/models/output/user-view.model';
import { UserTestManagerModel } from '../api/models/output/user-test-manager.model';
import { usersFilter } from '../../../base/pagination/users-filter.paginator';
import { Paginator } from '../../../base/pagination/_paginator';

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

  async getUserByLoginOrEmailForTesting(
    loginOrEmail: string,
  ): Promise<UserTestManagerModel | null> {
    const users = await this.dataSource.query(
      `SELECT  
                e."confirmationCode" as "emailConfirmationCode",
                e."expirationDate" as "emailExpirationDate", 
                p."recoveryCode" as "passwordRecoveryCode",
                p."expirationDate" as "passwordExpirationDate",
                d."deviceId"
              FROM public.users u
              LEFT JOIN public.user_email_confirmation e
              ON e."userId" = u.id
              LEFT JOIN public.user_password_recovery p
              ON p."userId" = u.id
              LEFT JOIN public.devices d
              ON d."userId" = u.id
              WHERE login = $1
              OR email = $1;`,
      [loginOrEmail],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0] as UserTestManagerModel;
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
