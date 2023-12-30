import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { initializeApp } from '../../base/settings/initializeApp';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  loginUserInput,
  loginUserInput2,
  loginUserInput3,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../base/utils/functions/wait';
import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query.repository';
import {
  auth_me_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';

describe('Auth: auth/me', () => {
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

  describe('negative: auth/me', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should not Get information about current user if accessToken is missing`, async () => {
      await agent.get(auth_me_uri).expect(401);
    });

    it(`should not Get information about current user if accessToken is incorrect`, async () => {
      await usersTestManager.createUser(createUserInput);

      const response = await usersTestManager.login(loginUserInput);

      const accessToken = response.body;

      await agent
        .get(auth_me_uri)
        .auth(accessToken, { type: 'bearer' })
        .expect(401);
    });

    it(`should not Get information about current user if accessToken is expired`, async () => {
      await usersTestManager.createUser(createUserInput3);

      const response = await usersTestManager.login(loginUserInput3);

      const accessToken = response.body.accessToken;

      await waitForIt(10);

      await agent
        .get(auth_me_uri)
        .auth(accessToken, { type: 'bearer' })
        .expect(401);
    }, 15000);
  });

  describe('positive: auth/me', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should Get information about current user`, async () => {
      await usersTestManager.createUser(createUserInput2);

      const response = await usersTestManager.login(loginUserInput2);

      const accessToken = response.body.accessToken;

      await agent
        .get(auth_me_uri)
        .auth(accessToken, { type: 'bearer' })
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toEqual(createUserInput2.email);
          expect(res.body.login).toEqual(createUserInput2.login);
          expect(res.body.userId).toEqual(expect.anything());
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
