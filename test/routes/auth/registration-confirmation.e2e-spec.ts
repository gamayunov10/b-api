import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { initializeApp } from '../../base/settings/initializeApp';
import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query.repository';
import {
  userEmail01,
  userLogin01,
  userPassword,
} from '../../base/utils/constants/users.constants';
import {
  auth_registration_uri,
  auth_registrationConfirmation_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { invalidConfirmationCode } from '../../base/utils/constants/auth.constants';
import { waitForIt } from '../../base/utils/functions/wait';

describe('Auth: auth/registration-confirmation', () => {
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

  describe('negative: registration-confirmation', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should return 400 f the confirmation code is incorrect`, async () => {
      await agent
        .post(auth_registrationConfirmation_uri)
        .send({
          code: invalidConfirmationCode,
        })
        .expect(400);
    });

    it(`should return 400 if the confirmation code already been applied`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(204);

      const confirmationCode = await usersTestManager.getEmailConfirmationCode(
        userEmail01,
      );

      await agent
        .post(auth_registrationConfirmation_uri)
        .send({
          code: confirmationCode,
        })
        .expect(204);

      await agent
        .post(auth_registrationConfirmation_uri)
        .send({
          code: confirmationCode,
        })
        .expect(400);
    });

    it(`should return 429 if More than 5 attempts from one IP-address during 10 seconds`, async () => {
      await waitForIt(10);

      let i = 0;
      while (i < 10) {
        const response = await agent
          .post(auth_registrationConfirmation_uri)
          .send({
            code: invalidConfirmationCode,
          });

        if (i < 5) {
          expect(response.status).toBe(400);
        } else {
          expect(response.status).toBe(429);
        }
        i++;
      }
    }, 20000);
  });

  describe('positive: registration-confirmation', () => {
    it(`should clear db, wait 10s`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should confirm registration by confirmationCode`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(204);

      const confirmationCode = await usersTestManager.getEmailConfirmationCode(
        userEmail01,
      );

      await agent
        .post(auth_registrationConfirmation_uri)
        .send({
          code: confirmationCode,
        })
        .expect(204);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
