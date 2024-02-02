import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../../base/managers/users.manager';
import { beforeAllConfig } from '../../../base/settings/beforeAllConfig';
import { testing_allData_uri } from '../../../base/utils/constants/routes';
import { waitForIt } from '../../../base/utils/functions/wait';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  createUserInput4,
  createUserInput5,
} from '../../../base/utils/constants/users.constants';
import { expectErrorWithPath } from '../../../base/utils/functions/expect/expectErrorWithPath';
import { randomAccessToken } from '../../../base/utils/constants/auth.constants';

describe('PairQuizGame: POST pair-game-quiz/pairs/my-current/answers', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: POST pair-game-quiz/pairs/my-current/answers', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    let userToken1: string;
    let userToken2: string;
    let userToken3: string;
    let userToken4: string;
    let userToken5: string;

    let userId1: number;
    let userId2: number;
    let userId3: number;
    let userId4: number;
    let userId5: number;
    it(`should create and login 5 users`, async () => {
      await usersTestManager.createUser(createUserInput);
      await usersTestManager.createUser(createUserInput2);
      await usersTestManager.createUser(createUserInput3);
      await usersTestManager.createUser(createUserInput4);
      await usersTestManager.createUser(createUserInput5);

      const loginResponse = await usersTestManager.login(createUserInput.login);
      const loginResponse2 = await usersTestManager.login(
        createUserInput2.login,
      );
      const loginResponse3 = await usersTestManager.login(
        createUserInput3.login,
      );
      const loginResponse4 = await usersTestManager.login(
        createUserInput4.login,
      );
      const loginResponse5 = await usersTestManager.login(
        createUserInput5.login,
      );

      userId1 = await usersTestManager.getUserIdByLogin(createUserInput.login);
      userId2 = await usersTestManager.getUserIdByLogin(createUserInput2.login);
      userId3 = await usersTestManager.getUserIdByLogin(createUserInput3.login);
      userId4 = await usersTestManager.getUserIdByLogin(createUserInput4.login);
      userId5 = await usersTestManager.getUserIdByLogin(createUserInput5.login);

      userToken1 = loginResponse.body.accessToken;
      userToken2 = loginResponse2.body.accessToken;
      userToken3 = loginResponse3.body.accessToken;
      userToken4 = loginResponse4.body.accessToken;
      userToken5 = loginResponse5.body.accessToken;
    });

    it(`should not Send answer for next not answered question in active pair if token is missing`, async () => {
      const getGameResponse = await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        // .set('Authorization', `Bearer ${userToken3}`)
        .send({
          answer: 'string',
        })
        .expect(401);

      expectErrorWithPath(
        getGameResponse,
        401,
        `/pair-game-quiz/pairs/my-current/answers`,
      );
    });

    it(`should not Send answer for next not answered question in active pair if token is incorrect`, async () => {
      const getGameResponse = await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', `Bearer ${randomAccessToken}`)
        .send({
          answer: 'string',
        })
        .expect(401);

      expectErrorWithPath(
        getGameResponse,
        401,
        `/pair-game-quiz/pairs/my-current/answers`,
      );
    });
  });

  describe('positive: POST pair-game-quiz/pairs/my-current/answers', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);
  });

  afterAll(async () => {
    await app.close();
  });
});
