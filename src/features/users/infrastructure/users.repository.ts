import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UserInputModel } from '../api/models/input/user-input-model';
import { User } from '../domain/user.entity';
import { UserEmailConfirmation } from '../domain/user-email-confirmation.entity';
import { UserPasswordRecovery } from '../domain/user-password-recovery.entity';
import { UserBanInfo } from '../domain/user-ban.entity';
import { UserBanInputModel } from '../api/models/input/user-ban.input.model';
import { UserBanByBloggerInputModel } from '../api/models/input/user-ban-by-blogger.input.model';
import { UserBanByBlogger } from '../domain/user-ban-by-blogger.entity';
import { Blog } from '../../blogs/domain/blog.entity';
import { TransactionHelper } from '../../../base/transactions/transaction.helper';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly transactionHelper: TransactionHelper,
  ) {}

  async createUser(
    userInputModel: UserInputModel,
    hash: string,
  ): Promise<number | boolean> {
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        const user = new User();
        user.login = userInputModel.login;
        user.passwordHash = hash;
        user.email = userInputModel.email;
        user.isConfirmed = true;

        const savedUser = await entityManager.save(user);

        const userBanInfo = new UserBanInfo();
        userBanInfo.isBanned = false;
        userBanInfo.banReason = null;
        userBanInfo.banDate = null;
        userBanInfo.user = savedUser;

        await entityManager.save(userBanInfo);

        return savedUser.id;
      },
    );
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
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        await entityManager
          .createQueryBuilder()
          .update(UserBanInfo)
          .set({
            isBanned: true,
            banReason: query.banReason,
            banDate: new Date(),
          })
          .where('userId = :userId', { userId })
          .execute();

        return true;
      },
    );
  }

  async unBanUser(userId: number): Promise<boolean> {
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        await entityManager
          .createQueryBuilder()
          .update(UserBanInfo)
          .set({
            isBanned: false,
            banReason: null,
            banDate: null,
          })
          .where('userId = :userId', { userId })
          .execute();
        return true;
      },
    );
  }

  async banUserByBlogger(
    userId: number,
    blogId: number,
    query: UserBanByBloggerInputModel,
    blog: Blog,
    user: User,
  ): Promise<boolean> {
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        const existingRecord = await entityManager
          .createQueryBuilder(UserBanByBlogger, 'b')
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
          await entityManager.save(userBanByBlogger);
        } else {
          await entityManager
            .createQueryBuilder()
            .update(UserBanByBlogger)
            .set({
              isBanned: true,
              banReason: query.banReason,
              banDate: new Date(),
            })
            .where('userId = :userId', { userId })
            .andWhere('blogId = :blogId', { blogId })
            .execute();
        }

        return true;
      },
    );
  }

  async unBanUserByBlogger(userId: number, blogId: number): Promise<boolean> {
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        await entityManager
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

        return true;
      },
    );
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
