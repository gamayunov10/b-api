import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { initializeApp } from '../../base/settings/initializeApp';
import {
  createUserInput,
  createUserInput3,
  loginUserInput,
  loginUserInput3,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../base/utils/functions/wait';
import { invalidRefreshToken } from '../../base/utils/constants/auth.constants';
import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query.repository';
import {
  auth_refreshToken_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';

describe('Auth: auth/refresh-token', () => {
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

  describe('negative: auth/refresh-token', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should return 401 if refreshToken is missing`, async () => {
      await agent.post(auth_refreshToken_uri).expect(401);
    });

    it(`should return 401 if refreshToken is incorrect`, async () => {
      await agent
        .post(auth_refreshToken_uri)
        .set('Cookie', invalidRefreshToken)
        .expect(401);
    });

    it(`should return 401 if refreshToken is expired`, async () => {
      await usersTestManager.createUser(createUserInput3);

      const response = await usersTestManager.login(loginUserInput3);

      const refreshToken = response
        .get('Set-Cookie')
        .find((cookie) => cookie.startsWith('refreshToken'));

      await waitForIt(20);

      await agent
        .post(auth_refreshToken_uri)
        .set('Cookie', refreshToken)
        .expect(401);
    }, 25000);
  });

  describe('positive: auth/refresh-token', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should Generate new pair of access and refresh tokens 
        (in cookie client must send correct refreshToken 
        that will be revoked after refreshing`, async () => {
      await usersTestManager.createUser(createUserInput);

      const response = await usersTestManager.login(loginUserInput);

      const refreshToken = response
        .get('Set-Cookie')
        .find((cookie) => cookie.startsWith('refreshToken'));

      await agent
        .post(auth_refreshToken_uri)
        .set('Cookie', refreshToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toEqual(expect.any(String));
          const refreshTokenCookie = res
            .get('Set-Cookie')
            .find((cookie) => cookie.startsWith('refreshToken'));

          expect(refreshTokenCookie).toBeDefined();
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
