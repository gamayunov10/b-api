import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import {
  userEmail01,
  userEmail03,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../../src/base/utils/wait';
import {
  auth_passwordRecovery_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { PasswordRecoveryUseCase } from '../../../src/features/auth/api/public/application/usecases/password/password-recovery.usecase';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';

describe('Auth: auth/password-recovery', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: auth/password-recovery', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should return 400 If the inputModel has invalid email, 
    PasswordRecoveryUseCase should not be called`, async () => {
      const executeSpy = jest.spyOn(
        PasswordRecoveryUseCase.prototype,
        'execute',
      );

      await agent
        .post(auth_passwordRecovery_uri)
        .send({
          email: '',
        })
        .expect(400);

      expect(executeSpy).not.toHaveBeenCalled();
    });

    it(`should return 400 If the inputModel has invalid email`, async () => {
      const executeSpy = jest.spyOn(
        PasswordRecoveryUseCase.prototype,
        'execute',
      );

      await agent
        .post(auth_passwordRecovery_uri)
        .send({
          email: 'some@email',
        })
        .expect(400);

      expect(executeSpy).not.toHaveBeenCalled();
    });

    it(`should return 429 if More than 5 attempts from one IP-address during 10 seconds`, async () => {
      await waitForIt(10);

      let i = 0;
      while (i < 10) {
        const response = await agent.post(auth_passwordRecovery_uri).send({
          email: userEmail03,
        });

        if (i < 5) {
          expect(response.status).toBe(204);
        } else {
          expect(response.status).toBe(429);
        }
        i++;
      }
    }, 20000);
  });

  describe('positive: auth/password-recovery', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Confirm Password recovery, PasswordRecoveryUseCase should be called`, async () => {
      const executeSpy = jest.spyOn(
        PasswordRecoveryUseCase.prototype,
        'execute',
      );

      await agent
        .post(auth_passwordRecovery_uri)
        .send({
          email: userEmail01,
        })
        .expect(204);

      expect(executeSpy).toHaveBeenCalled();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
