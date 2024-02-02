import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { randomAccessToken } from '../../base/utils/constants/auth.constants';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import { createPostInput } from '../../base/utils/constants/posts.constants';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
} from '../../base/utils/constants/users.constants';
import { createCommentInput } from '../../base/utils/constants/comments.constant';
import { lorem10, lorem1000 } from '../../base/utils/constants/lorems';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { waitForIt } from '../../base/utils/functions/wait';
import { testing_allData_uri } from '../../base/utils/constants/routes';
import { expectCreatedComment } from '../../base/utils/functions/expect/comments/expectCreatedComment';

describe('Posts: POST posts/:id/comments', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: POST posts/:id/comments', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Create new comment if bearer token is missing`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      // await usersTestManager.createUser(createUserInput);
      //
      // const userToken = await usersTestManager.login(
      //   createUserInput.login,
      //   createUserInput.password,
      // );
      //
      // const token = userToken.body.accessToken;

      const response = await agent
        .post(`/posts/${postId}/comments`)
        // .set('Authorization', `Bearer ${token}`)
        .send(createCommentInput)
        .expect(401);

      expectErrorWithPath(response, 401, `/posts/${postId}/comments`);
    });

    it(`should not Create new comment if bearer token is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      // await usersTestManager.createUser(createUserInput);
      //
      // const userToken = await usersTestManager.login(
      //   createUserInput.login,
      //   createUserInput.password,
      // );
      //
      // const token = userToken.body.accessToken;

      const response = await agent
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${randomAccessToken}`) // user from token is unauthorized
        .send(createCommentInput)
        .expect(401);

      expectErrorWithPath(response, 401, `/posts/${postId}/comments`);
    });

    it(`should not Create new comment If the inputModel has incorrect values`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      await usersTestManager.createUser(createUserInput);

      const userToken = await usersTestManager.login(createUserInput.login);

      const token = userToken.body.accessToken;

      const response = await agent
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send(lorem10) // minLength: 20
        .expect(400);

      expectErrorsMessages(response, 'content');
    });

    it(`should not Create new comment If the inputModel has incorrect values`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      await usersTestManager.createUser(createUserInput2);

      const userToken = await usersTestManager.login(createUserInput2.login);

      const token = userToken.body.accessToken;

      const response = await agent
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send(lorem1000) // maxLength: 300
        .expect(400);

      expectErrorsMessages(response, 'content');
    });

    it(`should not Create new comment If post with specified postId doesn't exists`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      await usersTestManager.createUser(createUserInput3);

      const userToken = await usersTestManager.login(createUserInput3.login);

      const token = userToken.body.accessToken;

      const response = await agent
        .post(`/posts/${postId + 100}/comments`) // postId + 100
        .set('Authorization', `Bearer ${token}`)
        .send(createCommentInput)
        .expect(404);

      expectErrorsMessages(response, 'postId');
    });
  });

  describe('positive: POST posts/:id/comments', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Create new comment`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const user = await usersTestManager.createUser(createUserInput3);
      const userId = user.body.id;

      const userToken = await usersTestManager.login(createUserInput3.login);

      const token = userToken.body.accessToken;

      const response = await agent
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send(createCommentInput)
        .expect(201);

      expectCreatedComment(
        response,
        createCommentInput,
        userId,
        createUserInput3.login,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
