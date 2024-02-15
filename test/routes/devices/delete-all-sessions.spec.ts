import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  createUserInput4,
  createUserInput5,
  userLogin02,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../../src/base/utils/wait';
import {
  security_devices_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { invalidRefreshToken } from '../../base/utils/constants/auth.constants';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import { expectGetDevices } from '../../base/utils/functions/expect/devices/expectGetDevices';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';

describe('Devices: DELETE all sessions security/devices', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: DELETE security/devices', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Terminate all other sessions (exclude current) 
    if the JWT refreshToken inside cookie is missing, expired or incorrect`, async () => {
      await usersTestManager.createUser(createUserInput);
      // const res = await usersTestManager.login(loginUserInput);
      // const refreshToken = res.headers['set-cookie'][0];

      const response = await agent
        .delete(security_devices_uri)
        // .set('Cookie', refreshToken) // missing
        .expect(401);

      expectErrorWithPath(response, 401, security_devices_uri);
    }, 10000);

    it(`should not Terminate all other sessions (exclude current) 
    if the JWT refreshToken inside cookie is missing, expired or incorrect`, async () => {
      await usersTestManager.createUser(createUserInput2);
      const res = await usersTestManager.login(createUserInput2.login);
      const refreshToken = res.headers['set-cookie'][0];

      await waitForIt(21);

      const response = await agent
        .delete(security_devices_uri)
        .set('Cookie', refreshToken) // expired
        .expect(401);

      expectErrorWithPath(response, 401, security_devices_uri);
    }, 30000);

    it(`should not Terminate all other sessions (exclude current)  
        if the JWT refreshToken inside cookie is missing, expired or incorrect`, async () => {
      await usersTestManager.createUser(createUserInput3);
      // const res = await usersTestManager.login(loginUserInput3);
      // const refreshToken = res.headers['set-cookie'][0];

      const response = await agent
        .delete(security_devices_uri)
        .set('Cookie', invalidRefreshToken) // incorrect
        .expect(401);

      expectErrorWithPath(response, 401, security_devices_uri);
    }, 10000);
  });

  describe('positive: DELETE security/devices', () => {
    it(`should clear db`, async () => {
      await waitForIt(11);
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Terminate all other sessions (exclude current)`, async () => {
      await usersTestManager.createUser(createUserInput);
      await usersTestManager.login(createUserInput.login);

      await usersTestManager.createUser(createUserInput2);
      const res2 = await usersTestManager.login(createUserInput2.login);
      const refreshToken = res2.headers['set-cookie'][0];
      const deviceId = await usersTestManager.getDeviceId(userLogin02);

      await usersTestManager.createUser(createUserInput3);
      await usersTestManager.login(createUserInput3.login);

      await usersTestManager.createUser(createUserInput4);
      await usersTestManager.login(createUserInput4.login);

      await usersTestManager.createUser(createUserInput5);
      await usersTestManager.login(createUserInput5.login);

      await agent
        .delete(security_devices_uri)
        .set('Cookie', refreshToken)
        .expect(204);

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
