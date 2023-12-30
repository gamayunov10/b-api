import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { initializeApp } from '../../base/settings/initializeApp';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  createUserInput4,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../base/utils/functions/wait';
import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query.repository';
import {
  sa_users_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../../base/utils/constants/auth.constants';
import { expectErrorsMessages } from '../../base/utils/functions/expectErrorsMessages';
import { expecFilteredMessages } from '../../base/utils/functions/expecFilteredMessages';

describe('Auth: delete sa/users/:id', () => {
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

  describe('negative: delete sa/users/:id', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should not Delete user specified by id if login is incorrect`, async () => {
      const res = await usersTestManager.createUser(createUserInput);
      const id = res.body.id;

      const response = await agent
        .delete(`${sa_users_uri}${id}`)
        .auth('incorrect', basicAuthPassword)
        .expect(401);

      expecFilteredMessages(response, 401, `${sa_users_uri}${id}`);
    });

    it(`should not Delete user specified by id if login is incorrect`, async () => {
      const res = await usersTestManager.createUser(createUserInput2);
      const id = res.body.id;

      const response = await agent
        .delete(`${sa_users_uri}${id}`)
        .auth('incorrect', basicAuthPassword)
        .expect(401);

      expecFilteredMessages(response, 401, `${sa_users_uri}${id}`);
    });

    it(`should not Delete user specified by id if password is incorrect`, async () => {
      const res = await usersTestManager.createUser(createUserInput3);
      const id = res.body.id;

      const response = await agent
        .delete(`${sa_users_uri}${id}`)
        .auth(basicAuthLogin, '')
        .expect(401);

      expecFilteredMessages(response, 401, `${sa_users_uri}${id}`);
    });

    it(`should not Delete user specified by id if password is incorrect`, async () => {
      const res = await usersTestManager.createUser(createUserInput4);
      const id = res.body.id;

      const response = await agent
        .delete(`${sa_users_uri}${id}`)
        .auth(basicAuthLogin, '123')
        .expect(401);

      expecFilteredMessages(response, 401, `${sa_users_uri}${id}`);
    });

    it(`should not Delete user specified by id If specified user is not exists`, async () => {
      const id = '123';

      const response = await agent
        .delete(`${sa_users_uri}${id}`)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(404);

      expectErrorsMessages(response, `userId`);
    });
  });

  describe('positive: delete sa/users/:id', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should Delete user specified by id`, async () => {
      const res = await usersTestManager.createUser(createUserInput);
      const id = res.body.id;

      await agent
        .delete(`${sa_users_uri}${id}`)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(204);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
