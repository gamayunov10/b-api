import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import {
  createUserInput,
  userEmail01,
  userLogin01,
  userPassword,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../base/utils/functions/wait';
import {
  sa_users_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../../base/utils/constants/auth.constants';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import { lorem20, lorem30 } from '../../base/utils/constants/lorems';
import { expectCreatedUser } from '../../base/utils/functions/expect/users/expectCreatedUser';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';

describe('Users: POST sa/users', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: POST sa/users', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

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

      expectErrorWithPath(response, 401, sa_users_uri);
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

      expectErrorWithPath(response, 401, sa_users_uri);
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

      expectErrorWithPath(response, 401, sa_users_uri);
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

      expectErrorWithPath(response, 401, sa_users_uri);
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
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Add new user to the system`, async () => {
      const response = await agent
        .post(sa_users_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createUserInput)
        .expect(201);

      expectCreatedUser(response, createUserInput);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
