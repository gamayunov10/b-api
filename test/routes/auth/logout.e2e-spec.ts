import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { initializeApp } from '../../base/settings/initializeApp';
import {
  createUserInput,
  loginUserInput,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../base/utils/functions/wait';
import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query.repository';
import {
  auth_logout_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { invalidRefreshToken } from '../../base/utils/constants/auth.constants';

describe('Auth: auth/logout', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initializeApp();
    app = result.app;
    agent = result.agent;
    const usersQueryRepository = app.get(UsersQueryRepository);
    usersTestManager = new UsersTestManager(app, usersQueryRepository);
  });

  describe('negative: auth/logout', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should return 401 when trying to logout if cookie is incorrect`, async () => {
      await agent
        .post(auth_logout_uri)
        .set('Cookie', invalidRefreshToken)
        .expect(401);
    });

    it(`should return 401 when trying to logout if cookie is missing`, async () => {
      await agent.post(auth_logout_uri).expect(401);
    });

    it(`should return 401 when trying to logout if cookie is expired`, async () => {
      await usersTestManager.createUser(createUserInput);

      const response = await usersTestManager.login(loginUserInput);

      const refreshTokenCookie = response
        .get('Set-Cookie')
        .find((cookie) => cookie.startsWith('refreshToken'));

      await waitForIt(20);

      await agent
        .post(auth_logout_uri)
        .set('Cookie', refreshTokenCookie)
        .expect(401);
    }, 25000);
  });

  describe('positive: auth/logout', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should logout user`, async () => {
      await usersTestManager.createUser(createUserInput);

      const response = await usersTestManager.login(loginUserInput);

      const refreshTokenCookie = response
        .get('Set-Cookie')
        .find((cookie) => cookie.startsWith('refreshToken'));

      await agent
        .post(auth_logout_uri)
        .set('Cookie', refreshTokenCookie)
        .expect(204);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
