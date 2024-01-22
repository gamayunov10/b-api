import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ILike, Like } from 'typeorm';

import { UserQueryModel } from '../api/models/input/user.query.model';
import { SuperAdminUserViewModel } from '../api/models/output/sa-user-view.model';
import { UserTestManagerModel } from '../api/models/output/user-test-manager.model';
import { usersFilter } from '../../../base/pagination/users-filter.paginator';
import { Paginator } from '../../../base/pagination/_paginator';
import { User } from '../domain/user.entity';
import { UserPasswordRecovery } from '../domain/user-password-recovery.entity';
import { isValidUuid } from '../../../base/utils/is-valid-uuid';
import { UserEmailConfirmation } from '../domain/user-email-confirmation.entity';
import { DeviceAuthSessions } from '../../devices/domain/device.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUsers(query: UserQueryModel) {
    const filter = usersFilter(query.searchLoginTerm, query.searchEmailTerm);
    const sortDirection = query.sortDirection.toUpperCase();
    const users = await this.dataSource
      .createQueryBuilder()
      .select(['u.id', 'u.login', 'u.email', 'u.createdAt'])
      .from(User, 'u')
      .where('u.login ILike :login', { login: filter.login })
      .orWhere('u.email ILike :email', { email: filter.email })
      .orderBy(
        `"${query.sortBy}" ${
          query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .skip((+query.pageNumber - 1) * +query.pageSize)
      .take(+query.pageSize)
      .getMany();

    const totalCount = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(User, 'u')
      .where('u.login ILIKE :login', { login: filter.login })
      .orWhere('u.email ILIKE :email', { email: filter.email })
      .getCount();

    return Paginator.paginate({
      pageNumber: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: totalCount,
      items: await this.usersMapping(users),
    });
  }

  async findUserById(id: number): Promise<SuperAdminUserViewModel> {
    const users = await this.dataSource
      .createQueryBuilder()
      .select([
        'u.id as id',
        'u.login as login',
        'u.email as email',
        'u."createdAt" as "createdAt"',
      ])
      .from(User, 'u')
      .where('id = :id', { id })
      .execute();

    const mappedUsers = await this.usersMapping(users);

    return mappedUsers[0];
  }

  async findUserByIdBool(id: number): Promise<boolean> {
    if (isNaN(id)) {
      return false;
    }

    const users = await this.dataSource
      .createQueryBuilder()
      .select('id')
      .from(User, 'u')
      .where('id = :id', { id })
      .execute();

    return users.length !== 0;
  }

  async findUserByLogin(login: string): Promise<User[] | null> {
    const users = await this.dataSource
      .createQueryBuilder()
      .select('id')
      .from(User, 'u')
      .where('u.login = :login', { login })
      .execute();

    if (users.length === 0) {
      return null;
    }
    return users;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = await this.dataSource
      .createQueryBuilder()
      .select('id')
      .from(User, 'u')
      .where('u.email = :email', { email })
      .execute();

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

    const users = await this.dataSource
      .createQueryBuilder()
      .select(['upr.id, upr.recoveryCode, upr.expirationDate, upr.userId'])
      .from(UserPasswordRecovery, 'upr')
      .where('upr.recoveryCode = :code', { code })
      .execute();

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async findUserForEmailResending(email: string): Promise<User | null> {
    const users = await this.dataSource
      .createQueryBuilder()
      .select([
        'u.id, u.login, u, email, u."isConfirmed", e."confirmationCode"',
      ])
      .from(User, 'u')
      .leftJoin(UserEmailConfirmation, 'e', 'u.id = e."userId"')
      .where('u.email = :email', { email })
      .execute();

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

    const users = await this.dataSource
      .createQueryBuilder()
      .select([
        'u.id, u."isConfirmed", e."confirmationCode", e."expirationDate"',
      ])
      .from(User, 'u')
      .leftJoin(UserEmailConfirmation, 'e', 'u.id = e."userId"')
      .where('e."confirmationCode" = :code', { code })
      .execute();

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const users = await this.dataSource
      .createQueryBuilder()
      .select(['u.id, u."passwordHash", u."isConfirmed"'])
      .from(User, 'u')
      .where('u.login = :loginOrEmail', { loginOrEmail })
      .orWhere('u.email = :loginOrEmail', { loginOrEmail })
      .execute();

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  async getUserByLoginOrEmailForTesting(
    loginOrEmail: string,
  ): Promise<UserTestManagerModel | null> {
    const users = await this.dataSource
      .createQueryBuilder()
      .select([
        'e."confirmationCode" as "emailConfirmationCode", e."expirationDate" as "emailExpirationDate", p."recoveryCode" as "passwordRecoveryCode", p."expirationDate" as "passwordExpirationDate", d."deviceId" as "deviceId"',
      ])
      .from(User, 'u')
      .leftJoin(UserEmailConfirmation, 'e', 'u.id = e."userId"')
      .leftJoin(UserPasswordRecovery, 'p', 'u.id = p."userId"')
      .leftJoin(DeviceAuthSessions, 'd', 'u.id = d."userId"')
      .where('u.login = :loginOrEmail', { loginOrEmail })
      .orWhere('u.email = :loginOrEmail', { loginOrEmail })
      .execute();

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
