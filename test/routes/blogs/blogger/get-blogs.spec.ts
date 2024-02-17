import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../../base/managers/users.manager';
import { beforeAllConfig } from '../../../base/settings/beforeAllConfig';
import { testing_allData_uri } from '../../../base/utils/constants/routes';
import { waitForIt } from '../../../../src/base/utils/wait';
import { createBlogInput } from '../../../base/utils/constants/blogs.constant';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  createUserInput4,
  createUserInput5,
} from '../../../base/utils/constants/users.constants';
import { expectCreatedBlog } from '../../../base/utils/functions/expect/blogs/expectCreatedBlog';
import { randomAccessToken } from '../../../base/utils/constants/auth.constants';
import { expectErrorWithPath } from '../../../base/utils/functions/expect/expectErrorWithPath';
import { expectFirstPaginatedBlog } from '../../../base/utils/functions/expect/blogs/expectFirstPaginatedBlog';

describe('Blogs: GET blogger/blogs', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  let userToken1: string;
  let userToken2: string;
  let userToken3: string;
  let userToken4: string;
  let userToken5: string;

  let userId1: number;
  let userId2: number;
  let userId3: number;
  let userId4: number;
  let userId5: number;

  let blogId1: number;
  let blogId2: number;
  let blogId3: number;
  let blogId4: number;
  let blogId5: number;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  beforeEach(async () => {
    await agent.delete(testing_allData_uri);

    await usersTestManager.createUser(createUserInput);
    await usersTestManager.createUser(createUserInput2);
    await usersTestManager.createUser(createUserInput3);
    await usersTestManager.createUser(createUserInput4);
    await usersTestManager.createUser(createUserInput5);

    const loginResponse = await usersTestManager.login(createUserInput.login);
    const loginResponse2 = await usersTestManager.login(createUserInput2.login);
    const loginResponse3 = await usersTestManager.login(createUserInput3.login);
    const loginResponse4 = await usersTestManager.login(createUserInput4.login);
    const loginResponse5 = await usersTestManager.login(createUserInput5.login);

    userToken1 = loginResponse.body.accessToken;
    userToken2 = loginResponse2.body.accessToken;
    userToken3 = loginResponse3.body.accessToken;
    userToken4 = loginResponse4.body.accessToken;
    userToken5 = loginResponse5.body.accessToken;

    userId1 = await usersTestManager.getUserIdByLogin(createUserInput.login);
    userId2 = await usersTestManager.getUserIdByLogin(createUserInput2.login);
    userId3 = await usersTestManager.getUserIdByLogin(createUserInput3.login);
    userId4 = await usersTestManager.getUserIdByLogin(createUserInput4.login);
    userId5 = await usersTestManager.getUserIdByLogin(createUserInput5.login);

    // create 5 blogs
    const response = await agent
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${userToken1}`)
      .send(createBlogInput)
      .expect(201);
    blogId1 = response.body.id;

    expectCreatedBlog(response, createBlogInput);

    const response2 = await agent
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${userToken1}`)
      .send(createBlogInput)
      .expect(201);
    blogId2 = response2.body.id;
    expectCreatedBlog(response, createBlogInput);

    const response3 = await agent
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${userToken1}`)
      .send(createBlogInput)
      .expect(201);
    blogId3 = response3.body.id;
    expectCreatedBlog(response, createBlogInput);

    const response4 = await agent
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${userToken1}`)
      .send(createBlogInput)
      .expect(201);
    blogId4 = response4.body.id;
    expectCreatedBlog(response, createBlogInput);

    const response5 = await agent
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${userToken1}`)
      .send(createBlogInput)
      .expect(201);
    blogId5 = response5.body.id;
    expectCreatedBlog(response, createBlogInput);
  }, 15000);

  describe('negative: GET blogger/blogs', () => {
    it(`should not Get blogs if token is missing`, async () => {
      const response = await agent
        .get(`/blogger/blogs/`)
        // .set('Authorization', `Bearer ${userToken1}`)
        .expect(401);

      expectErrorWithPath(response, 401, `/blogger/blogs/`);
    });

    it(`should not Update blog if token is incorrect`, async () => {
      const response = await agent
        .get(`/blogger/blogs/`)
        .set('Authorization', `Bearer ${randomAccessToken}`) // randomAccessToken
        .expect(401);

      expectErrorWithPath(response, 401, `/blogger/blogs/`);
    });
  });

  describe('positive: GET blogger/blogs', () => {
    it(`should clear db`, async () => {
      await waitForIt();
    }, 15000);

    it(`should Return created blog`, async () => {
      const response = await agent
        .get(`/blogger/blogs/`)
        .set('Authorization', `Bearer ${userToken1}`)
        .query({ pageSize: 3, sortDirection: 'asc' })
        .expect(200);

      expectFirstPaginatedBlog(response, 2, 1, 3, 5, createBlogInput);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
