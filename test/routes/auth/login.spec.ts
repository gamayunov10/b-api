import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';

import { UsersTestManager } from '../../base/managers/users.manager';
import {
  createUserInput,
  userLogin01,
  userPassword,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../base/utils/functions/wait';
import {
  auth_login_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';

describe('Auth: auth/login', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: auth/login', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should create 1 user`, async () => {
      await usersTestManager.createUser(createUserInput);
    });

    // negative
    it(`should return 401 when trying to login user with incorrect login or email`, async () => {
      await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: randomUUID(),
          password: userPassword,
        })
        .expect(401);
    });

    it(`should return 401 when trying to login user with incorrect login or email`, async () => {
      await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: '',
          password: userPassword,
        })
        .expect(401);
    });

    it(`should return 400 when trying to login user with invalid password`, async () => {
      await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin01,
          password: 123,
        })
        .expect(400);
    });

    it(`should return 400 when trying to login user with invalid password`, async () => {
      await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin01,
          password: '',
        })
        .expect(400);
    });
  });

  describe('positive: auth/login', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should login user`, async () => {
      await usersTestManager.createUser(createUserInput);

      const response = await agent
        .post(auth_login_uri)
        .send({
          loginOrEmail: userLogin01,
          password: userPassword,
        })
        .expect(200);

      const refreshTokenUser01 = response.headers['set-cookie'][0];

      expect(refreshTokenUser01).toMatch(/^refreshToken=/);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
