import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../../base/managers/users.manager';
import { beforeAllConfig } from '../../../base/settings/beforeAllConfig';
import {
  sa_quiz_questions_uri,
  testing_allData_uri,
} from '../../../base/utils/constants/routes';
import { waitForIt } from '../../../../src/base/utils/wait';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../../../base/utils/constants/auth.constants';
import { expectErrorWithPath } from '../../../base/utils/functions/expect/expectErrorWithPath';
import { expectPaginatedQuestions } from '../../../base/utils/functions/expect/quiz/expectPaginatedQuestions';

describe('QuizQuestions: GET /sa/quiz/questions/', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: GET /sa/quiz/questions/', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should Create 10 questions`, async () => {
      let i = 0;
      while (i <= 10) {
        await agent
          .post(sa_quiz_questions_uri)
          .auth(basicAuthLogin, basicAuthPassword)
          .send({
            body: `question_${i + 1}`,
            correctAnswers: [`question_${i + 1}`],
          })
          .expect(201);
        i++;
      }
    });

    it(`should not Get question if login is incorrect`, async () => {
      const response = await agent
        .get(sa_quiz_questions_uri)
        .auth('incorrect', basicAuthPassword)
        .expect(401);

      expectErrorWithPath(response, 401, sa_quiz_questions_uri);
    });

    it(`should not Get question if login is incorrect`, async () => {
      const response = await agent
        .get(sa_quiz_questions_uri)
        .auth('', basicAuthPassword)
        .expect(401);

      expectErrorWithPath(response, 401, sa_quiz_questions_uri);
    });

    it(`should not Get question if password is incorrect`, async () => {
      const response = await agent
        .get(sa_quiz_questions_uri)
        .auth(basicAuthLogin, 'incorrect')
        .expect(401);

      expectErrorWithPath(response, 401, sa_quiz_questions_uri);
    });

    it(`should not Get question if password is incorrect`, async () => {
      const response = await agent
        .get(sa_quiz_questions_uri)
        .auth(basicAuthLogin, '')
        .expect(401);

      expectErrorWithPath(response, 401, sa_quiz_questions_uri);
    });
  });

  describe('positive: GET /sa/quiz/questions/', () => {
    it(`should waitForIt`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Create 29 questions`, async () => {
      let i = 0;
      while (i < 29) {
        await agent
          .post(sa_quiz_questions_uri)
          .auth(basicAuthLogin, basicAuthPassword)
          .send({
            body: `question_${i + 1}`,
            correctAnswers: [`question_${i + 1}`],
          })
          .expect(201);
        i++;
      }
    });

    it(`should Returns all questions with pagination and filtering`, async () => {
      const response = await agent
        .get(sa_quiz_questions_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ sortDirection: 'asc' })
        .expect(200);

      expectPaginatedQuestions(
        response,
        3,
        1,
        10,
        29,
        'question_1',
        'question_1',
        false,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
