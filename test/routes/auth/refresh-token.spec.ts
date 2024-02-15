import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import {
  createUserInput,
  createUserInput3,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../../src/base/utils/wait';
import { invalidRefreshToken } from '../../base/utils/constants/auth.constants';
import {
  auth_refreshToken_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';

describe('Auth: auth/refresh-token', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: auth/refresh-token', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

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

      const response = await usersTestManager.login(createUserInput3.login);

      const refreshToken = response
        .get('Set-Cookie')
        .find((cookie) => cookie.startsWith('refreshToken'));

      await waitForIt(22);

      await agent
        .post(auth_refreshToken_uri)
        .set('Cookie', refreshToken)
        .expect(401);
    }, 25000);
  });

  describe('positive: auth/refresh-token', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Generate new pair of access and refresh tokens 
        (in cookie client must send correct refreshToken 
        that will be revoked after refreshing`, async () => {
      await usersTestManager.createUser(createUserInput);

      const response = await usersTestManager.login(createUserInput.login);

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
