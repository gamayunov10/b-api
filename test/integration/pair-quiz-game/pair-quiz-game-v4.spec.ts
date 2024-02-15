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
} from '../../base/utils/constants/users.constants';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../../base/utils/constants/auth.constants';
import { expectCreatedPair } from '../../base/utils/functions/expect/quiz/expectCreatedPair';
import { waitForIt } from '../../../src/base/utils/wait';
import { GameStatuses } from '../../../src/base/enums/game-statuses';

describe('PairQuizGame: v3', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  let userToken1: string;
  let userToken2: string;
  let userToken3: string;
  let userToken4: string;

  let userId1: number;
  let userId2: number;
  let userId3: number;
  let userId4: number;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  beforeEach(async () => {
    await agent.delete(testing_allData_uri);

    await usersTestManager.createUser(createUserInput);
    await usersTestManager.createUser(createUserInput2);
    await usersTestManager.createUser(createUserInput3);
    await usersTestManager.createUser(createUserInput4);

    const loginResponse = await usersTestManager.login(createUserInput.login);
    const loginResponse2 = await usersTestManager.login(createUserInput2.login);
    const loginResponse3 = await usersTestManager.login(createUserInput3.login);
    const loginResponse4 = await usersTestManager.login(createUserInput4.login);

    userToken1 = loginResponse.body.accessToken;
    userToken2 = loginResponse2.body.accessToken;
    userToken3 = loginResponse3.body.accessToken;
    userToken4 = loginResponse4.body.accessToken;

    userId1 = await usersTestManager.getUserIdByLogin(createUserInput.login);
    userId2 = await usersTestManager.getUserIdByLogin(createUserInput2.login);
    userId3 = await usersTestManager.getUserIdByLogin(createUserInput3.login);
    userId4 = await usersTestManager.getUserIdByLogin(createUserInput4.login);

    const questionsResponse = await agent
      .post(sa_quiz_questions_uri)
      .auth(basicAuthLogin, basicAuthPassword)
      .send({
        body: 'question_answer_1',
        correctAnswers: ['question_answer_1'],
      })
      .expect(201);

    const questionId = questionsResponse.body.id;

    await agent
      .put(`${sa_quiz_questions_uri}${questionId}/publish`)
      .auth(basicAuthLogin, basicAuthPassword)
      .send({
        published: true,
      })
      .expect(204);

    const questionsResponse2 = await agent
      .post(sa_quiz_questions_uri)
      .auth(basicAuthLogin, basicAuthPassword)
      .send({
        body: 'question_description_2',
        correctAnswers: ['question_answer_2'],
      })
      .expect(201);

    const questionId2 = questionsResponse2.body.id;

    await agent
      .put(`${sa_quiz_questions_uri}${questionId2}/publish`)
      .auth(basicAuthLogin, basicAuthPassword)
      .send({
        published: true,
      })
      .expect(204);

    const questionsResponse3 = await agent
      .post(sa_quiz_questions_uri)
      .auth(basicAuthLogin, basicAuthPassword)
      .send({
        body: 'question_description_3',
        correctAnswers: ['question_answer_3'],
      })
      .expect(201);

    const questionId3 = questionsResponse3.body.id;

    await agent
      .put(`${sa_quiz_questions_uri}${questionId3}/publish`)
      .auth(basicAuthLogin, basicAuthPassword)
      .send({
        published: true,
      })
      .expect(204);

    const questionsResponse4 = await agent
      .post(sa_quiz_questions_uri)
      .auth(basicAuthLogin, basicAuthPassword)
      .send({
        body: 'question_description_4',
        correctAnswers: ['question_answer_4'],
      })
      .expect(201);

    const questionId4 = questionsResponse4.body.id;

    await agent
      .put(`${sa_quiz_questions_uri}${questionId4}/publish`)
      .auth(basicAuthLogin, basicAuthPassword)
      .send({
        published: true,
      })
      .expect(204);

    const questionsResponse5 = await agent
      .post(sa_quiz_questions_uri)
      .auth(basicAuthLogin, basicAuthPassword)
      .send({
        body: 'question_description_5',
        correctAnswers: ['question_answer_5'],
      })
      .expect(201);

    const questionId5 = questionsResponse5.body.id;

    await agent
      .put(`${sa_quiz_questions_uri}${questionId5}/publish`)
      .auth(basicAuthLogin, basicAuthPassword)
      .send({
        published: true,
      })
      .expect(204);
  }, 15000);

  describe('Quiz: 1', () => {
    it(`POST -> "/pair-game-quiz/pairs/my-current/answers", 
        GET -> "/pair-game-quiz/pairs": create game by user1, connect to game by user2. 
        Add 3 incorrect answers by user2. 
        Add 3 correct answers by user1. 
        Add 2 correct answers by user2. 
        Call "/pair-game-quiz/pairs/my-current" endpoint by user2. 
        Should return active game. 
        Await 10 sec. 
        Should return status 404. 
        Get game by user2. 
        Should return finished game - status: "Finished", 
        firstPlayerProgress.score: 3, 
        secondPlayerProgress.score: 3, 
        finishGameDate: not to be null; status 200;`, async () => {
      // create game1 by user1, connect to game by user2.
      await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${userToken1}`)
        .expect(200);

      const createdPairResponse = await agent
        .post(`/pair-game-quiz/pairs/connection`)
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(200);

      const gameId_1 = createdPairResponse.body.id;

      //  Add 3 incorrect answers by user2.
      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', `Bearer ${userToken2}`)
        .send({
          answer: 'question_answer_incorrect',
        })
        .expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', `Bearer ${userToken2}`)
        .send({
          answer: 'question_answer_incorrect',
        })
        .expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', `Bearer ${userToken2}`)
        .send({
          answer: 'question_answer_incorrect',
        })
        .expect(200);

      // Add 3 correct answers by user1.
      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send({
          answer: 'question_answer_5',
        })
        .expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send({
          answer: 'question_answer_4',
        })
        .expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send({
          answer: 'question_answer_3',
        })
        .expect(200);

      // add 2 correct answers by user2.
      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', `Bearer ${userToken2}`)
        .send({
          answer: 'question_answer_2',
        })
        .expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', `Bearer ${userToken2}`)
        .send({
          answer: 'question_answer_1',
        })
        .expect(200);

      // Call "/pair-game-quiz/pairs/my-current" endpoint by user2. Should return status 404
      await agent
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(200);

      await waitForIt(14);

      // Call "/pair-game-quiz/pairs/my-current" endpoint by user2. Should return status 404
      await agent
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(404);

      // Get game by user2.
      // Should return finished game - status: "Finished",
      // firstPlayerProgress.score: 3,
      // secondPlayerProgress.score: 3,
      // finishGameDate: not to be null; status 200;
      const getGameResponse = await agent
        .get(`/pair-game-quiz/pairs/${gameId_1}`)
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(200);

      expectCreatedPair(
        getGameResponse,
        userId1,
        createUserInput.login,
        userId2,
        createUserInput2.login,
        3,
        3,
        GameStatuses.FINISHED,
      );
    }, 25000);
  });

  afterAll(async () => {
    await app.close();
  });
});
