import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { createUserInput } from '../../base/utils/constants/users.constants';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { expectCreatedBlog } from '../../base/utils/functions/expect/blogs/expectCreatedBlog';

describe('PairQuizGame: v3', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('Blogger: int', () => {
    it(`GET -> "sa/blogs": should return blogs with owner info; 
        status 200; 
        content: blog array with pagination; 
        used additional methods: 
        POST -> /sa/users, 
        POST => /auth/login, 
        POST -> /blogger/blogs;`, async () => {
      await usersTestManager.createUser(createUserInput);
      const loginResponse = await usersTestManager.login(createUserInput.login);
      const userToken1 = loginResponse.body.accessToken;

      const response = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${userToken1}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(response, createBlogInput);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
