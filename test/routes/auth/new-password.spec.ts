import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';

import { UsersTestManager } from '../../base/managers/users.manager';
import {
  userEmail01,
  userLogin01,
  userPassword,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../base/utils/functions/wait';
import {
  auth_newPassword_uri,
  auth_passwordRecovery_uri,
  auth_registration_uri,
  auth_registrationConfirmation_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';

describe('Auth: auth/new-password', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: auth/new-password', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should`, async () => {
      await usersTestManager.getEmailConfirmationCode(userLogin01);
    });

    it(`should return 400 If the inputModel has incorrect value`, async () => {
      await agent
        .post(auth_newPassword_uri)
        .send({
          newPassword: 'new271543523',
          recoveryCode: '',
        })
        .expect(400);
    });

    it(`should return 400 If the inputModel has incorrect value`, async () => {
      await agent
        .post(auth_newPassword_uri)
        .send({
          newPassword: 'new271543523',
          recoveryCode: randomUUID(),
        })
        .expect(400);
    });

    it(`should return 429 if More than 5 attempts from one IP-address during 10 seconds`, async () => {
      await waitForIt(10);

      let i = 0;
      while (i < 10) {
        const response = await agent.post(auth_newPassword_uri).send({
          newPassword: 'new271543523',
          recoveryCode: randomUUID(),
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

  describe('positive: auth/new-password', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Confirm Password recovery`, async () => {
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
        .post(auth_passwordRecovery_uri)
        .send({
          email: userEmail01,
        })
        .expect(204);

      const recoveryCode = await usersTestManager.getPasswordRecoveryCode(
        userEmail01,
      );

      await agent
        .post(auth_newPassword_uri)
        .send({
          newPassword: 'new271543523',
          recoveryCode: recoveryCode,
        })
        .expect(204);
    }, 10000);
  });

  afterAll(async () => {
    await app.close();
  });
});
