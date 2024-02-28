import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { UserInputModel } from '../api/models/input/user-input-model';
import { User } from '../domain/user.entity';
import { UserEmailConfirmation } from '../domain/user-email-confirmation.entity';
import { UserPasswordRecovery } from '../domain/user-password-recovery.entity';
import { UserBanInfo } from '../domain/user-ban.entity';
import { UserBanInputModel } from '../api/models/input/user-ban.input.model';
import { UserBanByBloggerInputModel } from '../api/models/input/user-ban-by-blogger.input.model';
import { UserBanByBlogger } from '../domain/user-ban-by-blogger.entity';
import { Blog } from '../../blogs/domain/blog.entity';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly userEmailConfirmationRepository: Repository<UserEmailConfirmation>,
    private readonly userPasswordRecoveryRepository: Repository<UserPasswordRecovery>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async createUser(
    userInputModel: UserInputModel,
    hash: string,
  ): Promise<number | boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = new User();
      user.login = userInputModel.login;
      user.passwordHash = hash;
      user.email = userInputModel.email;
      user.isConfirmed = true;

      const savedUser = await queryRunner.manager.save(user);

      const userBanInfo = new UserBanInfo();
      userBanInfo.isBanned = false;
      userBanInfo.banReason = null;
      userBanInfo.banDate = null;
      userBanInfo.user = savedUser;

      await queryRunner.manager.save(userBanInfo);

      await queryRunner.commitTransaction();
      return savedUser.id;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(error);
      }
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmUser(userId: number): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource
        .createQueryBuilder()
        .update(User)
        .set({ isConfirmed: true })
        .where('id = :userId', { userId })
        .execute();

      const result = await this.dataSource
        .createQueryBuilder()
        .delete()
        .from(UserEmailConfirmation)
        .where('userId = :userId', { userId })
        .execute();

      return result.affected === 1;
    });
  }

  async createPasswordRecoveryRecord(
    recoveryCode: string,
    userId: number,
  ): Promise<number> {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 5);

    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(UserPasswordRecovery)
      .values({
        userId: userId,
        recoveryCode: recoveryCode,
        expirationDate: expirationDate,
      })
      .returning('id')
      .execute();

    return result.identifiers[0].id;
  }

  async registerUser(
    userInputModel: UserInputModel,
    hash: string,
    confirmationCode: string,
  ): Promise<number> {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 5);

    return this.dataSource.transaction(async () => {
      const user = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          login: userInputModel.login,
          passwordHash: hash,
          email: userInputModel.email,
          isConfirmed: false,
        })
        .returning('id')
        .execute();

      const userId = user.identifiers[0].id;

      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(UserEmailConfirmation)
        .values({
          userId: userId,
          confirmationCode: confirmationCode,
          expirationDate: expirationDate,
        })
        .execute();

      return userId;
    });
  }

  async updatePassword(userId: number, hash: string): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource
        .createQueryBuilder()
        .update(User)
        .set({ passwordHash: hash })
        .where('id = :userId', { userId })
        .execute();

      const result = await this.dataSource
        .createQueryBuilder()
        .delete()
        .from(UserPasswordRecovery)
        .where('userId = :userId', { userId })
        .execute();

      return result.affected === 1;
    });
  }

  async updateEmailConfirmationCode(
    confirmationCode: string,
    userId: number,
  ): Promise<boolean> {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 5);

    const result = await this.dataSource
      .createQueryBuilder()
      .update(UserEmailConfirmation)
      .set({
        confirmationCode: confirmationCode,
        expirationDate: expirationDate,
      })
      .where('userId = :userId', { userId })
      .execute();

    return result.affected === 1;
  }

  async banUser(userId: number, query: UserBanInputModel): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(UserBanInfo)
        .set({
          isBanned: true,
          banReason: query.banReason,
          banDate: new Date(),
        })
        .where('userId = :userId', { userId })
        .execute();

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(error);
      }
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async unBanUser(userId: number): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(UserBanInfo)
        .set({
          isBanned: false,
          banReason: null,
          banDate: null,
        })
        .where('userId = :userId', { userId })
        .execute();
      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(error);
      }
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async banUserByBlogger(
    userId: number,
    blogId: number,
    query: UserBanByBloggerInputModel,
    blog: Blog,
    user: User,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingRecord = await this.dataSource
        .createQueryBuilder()
        .select()
        .from(UserBanByBlogger, 'b')
        .where('b.blogId = :blogId', { blogId })
        .andWhere('b.userId = :userId', { userId })
        .getOne();

      if (!existingRecord) {
        const userBanByBlogger = new UserBanByBlogger();
        userBanByBlogger.blog = blog;
        userBanByBlogger.user = user;
        userBanByBlogger.banReason = query.banReason;
        userBanByBlogger.banDate = new Date();
        userBanByBlogger.isBanned = true;
        await queryRunner.manager.save(userBanByBlogger);
      } else {
        await this.usersRepository
          .createQueryBuilder('u')
          .update('u.userBanInfo')
          .set({
            isBanned: true,
            banReason: query.banReason,
            banDate: new Date(),
          })
          .where('userId = :userId', { userId })
          .andWhere('blogId = :blogId', { blogId })
          .execute();
      }

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(error);
      }
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async unBanUserByBlogger(userId: number, blogId: number): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.dataSource
        .createQueryBuilder()
        .update(UserBanByBlogger)
        .set({
          isBanned: false,
          banReason: null,
          banDate: null,
        })
        .where('userId = :userId', { userId })
        .andWhere('blogId = :blogId', { blogId })
        .execute();

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(error);
      }
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUser(userId: number): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('id = :userId', { userId })
      .execute();

    return result.affected === 1;
  }
}
