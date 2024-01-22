import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { createPostInput } from '../../base/utils/constants/posts.constants';
import {
  posts_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { waitForIt } from '../../base/utils/functions/wait';
import { expectPaginatedComments } from '../../base/utils/functions/expect/comments/expectPaginatedComments';
import { createUserInput3 } from '../../base/utils/constants/users.constants';
import { createCommentInput } from '../../base/utils/constants/comments.constant';
import { expectFirstPaginatedComment } from '../../base/utils/functions/expect/comments/expectFirstPaginatedComment';

describe('Posts: GET posts/:id/comments', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: GET posts/:id/comments', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Return comments for specified post If post for passed postId doesn't exist`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .get(`${posts_uri}${postId + 1}/comments`) // postId + 1
        .expect(404);

      expectErrorsMessages(response, 'postId');
    });
  });

  describe('positive: GET posts/:id/comments', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Return comments for specified post`, async () => {
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

      await usersTestManager.createCommentForPost(
        createCommentInput,
        postId,
        token,
      );

      const response = await agent
        .get(`${posts_uri}${postId}/comments`)
        .expect(200);

      expectFirstPaginatedComment(
        response,
        1,
        1,
        10,
        1,
        userId,
        createUserInput3.login,
      );
    });

    it(`should Return comments for specified post`, async () => {
      await agent.delete(testing_allData_uri);

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

      let i = 0;
      while (i < 7) {
        await usersTestManager.createCommentForPost(
          createCommentInput,
          postId,
          token,
        );
        i++;
      }

      const response = await agent
        .get(`${posts_uri}${postId}/comments`)
        .query({ sortDirection: 'asc' })
        .expect(200);

      expectPaginatedComments(
        response,
        1,
        1,
        10,
        7,
        userId,
        createUserInput3.login,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
