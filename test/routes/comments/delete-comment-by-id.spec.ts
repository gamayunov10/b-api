import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import {
  comments_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { createPostInput } from '../../base/utils/constants/posts.constants';
import {
  createUserInput,
  createUserInput3,
  createUserInput4,
} from '../../base/utils/constants/users.constants';
import { createCommentInput } from '../../base/utils/constants/comments.constant';
import { expectFilteredMessages } from '../../base/utils/functions/expect/expectFilteredMessages';
import { randomAccessToken } from '../../base/utils/constants/auth.constants';
import { waitForIt } from '../../base/utils/functions/wait';

describe('Comments: DELETE comments/:id', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: DELETE comments/:id', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not delete comment by id if token is missing`, async () => {
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
        .delete(comments_uri + commentId)
        // .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expectFilteredMessages(response, 401, comments_uri + commentId);
    });

    it(`should not delete comment by id if token is incorrect`, async () => {
      await agent.delete(testing_allData_uri);

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
        .delete(comments_uri + commentId)
        .set('Authorization', `Bearer ${randomAccessToken}`) // randomAccessToken
        .expect(401);

      expectFilteredMessages(response, 401, comments_uri + commentId);
    });

    it(`should not delete comment by id if comment does not exist`, async () => {
      await agent.delete(testing_allData_uri);

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
        .delete(comments_uri + commentId + 1) // commentId + 1
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expectErrorsMessages(response, 'commentId');
    });

    it(`should not delete comment by id If try edit the comment that is not your own`, async () => {
      await agent.delete(testing_allData_uri);

      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      await usersTestManager.createUser(createUserInput3);
      await usersTestManager.createUser(createUserInput4);

      const userToken = await usersTestManager.login(createUserInput3.login);
      const token = userToken.body.accessToken;

      const userToken2 = await usersTestManager.login(createUserInput4.login);
      const token2 = userToken2.body.accessToken;

      const comment = await usersTestManager.createCommentForPost(
        createCommentInput,
        postId,
        token,
      );
      const commentId = comment.body.id;

      const response = await agent
        .delete(comments_uri + commentId)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      expectFilteredMessages(response, 403, comments_uri + commentId);
    });
  });

  describe('positive: DELETE comments/:id', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should delete comment by id`, async () => {
      await agent.delete(testing_allData_uri);

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

      const comment = await usersTestManager.createCommentForPost(
        createCommentInput,
        postId,
        token,
      );
      const commentId = comment.body.id;

      await agent
        .delete(comments_uri + commentId)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const deletedComment = await usersTestManager.findComment(
        comment.body.id,
      );

      expect(deletedComment).toBeNull();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
