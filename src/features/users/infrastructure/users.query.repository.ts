import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

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
import { BanStatus } from '../../../base/enums/ban-status.enum';
import { UserBloggerQueryModel } from '../api/models/input/user-blogger.query.model';
import { BloggerUserViewModel } from '../api/models/output/blogger-user-view.model';

@Injectable()
export class UsersQueryRepository {
  private readonly logger = new Logger(UsersQueryRepository.name);
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async findUserEntityById(
    userId: string,
    manager: EntityManager,
  ): Promise<User | null> {
    try {
      return await manager
        .createQueryBuilder(User, 'u')
        .where('u.id = :userId', { userId })
        .getOne();
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }
      return null;
    }
  }

  async findUserEntityByIdWithoutManager(userId: number): Promise<User | null> {
    try {
      return await this.usersRepository
        .createQueryBuilder('u')
        .where('u.id = :userId', { userId })
        .getOne();
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }
      return null;
    }
  }

  async findUsersBannedByBlogger(
    query: UserBloggerQueryModel,
    blogId: string,
  ): Promise<Paginator<BloggerUserViewModel[]>> {
    const sortDirection = query.sortDirection.toUpperCase();

    const queryBuilder = this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.userBanByBlogger', 'ban')
      .leftJoinAndSelect('ban.blog', 'b')
      .where(`${query.searchLoginTerm ? 'u.login ILIKE :loginTerm' : ''}`, {
        loginTerm: `%${query.searchLoginTerm}%`,
      })
      .andWhere(`ban.isBanned = true`)
      .andWhere(`b.id = :blogId`, {
        blogId,
      })
      .orderBy(
        `u."${query.sortBy}" ${
          query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize);

    const users = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.usersMappingByBlogger(users),
    });
  }

  async findUserBanInfo(userId: number): Promise<User | null> {
    try {
      return await this.usersRepository
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.userBanInfo', 'ubi')
        .where('u.id = :userId', { userId })
        .getOne();
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }
      return null;
    }
  }

  async findUsers(query: UserQueryModel) {
    try {
      const filter = usersFilter(
        query.searchLoginTerm,
        query.searchEmailTerm,
        query.banStatus,
      );
      const sortDirection = query.sortDirection.toUpperCase();

      const queryBuilder = this.usersRepository
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.userBanInfo', 'ubi')
        .where(
          query.searchLoginTerm || query.searchEmailTerm
            ? `(u.login ILIKE :login OR u.email ILIKE :email)`
            : 'u.login IS NOT NULL',
          {
            login: `%${query.searchLoginTerm}%`,
            email: `%${query.searchEmailTerm}%`,
          },
        )
        .andWhere(
          `${
            query.banStatus === BanStatus.BANNED ||
            query.banStatus === BanStatus.NOT_BANNED
              ? 'ubi.isBanned = :banStatus'
              : 'ubi.isBanned IS NOT NULL'
          }`,
          { banStatus: filter.banStatus },
        )
        .orderBy(
          `u.${query.sortBy} ${
            query.sortBy.toLowerCase() !== 'createdat' ? 'COLLATE "C"' : ''
          }`,
          sortDirection as 'ASC' | 'DESC',
        )
        .limit(+query.pageSize)
        .offset((+query.pageNumber - 1) * +query.pageSize);

      const users = await queryBuilder.getMany();
      const totalCount = await queryBuilder.getCount();

      return Paginator.paginate({
        pageNumber: +query.pageNumber,
        pageSize: +query.pageSize,
        totalCount: totalCount,
        items: await this.usersEntityMapping(users),
      });
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }
    }
  }

  async findUserById(id: number): Promise<SuperAdminUserViewModel> {
    const users = await this.usersRepository
      .createQueryBuilder('u')
      .select([
        'u.id as id',
        'u.login as login',
        'u.email as email',
        'u."createdAt" as "createdAt"',
        'b.isBanned as "isBanned"',
        'b.banReason as "banReason"',
        'b.banDate as "banDate"',
      ])
      .leftJoin('u.userBanInfo', 'b')
      .where('u.id = :id', { id })
      .execute();

    const mappedUsers = await this.usersMapping(users);

    return mappedUsers[0];
  }

  async findUserByIdWithBanInfo(id: number) {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .select([
        'u.id as id',
        'u.login as login',
        'u.email as email',
        'u."createdAt" as "createdAt"',
        'b.isBanned as "isBanned"',
        'b.banReason as "banReason"',
        'b.banDate as "banDate"',
        'ban_by_blogger.isBanned as "isBannedByBlogger"',
        'ban_by_blogger.banReason as "banReasonByBlogger"',
      ])
      .leftJoin('u.userBanInfo', 'b')
      .leftJoin('u.userBanByBlogger', 'ban_by_blogger')
      .where('u.id = :id', { id })
      .execute();

    return result ? result[0] : false;
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

  async findUserByLogin(login: string): Promise<number | null> {
    const users = await this.dataSource
      .createQueryBuilder()
      .select('id')
      .from(User, 'u')
      .where('u.login = :login', { login })
      .execute();

    if (users.length === 0) {
      return null;
    }

    return users[0].id;
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

  private async usersMappingByBlogger(
    array: User[],
  ): Promise<BloggerUserViewModel[]> {
    return array.map((u) => {
      return {
        id: u.id.toString(),
        login: u.login,
        banInfo: {
          isBanned: u.userBanByBlogger.isBanned,
          banDate: u.userBanByBlogger.banDate,
          banReason: u.userBanByBlogger.banReason,
        },
      };
    });
  }

  private async usersMapping(array: any): Promise<SuperAdminUserViewModel[]> {
    return array.map((u) => {
      return {
        id: u.id.toString(),
        login: u.login,
        email: u.email,
        createdAt: u.createdAt,
        banInfo: {
          isBanned: u.isBanned,
          banDate: u.banDate,
          banReason: u.banReason,
        },
      };
    });
  }

  private async usersEntityMapping(
    array: any,
  ): Promise<SuperAdminUserViewModel[]> {
    return array.map((u) => {
      return {
        id: u.id.toString(),
        login: u.login,
        email: u.email,
        createdAt: u.createdAt,
        banInfo: {
          isBanned: u.userBanInfo.isBanned,
          banDate: u.userBanInfo.banDate,
          banReason: u.userBanInfo.banReason,
        },
      };
    });
  }
}
