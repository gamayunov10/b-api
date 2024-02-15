import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import {
  createUserInput,
  userEmail01,
  userEmail02,
  userEmail03,
  userLogin01,
  userLogin02,
  userLogin03,
  userPassword,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../../src/base/utils/wait';
import {
  auth_registration_uri,
  auth_registrationEmailResending_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { SendRegistrationMailUseCase } from '../../../src/features/mail/application/usecases/send-registration-mail.usecase';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';

describe('Auth: auth/registration-email-resending', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: auth/registration-email-resending', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should return 400 If the inputModel has incorrect values`, async () => {
      const response = await agent
        .post(auth_registrationEmailResending_uri)
        .send({
          email: userEmail02,
        })
        .expect(400);

      expectErrorsMessages(response, 'email');
    });

    it(`should return 400 If user already confirmed`, async () => {
      await usersTestManager.createUser(createUserInput);

      const response = await agent
        .post(auth_registrationEmailResending_uri)
        .send({
          email: userEmail01,
        })
        .expect(400);

      expectErrorsMessages(response, 'email');
    });

    it(`should return 429 when More than 5 attempts from one IP-address during 10 seconds`, async () => {
      await agent.delete('/testing/all-data/');

      await waitForIt(10);

      await agent
        .post(auth_registration_uri)
        .send({
          login: userLogin01,
          password: userPassword,
          email: userEmail01,
        })
        .expect(204);

      let i = 0;
      while (i < 10) {
        const response = await agent
          .post(auth_registrationEmailResending_uri)
          .send({
            email: userEmail01,
          });

        if (i < 5) {
          expect(response.status).toBe(204);
        } else {
          expect(response.status).toBe(429);
        }
        i++;
      }
    }, 50000);
  });

  describe('positive: auth/registration-email-resending', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Resend confirmation registration Email if user exists`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: userLogin02,
          password: userPassword,
          email: userEmail02,
        })
        .expect(204);

      await agent
        .post(auth_registrationEmailResending_uri)
        .send({
          email: userEmail02,
        })
        .expect(204);
    }, 10000);

    it(`"should Resend confirmation registration Email, 
    SendRegistrationMailUseCase should be called`, async () => {
      await agent
        .post(auth_registration_uri)
        .send({
          login: userLogin03,
          password: userPassword,
          email: userEmail03,
        })
        .expect(204);

      const executeSpy = jest.spyOn(
        SendRegistrationMailUseCase.prototype,
        'execute',
      );

      await agent
        .post(auth_registrationEmailResending_uri)
        .send({ email: userEmail03 })
        .expect(204);

      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userEmail03,
        }),
      );

      executeSpy.mockClear();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
