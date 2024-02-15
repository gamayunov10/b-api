import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../../base/managers/users.manager';
import { beforeAllConfig } from '../../../base/settings/beforeAllConfig';
import { testing_allData_uri } from '../../../base/utils/constants/routes';
import { waitForIt } from '../../../../src/base/utils/wait';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  createUserInput4,
  createUserInput5,
} from '../../../base/utils/constants/users.constants';
import { expectErrorWithPath } from '../../../base/utils/functions/expect/expectErrorWithPath';
import { randomAccessToken } from '../../../base/utils/constants/auth.constants';
import { expectErrorsMessages } from '../../../base/utils/functions/expect/expectErrorsMessages';
import { expectPendingSecondPlayer } from '../../../base/utils/functions/expect/quiz/expectPendingSecondPlayer';
import { expectCreatedPair } from '../../../base/utils/functions/expect/quiz/expectCreatedPair';

describe('PairQuizGame: GET pair-game-quiz/pairs/my-current', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: GET pair-game-quiz/pairs/my-current', () => {
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

    it(`GET -> "/pair-game-quiz/pairs/my-current": 
        should return error if token is missing; 
        status 400;`, async () => {
      const getGameResponse = await agent
        .get(`/pair-game-quiz/pairs/my-current`)
        // .set('Authorization', `Bearer ${userToken3}`)
        .expect(401);

      expectErrorWithPath(
        getGameResponse,
        401,
        `/pair-game-quiz/pairs/my-current`,
      );
    });

    it(`GET -> "/pair-game-quiz/pairs/my-current": 
        should return error if token is incorrect; 
        status 400;`, async () => {
      const getGameResponse = await agent
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', `Bearer ${randomAccessToken}`)
        .expect(401);

      expectErrorWithPath(
        getGameResponse,
        401,
        `/pair-game-quiz/pairs/my-current`,
      );
    });

    it(`If no active pair for current user`, async () => {
      const getGameResponse = await agent
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', `Bearer ${userToken5}`)
        .expect(404);

      expectErrorsMessages(getGameResponse, 'game');
    });
  });

  describe('positive: GET pair-game-quiz/pairs/my-current', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    let userToken1: string;
    let userToken2: string;

    let userId1: number;
    let userId2: number;

    it(`should create and login 2 users`, async () => {
      await usersTestManager.createUser(createUserInput);
      await usersTestManager.createUser(createUserInput2);

      const loginResponse = await usersTestManager.login(createUserInput.login);
      const loginResponse2 = await usersTestManager.login(
        createUserInput2.login,
      );

      userId1 = await usersTestManager.getUserIdByLogin(createUserInput.login);
      userId2 = await usersTestManager.getUserIdByLogin(createUserInput2.login);

      userToken1 = loginResponse.body.accessToken;
      userToken2 = loginResponse2.body.accessToken;
    });

    it(`GET -> "/pair-game-quiz/pairs/my-current"`, async () => {
      await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${userToken1}`)
        .expect(200);

      const getGameResponse = await agent
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', `Bearer ${userToken1}`)
        .expect(200);

      expectPendingSecondPlayer(
        getGameResponse,
        userId1,
        createUserInput.login,
      );

      await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(200);

      const getGameResponse2 = await agent
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(200);

      expectCreatedPair(
        getGameResponse2,
        userId1,
        createUserInput.login,
        userId2,
        createUserInput2.login,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
