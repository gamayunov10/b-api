import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import {
  createUserInput,
  createUserInput2,
  userLogin02,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../base/utils/functions/wait';
import {
  security_devices_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { expectFilteredMessages } from '../../base/utils/functions/expect/expectFilteredMessages';
import { expectGetDevices } from '../../base/utils/functions/expect/devices/expectGetDevices';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';

describe('Devices: GET security/devices', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: GET security/devices', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Return all devices with active sessions for current user
     if the JWT refreshToken inside cookie is missing, expired or incorrect`, async () => {
      await usersTestManager.createUser(createUserInput2);
      // const res = await usersTestManager.login(loginUserInput2);
      // const refreshToken = res.headers['set-cookie'][0];

      const response = await agent
        .get(security_devices_uri)
        // .set('Cookie', refreshToken) // missing
        .expect(401);

      expectFilteredMessages(response, 401, security_devices_uri);
    });

    it(`should not Return all devices with active sessions for current user if the JWT refreshToken inside cookie is missing, expired or incorrect`, async () => {
      await usersTestManager.createUser(createUserInput);
      const res = await usersTestManager.login(createUserInput.login);
      const refreshToken = res.headers['set-cookie'][0];

      await waitForIt(22);

      const response = await agent
        .get(security_devices_uri)
        .set('Cookie', refreshToken) // expired
        .expect(401);

      expectFilteredMessages(response, 401, security_devices_uri);
    }, 38000);
  });

  describe('positive: GET security/devices', () => {
    it(`should clear db`, async () => {
      await waitForIt(11);
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Return all devices with active sessions for current user`, async () => {
      await usersTestManager.createUser(createUserInput2);
      const res = await usersTestManager.login(createUserInput2.login);
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
