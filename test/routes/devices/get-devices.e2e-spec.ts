import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { initializeApp } from '../../base/settings/initializeApp';
import {
  createUserInput,
  createUserInput2,
  loginUserInput,
  loginUserInput2,
  userLogin02,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../base/utils/functions/wait';
import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query.repository';
import {
  security_devices_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { invalidRefreshToken } from '../../base/utils/constants/auth.constants';
import { expecFilteredMessages } from '../../base/utils/functions/expecFilteredMessages';
import { expectGetDevices } from '../../base/utils/functions/devices/expectGetDevices';

describe('Auth: get security/devices', () => {
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

  describe('negative: get security/devices', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should not Return all devices with active sessions for current user
     if the JWT refreshToken inside cookie is missing, expired or incorrect `, async () => {
      await usersTestManager.createUser(createUserInput);
      const res = await usersTestManager.login(loginUserInput);
      const refreshToken = res.headers['set-cookie'][0];

      const response = await agent
        .get(security_devices_uri)
        // .set('Cookie', refreshToken) // missing
        .expect(401);

      expecFilteredMessages(response, 401, security_devices_uri);
    });

    it(`should not Return all devices with active sessions for current user
     if the JWT refreshToken inside cookie is missing, expired or incorrect `, async () => {
      await usersTestManager.createUser(createUserInput);
      const res = await usersTestManager.login(loginUserInput);
      const refreshToken = res.headers['set-cookie'][0];

      await waitForIt(11);

      const response = await agent
        .get(security_devices_uri)
        .set('Cookie', refreshToken) // expired
        .expect(401);

      expecFilteredMessages(response, 401, security_devices_uri);
    });

    it(`should not Return all devices with active sessions for current user
     if the JWT refreshToken inside cookie is missing, expired or incorrect `, async () => {
      await usersTestManager.createUser(createUserInput2);
      const res = await usersTestManager.login(loginUserInput2);
      const refreshToken = res.headers['set-cookie'][0];

      await waitForIt(11);

      const response = await agent
        .get(security_devices_uri)
        .set('Cookie', invalidRefreshToken) // incorrect
        .expect(401);

      expecFilteredMessages(response, 401, security_devices_uri);
    });
  });

  describe('positive: get security/devices', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
      await waitForIt(10);
    }, 15000);

    it(`should Return all devices with active sessions for current user`, async () => {
      await usersTestManager.createUser(createUserInput2);

      const res = await usersTestManager.login(loginUserInput2);

      const refreshToken = res.headers['set-cookie'][0];

      const deviceId = await usersTestManager.getDeviceId(userLogin02);

      const response = await agent
        .get(security_devices_uri)
        .set('Cookie', refreshToken)
        .expect(200);

      expectGetDevices(response, deviceId);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
