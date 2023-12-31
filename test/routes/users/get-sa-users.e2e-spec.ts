import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { initializeApp } from '../../base/settings/initializeApp';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  createUserInput4,
  createUserInput5,
  createUserInput6,
  createUserInput7,
  userEmail01,
  userEmail02,
  userEmail03,
  userEmail04,
  userEmail05,
  userEmail06,
  userEmail07,
  userLogin01,
  userLogin02,
  userLogin03,
  userLogin04,
  userLogin05,
  userLogin06,
  userLogin07,
  userPassword,
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
import { expecFilteredMessages } from '../../base/utils/functions/expecFilteredMessages';
import { expectFirstPaginatedUser } from '../../base/utils/functions/users/expectFirstPaginatedUser';
import { expectPaginatedUsers } from '../../base/utils/functions/users/expectPaginatedUsers';

describe('Users: GET sa/users', () => {
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

  describe('negative: GET sa/users', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should not Returns all users if login is incorrect`, async () => {
      const response = await agent
        .get(sa_users_uri)
        .auth('incorrect', basicAuthPassword)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(401);

      expecFilteredMessages(response, 401, sa_users_uri);
    });

    it(`should not Returns all users if login is incorrect`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth('', basicAuthPassword)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(401);

      expecFilteredMessages(response, 401, sa_users_uri);
    });

    it(`should not Returns all users if password is incorrect`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth(basicAuthLogin, 'incorrect')
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(401);

      expecFilteredMessages(response, 401, sa_users_uri);
    });

    it(`should not Returns all users if password is incorrect`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth(basicAuthLogin, '')
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(401);

      expecFilteredMessages(response, 401, sa_users_uri);
    });
  });

  describe('positive: GET sa/users', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should Return created user`, async () => {
      await usersTestManager.createUser(createUserInput);

      const response = await agent
        .get(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 3, sortDirection: 'asc' })
        .expect(200);

      expectFirstPaginatedUser(response, 1, 1, 3, 1, userLogin01, userEmail01);
    });

    it(`should Return all users with pagination`, async () => {
      await agent.delete(testing_allData_uri);

      await usersTestManager.createUser(createUserInput);
      await usersTestManager.createUser(createUserInput2);
      await usersTestManager.createUser(createUserInput3);
      await usersTestManager.createUser(createUserInput4);
      await usersTestManager.createUser(createUserInput5);
      await usersTestManager.createUser(createUserInput6);
      await usersTestManager.createUser(createUserInput7);

      const response = await agent
        .get(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 10, sortDirection: 'asc' })
        .expect(200);

      expectPaginatedUsers(
        response,
        1,
        1,
        10,
        7,
        userLogin01,
        userEmail01,
        userLogin02,
        userEmail02,
        userLogin03,
        userEmail03,
        userLogin04,
        userEmail04,
        userLogin05,
        userEmail05,
        userLogin06,
        userEmail06,
        userLogin07,
        userEmail07,
      );
    });

    it(`should Return all users with pagination`, async () => {
      await agent.delete(testing_allData_uri);

      await usersTestManager.createUser(createUserInput);
      await usersTestManager.createUser(createUserInput2);
      await usersTestManager.createUser(createUserInput3);
      await usersTestManager.createUser(createUserInput4);
      await usersTestManager.createUser(createUserInput5);
      await usersTestManager.createUser(createUserInput6);
      await usersTestManager.createUser(createUserInput7);

      const response = await agent
        .get(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 10, sortDirection: 'desc' })
        .expect(200);

      expectPaginatedUsers(
        response,
        1,
        1,
        10,
        7,
        userLogin07,
        userEmail07,
        userLogin06,
        userEmail06,
        userLogin05,
        userEmail05,
        userLogin04,
        userEmail04,
        userLogin03,
        userEmail03,
        userLogin02,
        userEmail02,
        userLogin01,
        userEmail01,
      );
    });

    it(`should Return all users with pagination`, async () => {
      await agent.delete(testing_allData_uri);

      await usersTestManager.createUser(createUserInput);
      await usersTestManager.createUser(createUserInput2);
      await usersTestManager.createUser(createUserInput3);
      await usersTestManager.createUser(createUserInput4);
      await usersTestManager.createUser(createUserInput5);
      await usersTestManager.createUser(createUserInput6);
      await usersTestManager.createUser(createUserInput7);

      const response = await agent
        .get(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 6, pageNumber: 2, sortDirection: 'desc' })
        .expect(200);

      expectFirstPaginatedUser(response, 2, 2, 6, 7, userLogin01, userEmail01);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
