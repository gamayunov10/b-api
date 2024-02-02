import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';

import { UsersTestManager } from '../../../base/managers/users.manager';
import { beforeAllConfig } from '../../../base/settings/beforeAllConfig';
import {
  sa_quiz_questions_uri,
  testing_allData_uri,
} from '../../../base/utils/constants/routes';
import { waitForIt } from '../../../base/utils/functions/wait';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../../../base/utils/constants/auth.constants';
import { expectErrorWithPath } from '../../../base/utils/functions/expect/expectErrorWithPath';
import { expectCreatedQuestion } from '../../../base/utils/functions/expect/quiz/expectCreatedQuestion';

describe('QuizQuestions: PUT /sa/quiz/questions/{id}', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: DELETE /sa/quiz/questions/{id}', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    let questionId: string;

    it(`should Create question to define questionId`, async () => {
      const response = await agent
        .post(sa_quiz_questions_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: 'stringstri',
          correctAnswers: ['stringstri'],
        })
        .expect(201);

      expectCreatedQuestion(response, 'stringstri', 'stringstri');

      questionId = response.body.id;
    });

    it(`should not Delete question if login is incorrect`, async () => {
      const response = await agent
        .delete(sa_quiz_questions_uri + questionId)
        .auth('incorrect', basicAuthPassword)
        .expect(401);

      expectErrorWithPath(response, 401, sa_quiz_questions_uri + questionId);
    });

    it(`should not Delete question if login is incorrect`, async () => {
      const response = await agent
        .delete(sa_quiz_questions_uri + questionId)
        .auth('', basicAuthPassword)
        .expect(401);

      expectErrorWithPath(response, 401, sa_quiz_questions_uri + questionId);
    });

    it(`should not Delete question if password is incorrect`, async () => {
      const response = await agent
        .delete(sa_quiz_questions_uri + questionId)
        .auth(basicAuthLogin, 'incorrect')
        .expect(401);

      expectErrorWithPath(response, 401, sa_quiz_questions_uri + questionId);
    });

    it(`should not Delete question if password is incorrect`, async () => {
      const response = await agent
        .delete(sa_quiz_questions_uri + questionId)
        .auth(basicAuthLogin, '')
        .expect(401);

      expectErrorWithPath(response, 401, sa_quiz_questions_uri + questionId);
    });

    it(`should not Delete question if question does not exist`, async () => {
      await agent
        .delete(sa_quiz_questions_uri + randomUUID())
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(404);
    });
  });

  describe('positive: DELETE /sa/quiz/questions/{id}', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    let questionId: string;

    it(`should Create question`, async () => {
      const response = await agent
        .post(sa_quiz_questions_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: 'stringstri',
          correctAnswers: ['stringstri'],
        })
        .expect(201);

      expectCreatedQuestion(response, 'stringstri', 'stringstri');

      questionId = response.body.id;
    });

    it(`should Delete question`, async () => {
      await agent
        .delete(sa_quiz_questions_uri + questionId)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(204);

      await agent
        .delete(sa_quiz_questions_uri + questionId)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
