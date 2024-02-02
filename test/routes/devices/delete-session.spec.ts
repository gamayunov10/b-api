import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import { randomUUID } from 'crypto';

import { UsersTestManager } from '../../base/managers/users.manager';
import {
  createUserInput,
  createUserInput2,
  createUserInput4,
  createUserInput5,
  createUserInput6,
  userLogin01,
  userLogin02,
  userLogin05,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../base/utils/functions/wait';
import {
  security_devices_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';

describe('Devices: DELETE session security/devices/:id', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: DELETE security/devices/:id', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Terminate specified device session 
        if the JWT refreshToken inside cookie is missing, expired or incorrect`, async () => {
      await usersTestManager.createUser(createUserInput2);
      const res = await usersTestManager.login(createUserInput2.login);
      const refreshToken = res.headers['set-cookie'][0];
      const deviceId = await usersTestManager.getDeviceId(userLogin02);

      await waitForIt(22);

      const response = await agent
        .delete(security_devices_uri + deviceId)
        .set('Cookie', refreshToken) // expired
        .expect(401);

      expectErrorWithPath(response, 401, security_devices_uri + deviceId);
    }, 30000);

    it(`should not Terminate specified device session 
        If try to delete the deviceId of other user`, async () => {
      await usersTestManager.createUser(createUserInput4);
      const resUser1 = await usersTestManager.login(createUserInput4.login);
      const refreshTokenUser1 = resUser1.headers['set-cookie'][0];

      await usersTestManager.createUser(createUserInput5);
      await usersTestManager.login(createUserInput5.login);
      const otherUserDeviceId = await usersTestManager.getDeviceId(userLogin05);

      const response = await agent
        .delete(security_devices_uri + otherUserDeviceId)
        .set('Cookie', refreshTokenUser1)
        .expect(403);

      expectErrorWithPath(
        response,
        403,
        security_devices_uri + otherUserDeviceId,
      );
    }, 10000);

    it(`should not Terminate specified device session 
        If try to delete the deviceId that does not exist`, async () => {
      await waitForIt(10);

      await usersTestManager.createUser(createUserInput6);
      const res = await usersTestManager.login(createUserInput6.login);
      const refreshToken = res.headers['set-cookie'][0];
      const deviceId = randomUUID();

      const response = await agent
        .delete(security_devices_uri + deviceId)
        .set('Cookie', refreshToken)
        .expect(404);

      expect(response.body).toContain('Not Found');
    }, 20000);
  });

  describe('positive: DELETE security/devices/:id', () => {
    it(`should clear db`, async () => {
      await waitForIt(11);
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Terminate specified device session`, async () => {
      await usersTestManager.createUser(createUserInput);

      const res = await usersTestManager.login(createUserInput.login);
      const refreshToken = res.headers['set-cookie'][0];

      const deviceId = await usersTestManager.getDeviceId(userLogin01);

      await agent
        .delete(security_devices_uri + deviceId)
        .set('Cookie', refreshToken)
        .expect(204);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
