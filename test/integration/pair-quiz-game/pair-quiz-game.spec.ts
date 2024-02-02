import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import {
  sa_quiz_questions_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  createUserInput4,
  createUserInput5,
} from '../../base/utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
  randomAccessToken,
} from '../../base/utils/constants/auth.constants';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import { waitForIt } from '../../base/utils/functions/wait';
import { expectPendingSecondPlayer } from '../../base/utils/functions/expect/quiz/expectPendingSecondPlayer';
import { expectCreatedPair } from '../../base/utils/functions/expect/quiz/expectCreatedPair';
import { expectCreatedQuestion } from '../../base/utils/functions/expect/quiz/expectCreatedQuestion';

describe('PairQuizGame: POST pair-game-quiz/pairs/connection', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: POST pair-game-quiz/pairs/connection', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    let token: string;

    it(`should create and login user`, async () => {
      await usersTestManager.createUser(createUserInput);
      const loginResponse = await usersTestManager.login(createUserInput.login);

      token = loginResponse.body.accessToken;
    });

    it(`should not Connect current user to existing random pending pair or 
    create new pair which will be waiting second player if bearer token is incorrect`, async () => {
      const response = await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${randomAccessToken}`)
        .expect(401);

      expectErrorWithPath(response, 401, `/pair-game-quiz/pairs/connection`);
    });

    it(`should not Connect current user to existing random pending pair or
    create new pair which will be waiting second player If current user is already participating in active pair`, async () => {
      const firstConnect = await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const userId = await usersTestManager.getUserIdByLogin(
        createUserInput.login,
      );

      expectPendingSecondPlayer(firstConnect, userId, createUserInput.login);

      const response = await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expectErrorWithPath(response, 403, `/pair-game-quiz/pairs/connection`);
    });
  });

  describe('positive: POST pair-game-quiz/pairs/connection', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

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

    it(`should create new pair which will be waiting second player: (user 1)`, async () => {
      const response = await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${userToken1}`)
        .expect(200);

      expectPendingSecondPlayer(response, userId1, createUserInput.login);
    });

    it(`should create new pair: (user 1 + user 2)`, async () => {
      const response = await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(200);

      expectCreatedPair(
        response,
        userId1,
        createUserInput.login,
        userId2,
        createUserInput2.login,
      );
    });

    it(`POST -> "/pair-game-quiz/pairs/connection",
        GET -> "/pair-game-quiz/pairs/:id",
        GET -> "/pair-game-quiz/pairs/my-current":
        connect to existing game by user2; then get the game by user1, user2;
        then call "/pair-game-quiz/pairs/my-current" by user1, user2.
        Should return started game; status 200;)`, async () => {
      const postConnectionResponse = await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${userToken3}`)
        .expect(200);

      const gameId = postConnectionResponse.body.id;

      const getGameResponse = await agent
        .get(`/pair-game-quiz/pairs/${gameId}`)
        .set('Authorization', `Bearer ${userToken3}`)
        .expect(200);

      expectPendingSecondPlayer(
        getGameResponse,
        userId3,
        createUserInput3.login,
      );

      const getMyCurrentResponse = await agent
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', `Bearer ${userToken3}`)
        .expect(200);

      expectPendingSecondPlayer(
        getMyCurrentResponse,
        userId3,
        createUserInput3.login,
      );

      await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${userToken4}`)
        .expect(200);

      const getGameResponse2 = await agent
        .get(`/pair-game-quiz/pairs/${gameId}`)
        .set('Authorization', `Bearer ${userToken3}`)
        .expect(200);

      expectCreatedPair(
        getGameResponse2,
        userId3,
        createUserInput3.login,
        userId4,
        createUserInput4.login,
      );

      const getGameResponse3 = await agent
        .get(`/pair-game-quiz/pairs/${gameId}`)
        .set('Authorization', `Bearer ${userToken4}`)
        .expect(200);

      expectCreatedPair(
        getGameResponse3,
        userId3,
        createUserInput3.login,
        userId4,
        createUserInput4.login,
      );

      const getMyCurrentResponse2 = await agent
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', `Bearer ${userToken3}`)
        .expect(200);

      expectCreatedPair(
        getMyCurrentResponse2,
        userId3,
        createUserInput3.login,
        userId4,
        createUserInput4.login,
      );

      const getMyCurrentResponse3 = await agent
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', `Bearer ${userToken4}`)
        .expect(200);

      expectCreatedPair(
        getMyCurrentResponse3,
        userId3,
        createUserInput3.login,
        userId4,
        createUserInput4.login,
      );
    });
  });

  describe('positive2: POST pair-game-quiz/pairs/connection', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`GET -> "/pair-game-quiz/pairs/connection": 
          create new game by user1, 
          connect to game by user2, 
          try to connect by user1, user2. 
          Should return error if current user is already participating in active pair; 
          status 403; 
          used additional methods: 
            DELETE -> /testing/all-data, 
            POST -> /sa/users, 
            POST -> /auth/login, 
            POST -> /sa/quiz/questions, 
            PUT -> /sa/quiz/questions/:questionId/publish, 
            POST -> /pair-game-quiz/pairs/connection;`, async () => {
      await usersTestManager.createUser(createUserInput);
      await usersTestManager.createUser(createUserInput2);

      const loginResponse = await usersTestManager.login(createUserInput.login);
      const loginResponse2 = await usersTestManager.login(
        createUserInput2.login,
      );

      const userToken1 = loginResponse.body.accessToken;
      const userToken2 = loginResponse2.body.accessToken;

      const response = await agent
        .post(sa_quiz_questions_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: 'basicAuthLogin',
          correctAnswers: ['basicAuthPassword'],
        })
        .expect(201);

      expectCreatedQuestion(response, 'basicAuthLogin', 'basicAuthPassword');

      const questionId = response.body.id;

      await agent
        .put(`${sa_quiz_questions_uri}${questionId}/publish`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          published: true,
        })
        .expect(204);

      await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${userToken1}`)
        .expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(200);

      const connectionResponse = await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${userToken1}`)
        .expect(403); // Should return error current user is already participating in active pair;

      expectErrorWithPath(
        connectionResponse,
        403,
        `/pair-game-quiz/pairs/connection`,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
