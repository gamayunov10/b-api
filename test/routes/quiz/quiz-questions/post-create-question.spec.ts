import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

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
import { expectFilteredMessages } from '../../../base/utils/functions/expect/expectFilteredMessages';
import { expectErrorsMessages } from '../../../base/utils/functions/expect/expectErrorsMessages';
import { expectCreatedQuestion } from '../../../base/utils/functions/expect/quiz/expectCreatedQuestion';

describe('QuizQuestions: POST /sa/quiz/questions', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: POST /sa/quiz/questions', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Create question if login is incorrect`, async () => {
      const response = await agent
        .post(sa_quiz_questions_uri)
        .auth('incorrect', basicAuthPassword)
        .send({
          body: 'stringstri',
          correctAnswers: ['stringstri'],
        })
        .expect(401);

      expectFilteredMessages(response, 401, sa_quiz_questions_uri);
    });

    it(`should not Create question if login is incorrect`, async () => {
      const response = await agent
        .post(sa_quiz_questions_uri)
        .auth('', basicAuthPassword)
        .send({
          body: 'stringstri',
          correctAnswers: ['stringstri'],
        })
        .expect(401);

      expectFilteredMessages(response, 401, sa_quiz_questions_uri);
    });

    it(`should not Create question if password is incorrect`, async () => {
      const response = await agent
        .post(sa_quiz_questions_uri)
        .auth(basicAuthLogin, 'incorrect')
        .send({
          body: 'stringstri',
          correctAnswers: ['stringstri'],
        })
        .expect(401);

      expectFilteredMessages(response, 401, sa_quiz_questions_uri);
    });

    it(`should not Create question if password is incorrect`, async () => {
      const response = await agent
        .post(sa_quiz_questions_uri)
        .auth(basicAuthLogin, '')
        .send({
          body: 'stringstri',
          correctAnswers: ['stringstri'],
        })
        .expect(401);

      expectFilteredMessages(response, 401, sa_quiz_questions_uri);
    });

    it(`should not Create question If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .post(sa_quiz_questions_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: '', // empty
          correctAnswers: ['string'],
        })
        .expect(400);

      expectErrorsMessages(response, 'body');
    });

    it(`should not Create question If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .post(sa_quiz_questions_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          body: 'stringstri',
          correctAnswers: [''], // empty
        })
        .expect(400);

      expectErrorsMessages(response, 'correctAnswers');
    });
  });

  describe('positive: POST /sa/quiz/questions', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

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
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
