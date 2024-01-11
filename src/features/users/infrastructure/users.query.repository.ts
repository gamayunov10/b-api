import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UserQueryModel } from '../api/models/input/user.query.model';
import { SuperAdminUserViewModel } from '../api/models/output/sa-user-view.model';
import { UserTestManagerModel } from '../api/models/output/user-test-manager.model';
import { usersFilter } from '../../../base/pagination/users-filter.paginator';
import { Paginator } from '../../../base/pagination/_paginator';
import { User } from '../domain/user.entity';
import { UserPasswordRecovery } from '../domain/user-password-recovery.entity';
import { isValidUuid } from '../../../base/utils/is-valid-uuid';
import { UserEmailConfirmation } from '../domain/user-email-confirmation.entity';

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

  async findUserByIdBool(id: number): Promise<boolean> {
    if (isNaN(id)) {
      return false;
    }

    const users = await this.dataSource.query(
      `SELECT u.id
       FROM public.users u
       WHERE id = $1;`,
      [id],
    );

    return users.length !== 0;
  }

  async findUserByLogin(login: string): Promise<User[] | null> {
    const users = await this.dataSource.query(
      `SELECT id
       FROM public.users
       WHERE login = $1`,
      [login],
    );

    if (users.length === 0) {
      return null;
    }

    return users;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = await this.dataSource.query(
      `SELECT id, login, email 
       FROM public.users
       WHERE email = $1`,
      [email],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async findPasswordRecoveryRecord(
    code: string,
  ): Promise<UserPasswordRecovery> {
    if (!isValidUuid(code)) {
      return null;
    }

    const users = await this.dataSource.query(
      `SELECT *
       FROM user_password_recovery
       WHERE "recoveryCode" = $1`,
      [code],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async findUserForEmailResending(email: string): Promise<User | null> {
    const users = await this.dataSource.query(
      `SELECT u.id, u.login, u, email, u."isConfirmed", e."confirmationCode"
              FROM public.users u
              LEFT JOIN public.user_email_confirmation e
              ON u.id = e."userId"
              WHERE email = $1;`,
      [email],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async findUserByEmailConfirmationCode(
    code: string,
  ): Promise<(User & UserEmailConfirmation) | null> {
    if (!isValidUuid(code)) {
      return null;
    }

    const users = await this.dataSource.query(
      `SELECT u.id, u."isConfirmed", e."confirmationCode", e."expirationDate"
              FROM public.users u
              LEFT JOIN public.user_email_confirmation e
              ON u.id = e."userId"
              WHERE e."confirmationCode" = $1;`,
      [code],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const users = await this.dataSource.query(
      `SELECT id, "passwordHash", "isConfirmed"
              FROM public.users
              WHERE login = $1
              OR email = $1;`,
      [loginOrEmail],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
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
              LEFT JOIN public.device_auth_sessions d
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
