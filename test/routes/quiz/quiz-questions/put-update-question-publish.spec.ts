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
import { expectErrorsMessages } from '../../../base/utils/functions/expect/expectErrorsMessages';
import { expectCreatedQuestion } from '../../../base/utils/functions/expect/quiz/expectCreatedQuestion';
import { expectFirstPaginatedQuestion } from '../../../base/utils/functions/expect/quiz/expectFirstPaginatedQuestion';

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

  describe('negative: PUT /sa/quiz/questions/{id}/publish', () => {
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

    it(`should not Publish/unpublish question if login is incorrect`, async () => {
      const response = await agent
        .put(`${sa_quiz_questions_uri}${questionId}/publish`)
        .auth('incorrect', basicAuthPassword)
        .send({
          published: true,
        })
        .expect(401);

      expectErrorWithPath(
        response,
        401,
        `${sa_quiz_questions_uri}${questionId}/publish`,
      );
    });

    it(`should not Publish/unpublish question if login is incorrect`, async () => {
      const response = await agent
        .put(`${sa_quiz_questions_uri}${questionId}/publish`)
        .auth('', basicAuthPassword)
        .send({
          published: true,
        })
        .expect(401);

      expectErrorWithPath(
        response,
        401,
        `${sa_quiz_questions_uri}${questionId}/publish`,
      );
    });

    it(`should not Publish/unpublish question if password is incorrect`, async () => {
      const response = await agent
        .put(`${sa_quiz_questions_uri}${questionId}/publish`)
        .auth(basicAuthLogin, 'incorrect')
        .send({
          published: true,
        })
        .expect(401);

      expectErrorWithPath(
        response,
        401,
        `${sa_quiz_questions_uri}${questionId}/publish`,
      );
    });

    it(`should not Publish/unpublish question if password is incorrect`, async () => {
      const response = await agent
        .put(`${sa_quiz_questions_uri}${questionId}/publish`)
        .auth(basicAuthLogin, '')
        .send({
          published: true,
        })
        .expect(401);

      expectErrorWithPath(
        response,
        401,
        `${sa_quiz_questions_uri}${questionId}/publish`,
      );
    });

    it(`should not Publish/unpublish question If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .put(`${sa_quiz_questions_uri}${questionId}/publish`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          published: '', // expect boolean
        })
        .expect(400);

      expectErrorsMessages(response, 'published');
    });

    it(`should not Publish/unpublish question If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .put(`${sa_quiz_questions_uri}${questionId}/publish`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          published: 'Publish', // expect boolean
        })
        .expect(400);

      expectErrorsMessages(response, 'published');
    });

    it(`should not Publish/unpublish question If the inputModel has incorrect values
        returning 400`, async () => {
      const response = await agent
        .put(`${sa_quiz_questions_uri}${questionId}/publish`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          published: 1, // expect boolean
        })
        .expect(400);

      expectErrorsMessages(response, 'published');
    });

    it(`should not Publish/unpublish question if question does not exist`, async () => {
      await agent
        .put(`${sa_quiz_questions_uri}${randomUUID()}/publish`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          published: true,
        })
        .expect(404);
    });
  });

  describe('positive: PUT /sa/quiz/questions/{id}/publish', () => {
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

    it(`should Publish question`, async () => {
      await agent
        .put(`${sa_quiz_questions_uri}${questionId}/publish`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          published: true,
        })
        .expect(204);
    });

    it(`should Get published question`, async () => {
      const response = await agent
        .get(sa_quiz_questions_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expectFirstPaginatedQuestion(
        response,
        1,
        1,
        10,
        1,
        'stringstri',
        'stringstri',
        true,
      );
    });

    it(`should UnPublish question`, async () => {
      await agent
        .put(`${sa_quiz_questions_uri}${questionId}/publish`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          published: false,
        })
        .expect(204);
    });

    it(`should Get published question`, async () => {
      const response = await agent
        .get(sa_quiz_questions_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expectFirstPaginatedQuestion(
        response,
        1,
        1,
        10,
        1,
        'stringstri',
        'stringstri',
        false,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
