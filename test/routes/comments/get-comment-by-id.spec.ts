import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { waitForIt } from '../../../src/base/utils/wait';
import {
  comments_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { createPostInput } from '../../base/utils/constants/posts.constants';
import { createUserInput3 } from '../../base/utils/constants/users.constants';
import { createCommentInput } from '../../base/utils/constants/comments.constant';
import { expectCreatedComment } from '../../base/utils/functions/expect/comments/expectCreatedComment';

describe('Comments: GET comments/:id', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: GET comments/:id', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Return comment by id if comment does not exist`, async () => {
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

      const comment = await usersTestManager.createCommentForPost(
        createCommentInput,
        postId,
        token,
      );
      const commentId = comment.body.id;

      const response = await agent
        .get(comments_uri + commentId + 1) // commentId + 1
        .expect(404);

      expectErrorsMessages(response, 'commentId');
    });
  });

  describe('positive: GET comments/:id', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Return comment by id`, async () => {
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

      const comment = await usersTestManager.createCommentForPost(
        createCommentInput,
        postId,
        token,
      );
      const commentId = comment.body.id;

      const response = await agent.get(comments_uri + commentId).expect(200);

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
