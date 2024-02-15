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
import { createUserInput3 } from '../../base/utils/constants/users.constants';
import { createCommentInput } from '../../base/utils/constants/comments.constant';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import { randomAccessToken } from '../../base/utils/constants/auth.constants';
import { waitForIt } from '../../../src/base/utils/wait';
import {
  likeStatusInput_like,
  likeStatusInput_like_lowerCase,
} from '../../base/utils/constants/likes.constant';

describe('Comments: PUT comments/:id/like-status', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: PUT comments/:id/like-status', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not update comment like-status if token is missing`, async () => {
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
        .put(`${comments_uri}${commentId}/like-status`)
        // .set('Authorization', `Bearer ${token}`)
        .send(likeStatusInput_like)
        .expect(401);

      expectErrorWithPath(
        response,
        401,
        `${comments_uri}${commentId}/like-status`,
      );
    });

    it(`should not update comment like-status if token is incorrect`, async () => {
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
        .put(`${comments_uri}${commentId}/like-status`)
        .set('Authorization', `Bearer ${randomAccessToken}`) // randomAccessToke
        .send(likeStatusInput_like)
        .expect(401);

      expectErrorWithPath(
        response,
        401,
        `${comments_uri}${commentId}/like-status`,
      );
    });

    it(`should not update comment like-status if If the inputModel has incorrect values`, async () => {
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
        .put(`${comments_uri}${commentId}/like-status`)
        .set('Authorization', `Bearer ${token}`)
        .send('definitely like')
        .expect(400);

      expectErrorsMessages(response, 'likeStatus');
    });

    it(`should not update comment like-status if If the inputModel has incorrect values`, async () => {
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
        .put(`${comments_uri}${commentId}/like-status`)
        .set('Authorization', `Bearer ${token}`)
        .send(likeStatusInput_like_lowerCase) // should be Like
        .expect(400);

      expectErrorsMessages(response, 'likeStatus');
    });

    it(`should not update comment like-status if If the inputModel has incorrect values`, async () => {
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
        .put(`${comments_uri}${commentId + 1}/like-status`) // commentId + 1
        .set('Authorization', `Bearer ${token}`)
        .send(likeStatusInput_like)
        .expect(404);

      expectErrorsMessages(response, 'commentId');
    });
  });

  describe('positive: PUT comments/:id/like-status', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should update comment like-status`, async () => {
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

      await agent
        .put(`${comments_uri}${commentId}/like-status`)
        .set('Authorization', `Bearer ${token}`)
        .send(likeStatusInput_like)
        .expect(204);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
