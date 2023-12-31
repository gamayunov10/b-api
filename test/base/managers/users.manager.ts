import { INestApplication } from '@nestjs/common';
import supertest, { Response } from 'supertest';

import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query.repository';

export class UsersTestManager {
  constructor(
    protected readonly app: INestApplication,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.email).toBe(responseModel.email);
  }

  async createUser(createModel: any): Promise<Response> {
    return supertest(this.app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(createModel)
      .expect(201);
  }

  async updateUser(
    adminAccessToken: string,
    updateModel: any,
  ): Promise<Response> {
    return supertest(this.app.getHttpServer())
      .put('/sa/users')
      .auth(adminAccessToken, {
        type: 'bearer',
      })
      .send(updateModel)
      .expect(204);
  }

  async login(loginModel: any): Promise<Response> {
    return await supertest(this.app.getHttpServer())
      .post('/auth/login')
      .send(loginModel)
      .expect(200);
  }

  async getEmailConfirmationCode(loginOrEmail: string): Promise<string | null> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmailForTesting(
        loginOrEmail,
      );

    return user?.emailConfirmationCode;
  }

  async getPasswordRecoveryCode(loginOrEmail: string): Promise<string | null> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmailForTesting(
        loginOrEmail,
      );

    return user?.passwordRecoveryCode;
  }

  async getEmailExpirationDate(loginOrEmail: string): Promise<Date | null> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmailForTesting(
        loginOrEmail,
      );

    return user?.emailExpirationDate;
  }

  async getPasswordExpirationDate(loginOrEmail: string): Promise<Date | null> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmailForTesting(
        loginOrEmail,
      );

    return user?.passwordExpirationDate;
  }

  async getDeviceId(loginOrEmail: string): Promise<string | null> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmailForTesting(
        loginOrEmail,
      );

    return user?.deviceId;
  }
}
