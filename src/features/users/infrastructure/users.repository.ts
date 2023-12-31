import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UserInputModel } from '../api/models/input/user-input-model';
import { User } from '../domain/user.entity';
import { UserPasswordRecovery } from '../domain/user-password-recovery.entity';
import { isValidUuid } from '../../../base/utils/is-valid-uuid';
import { UserEmailConfirmation } from '../domain/user-email-confirmation.entity';
import { UserTestManagerModel } from '../api/models/output/user-test-manager.model';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUser(
    userInputModel: UserInputModel,
    hash: string,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const user = await this.dataSource.query(
        `INSERT INTO public.users (login, "passwordHash", email, "isConfirmed")
         VALUES ($1, $2, $3, $4)
         RETURNING id;`,
        [userInputModel.login, hash, userInputModel.email, true],
      );

      return user[0].id;
    });
  }

  async confirmUser(userId: number): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `UPDATE public.users
             SET "isConfirmed" = true
             WHERE id = $1;`,
        [userId],
      );

      const result = await this.dataSource.query(
        `DELETE
                FROM public.user_email_confirmation
                WHERE "userId" = $1;`,
        [userId],
      );
      return result[1] === 1;
    });
  }

  async findUserById(userId: number): Promise<User | null> {
    if (isNaN(userId)) {
      return null;
    }

    const users = await this.dataSource.query(
      `SELECT id, login, email
       FROM public.users
       WHERE id = $1`,
      [userId],
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
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

  async createPasswordRecoveryRecord(
    recoveryCode: string,
    userId: number,
  ): Promise<number> {
    const result = await this.dataSource.query(
      `INSERT INTO public.user_password_recovery
                ("userId", "recoveryCode", "expirationDate")
               VALUES ($1, $2, CURRENT_TIMESTAMP + interval '5 hours')
               RETURNING id;`,
      [userId, recoveryCode],
    );
    return result[0].id;
  }

  async registerUser(
    userInputModel: UserInputModel,
    hash: string,
    confirmationCode: string,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const user = await this.dataSource.query(
        `INSERT INTO public.users
                 (login, "passwordHash", email, "isConfirmed")
                 VALUES ($1, $2, $3, $4)
                 RETURNING id;`,
        [userInputModel.login, hash, userInputModel.email, false],
      );

      const userId = user[0].id;

      await this.dataSource.query(
        `INSERT INTO public.user_email_confirmation 
                    ("userId", "confirmationCode", "expirationDate")
                VALUES ($1, $2, CURRENT_TIMESTAMP + interval '5 hours');`,
        [userId, confirmationCode],
      );

      return userId;
    });
  }

  async updatePassword(userId: number, hash: string): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      await this.dataSource.query(
        `UPDATE public.users
                SET "passwordHash" = $2
                WHERE id = $1`,
        [userId, hash],
      );

      const result = await this.dataSource.query(
        `DELETE
                FROM public.user_password_recovery
                WHERE "userId" = $1;`,
        [userId],
      );
      return result[1] === 1;
    });
  }

  async updateEmailConfirmationCode(
    confirmationCode: string,
    userId: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public.user_email_confirmation
              SET "confirmationCode" = $1, 
                  "expirationDate" = CURRENT_TIMESTAMP + interval '5 hours'
              WHERE "userId" = $2;`,
      [confirmationCode, userId],
    );
    return result[1] === 1;
  }

  async deleteUser(userId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE
       FROM public.users
       WHERE id = $1;`,
      [userId],
    );
    return result[1] === 1;
  }
}
