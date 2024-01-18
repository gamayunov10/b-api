import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UserInputModel } from '../api/models/input/user-input-model';
import { User } from '../domain/user.entity';
import { UserEmailConfirmation } from '../domain/user-email-confirmation.entity';
import { UserPasswordRecovery } from '../domain/user-password-recovery.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly userEmailConfirmationRepository: Repository<UserEmailConfirmation>,
    private readonly userPasswordRecoveryRepository: Repository<UserPasswordRecovery>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async createUser(
    userInputModel: UserInputModel,
    hash: string,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const user = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          login: userInputModel.login,
          passwordHash: hash,
          email: userInputModel.email,
          isConfirmed: true,
        })
        .returning('id')
        .execute();

      return user.identifiers[0].id;
    });
  }

  async confirmUser(userId: number): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource
        .createQueryBuilder()
        .update(User)
        .set({ isConfirmed: true })
        .where('id = :id', { id: userId })
        .execute();

      const result = await this.dataSource
        .createQueryBuilder()
        .delete()
        .from(UserEmailConfirmation)
        .where('userId = :id', { id: userId })
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
          isConfirmed: true,
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
        .where('id = :id', { id: userId })
        .execute();

      const result = await this.dataSource
        .createQueryBuilder()
        .delete()
        .from(UserPasswordRecovery)
        .where('userId = :id', { id: userId })
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
      .where('userId = :id', { id: userId })
      .execute();

    return result.affected === 1;
  }

  async deleteUser(userId: number): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('id= :id', { id: userId })
      .execute();

    return result.affected === 1;
  }
}
