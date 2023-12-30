import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { initializeApp } from '../../base/settings/initializeApp';
import {
  userEmail01,
  userLogin01,
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
import { expectErrorsMessages } from '../../base/utils/functions/expectErrorsMessages';
import { expecFilteredMessages } from '../../base/utils/functions/expecFilteredMessages';
import { lorem20, lorem30 } from '../../base/utils/constants/lorems';
import { expectCreatedUser } from '../../base/utils/functions/users/expectCreatedUser';

describe('Auth: POST sa/users', () => {
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

  describe('negative: POST sa/users', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should not Add new user to the system if login is incorrect`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth('incorrect', basicAuthPassword)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(401);

      expecFilteredMessages(response, 401, sa_users_uri);
    });

    it(`should not Add new user to the system if login is incorrect`, async () => {
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

    it(`should not Add new user to the system if password is incorrect`, async () => {
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

    it(`should not Add new user to the system if password is incorrect`, async () => {
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

    it(`should not Add new user to the system If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: '',
          password: userPassword,
          email: userEmail01,
        })
        .expect(400);

      expectErrorsMessages(response, 'login');
    });

    it(`should not Add new user to the system If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: lorem20, // maxLength: 10
          password: userPassword,
          email: userEmail01,
        })
        .expect(400);

      expectErrorsMessages(response, 'login');
    });

    it(`should not Add new user to the system If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: 'lo', // minLength: 3
          password: userPassword,
          email: userEmail01,
        })
        .expect(400);

      expectErrorsMessages(response, 'login');
    });

    it(`should not Add new user to the system If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin01,
          password: lorem30, // maxLength: 20
          email: userEmail01,
        })
        .expect(400);

      expectErrorsMessages(response, 'password');
    });

    it(`should not Add new user to the system If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin01,
          password: '12345', // minLength: 6
          email: userEmail01,
        })
        .expect(400);

      expectErrorsMessages(response, 'password');
    });

    it(`should not Add new user to the system If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin01,
          password: userPassword,
          email: 'arch-linux.org', //pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
        })
        .expect(400);

      expectErrorsMessages(response, 'email');
    });

    it(`should not Add new user to the system If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin01,
          password: userPassword,
          email: '', //pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
        })
        .expect(400);

      expectErrorsMessages(response, 'email');
    });
  });

  describe('positive: POST sa/users', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should Add new user to the system`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(201);

      expectCreatedUser(response, userLogin01, userEmail01);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
