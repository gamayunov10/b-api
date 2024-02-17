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
import { randomAccessToken } from '../../../base/utils/constants/auth.constants';
import { expectErrorWithPath } from '../../../base/utils/functions/expect/expectErrorWithPath';
import { createPostInput } from '../../../base/utils/constants/posts.constants';
import { expectFirstPaginatedPost } from '../../../base/utils/functions/expect/posts/expectFirstPaginatedPost';

describe('Blogs: GET blogger/blogs/{blogId}/posts', () => {
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
  let postId1: number;

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

    const blog = await agent
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${userToken1}`)
      .send(createBlogInput)
      .expect(201);
    blogId1 = blog.body.id;

    const post = await agent
      .post(`/blogger/blogs/${blogId1}/posts`)
      .set('Authorization', `Bearer ${userToken1}`)
      .send(createPostInput)
      .expect(201);
    postId1 = post.body.id;
  }, 15000);

  describe('negative: GET blogger/blogs/{blogId}/posts', () => {
    it(`should not Get posts if token is missing`, async () => {
      const response = await agent
        .get(`/blogger/blogs/${blogId1}/posts`)
        // .set('Authorization', `Bearer ${userToken1}`)
        .expect(401);

      expectErrorWithPath(response, 401, `/blogger/blogs/${blogId1}/posts`);
    });

    it(`should not Get posts if token is incorrect`, async () => {
      const response = await agent
        .get(`/blogger/blogs/${blogId1}/posts`)
        .set('Authorization', `Bearer ${randomAccessToken}`) // randomAccessToken
        .expect(401);

      expectErrorWithPath(response, 401, `/blogger/blogs/${blogId1}/posts`);
    });
  });

  describe('positive: GET blogger/blogs/{blogId}/posts', () => {
    it(`should clear db`, async () => {
      await waitForIt();
    }, 15000);

    it(`should Get posts`, async () => {
      const response = await agent
        .get(`/blogger/blogs/${blogId1}/posts`)
        .set('Authorization', `Bearer ${userToken1}`)
        .query({ pageSize: 3, sortDirection: 'asc' })
        .expect(200);

      expectFirstPaginatedPost(
        response,
        1,
        1,
        3,
        1,
        createPostInput,
        blogId1.toString(),
        createBlogInput.name,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
