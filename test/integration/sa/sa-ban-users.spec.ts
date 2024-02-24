import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import {
  createUserInput,
  createUserInput2,
} from '../../base/utils/constants/users.constants';
import { waitForIt } from '../../../src/base/utils/wait';
import { testing_allData_uri } from '../../base/utils/constants/routes';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../../base/utils/constants/auth.constants';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { expectFirstBannedPaginatedUser } from '../../base/utils/functions/expect/users/expectFirstBannedPaginatedUser';
import { expectCreatedUser } from '../../base/utils/functions/expect/users/expectCreatedUser';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { expectCreatedBlog } from '../../base/utils/functions/expect/blogs/expectCreatedBlog';
import { createPostInput } from '../../base/utils/constants/posts.constants';
import { expectCreatedPost } from '../../base/utils/functions/expect/posts/expectCreatedPost';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { expectCreatedComment } from '../../base/utils/functions/expect/comments/expectCreatedComment';
import { createCommentInput } from '../../base/utils/constants/comments.constant';
import { lorem30 } from '../../base/utils/constants/lorems';
import { expectGetPostById } from '../../base/utils/functions/expect/posts/expectGetPostById';

describe('Users: POST sa/users', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('positive: PUT sa/users/{id}/ban', () => {
    it(`should waitForIt`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`PUT -> "/sa/users/:id/ban": should ban user; 
        status 204; 
        used additional methods: 
        POST => /sa/users, 
        GET => /sa/users;`, async () => {
      const createdUser = await agent
        .post(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createUserInput)
        .expect(201);

      expectCreatedUser(createdUser, createUserInput, false, null);

      await agent
        .put(`/sa/users/${createdUser.body.id}/ban`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
          banReason: lorem30,
        })
        .expect(204);

      const result = await agent
        .get(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expectFirstBannedPaginatedUser(
        result,
        1,
        1,
        10,
        1,
        createUserInput,
        true,
        lorem30,
      );
    });

    it(`PUT -> "/sa/users/:id/ban": should unban user; 
        status 204; 
        used additional methods: POST => /sa/users, 
        GET => /sa/users;`, async () => {
      await agent.delete(testing_allData_uri);

      const createdUser = await agent
        .post(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createUserInput2)
        .expect(201);

      expectCreatedUser(createdUser, createUserInput2, false, null);

      await agent
        .put(`/sa/users/${createdUser.body.id}/ban`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
          banReason: lorem30,
        })
        .expect(204);

      const result = await agent
        .get(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);
      console.log(result.body);
      expectFirstBannedPaginatedUser(
        result,
        1,
        1,
        10,
        1,
        createUserInput2,
        true,
        lorem30,
      );

      await agent
        .put(`/sa/users/${createdUser.body.id}/ban`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: false,
          banReason: lorem30,
        })
        .expect(204);

      const result2 = await agent
        .get(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expectFirstBannedPaginatedUser(
        result2,
        1,
        1,
        10,
        1,
        createUserInput2,
        false,
      );
    });

    it(`POST -> "/auth/login": 
        Shouldn't login banned user. 
        Should login unbanned user; 
        status 401; 
        used additional methods: 
        POST => /sa/users, 
        PUT => /sa/users/:id/ban;`, async () => {
      await agent.delete(testing_allData_uri);

      const createdUser = await agent
        .post(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createUserInput)
        .expect(201);

      expectCreatedUser(createdUser, createUserInput, false, null);

      await agent
        .put(`/sa/users/${createdUser.body.id}/ban`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
          banReason: lorem30,
        })
        .expect(204);

      const result = await agent
        .get(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expectFirstBannedPaginatedUser(
        result,
        1,
        1,
        10,
        1,
        createUserInput,
        true,
        lorem30,
      );

      const login = await agent
        .post(`/auth/login`)
        .send({
          loginOrEmail: createUserInput.login,
          password: createUserInput.password,
        })
        .expect(401);

      expectErrorWithPath(login, 401, `/auth/login`);
    });

    it(`GET -> "/comments/:id": 
        Shouldn't return banned user comment. 
        Should return unbanned user comment; 
        status 404; 
        used additional methods: 
        POST => /sa/users, 
        PUT => /sa/users/:id/ban, 
        POST => /auth/login, 
        POST => /blogger/blogs, 
        POST => /blogger/blogs/:blogId/posts, 
        POST => /posts/:postId/comments;`, async () => {
      await agent.delete(testing_allData_uri);

      const createdUser = await agent
        .post(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createUserInput)
        .expect(201);

      expectCreatedUser(createdUser, createUserInput, false, null);

      const login1 = await agent
        .post(`/auth/login`)
        .send({
          loginOrEmail: createUserInput.login,
          password: createUserInput.password,
        })
        .expect(200);

      const userToken1 = login1.body.accessToken;

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${userToken1}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      const createdPost = await agent
        .post(`/blogger/blogs/${createdBlog.body.id}/posts`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send(createPostInput)
        .expect(201);

      expectCreatedPost(
        createdPost,
        createPostInput,
        createdBlog.body.id.toString(),
        createBlogInput.name,
      );

      const createdComment = await agent
        .post(`/posts/${createdPost.body.id}/comments`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send(createCommentInput)
        .expect(201);

      await agent
        .put(`/sa/users/${createdUser.body.id}/ban`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
          banReason: lorem30,
        })
        .expect(204);

      const result = await agent
        .get(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expectFirstBannedPaginatedUser(
        result,
        1,
        1,
        10,
        1,
        createUserInput,
        true,
        lorem30,
      );

      const login = await agent
        .post(`/auth/login`)
        .send({
          loginOrEmail: createUserInput.login,
          password: createUserInput.password,
        })
        .expect(401);

      expectErrorWithPath(login, 401, `/auth/login`);

      const getComments = await agent
        .get(`/comments/${createdComment.body.id}`)
        .expect(404);

      expectErrorsMessages(getComments, 'commentId');

      await agent
        .put(`/sa/users/${createdUser.body.id}/ban`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: false,
          banReason: lorem30,
        })
        .expect(204);

      const unBanResult = await agent
        .get(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expectFirstBannedPaginatedUser(
        unBanResult,
        1,
        1,
        10,
        1,
        createUserInput,
        false,
      );

      const getCommentsUnBannedUser = await agent
        .get(`/comments/${createdComment.body.id}`)
        .expect(200);

      expectCreatedComment(
        getCommentsUnBannedUser,
        createCommentInput,
        createdUser.body.id,
        createdUser.body.login,
      );
    });

    it(`GET -> "/posts/:id": 
        Shouldn't return banned user like for post. 
        Should return unbanned user like for post; 
        status 200; 
        used additional methods: 
        POST => /sa/users, 
        PUT => /sa/users/:id/ban, 
        POST => /auth/login, 
        POST => /blogger/blogs, 
        POST => /blogger/blogs/:blogId/posts;`, async () => {
      await agent.delete(testing_allData_uri);

      const createdUser = await agent
        .post(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createUserInput)
        .expect(201);

      expectCreatedUser(createdUser, createUserInput, false, null);

      const login1 = await agent
        .post(`/auth/login`)
        .send({
          loginOrEmail: createUserInput.login,
          password: createUserInput.password,
        })
        .expect(200);

      const userToken1 = login1.body.accessToken;

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${userToken1}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      const createdPost = await agent
        .post(`/blogger/blogs/${createdBlog.body.id}/posts`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send(createPostInput)
        .expect(201);

      expectCreatedPost(
        createdPost,
        createPostInput,
        createdBlog.body.id.toString(),
        createBlogInput.name,
      );

      await agent
        .put(`/sa/users/${createdUser.body.id}/ban`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
          banReason: lorem30,
        })
        .expect(204);

      const result = await agent
        .get(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expectFirstBannedPaginatedUser(
        result,
        1,
        1,
        10,
        1,
        createUserInput,
        true,
        lorem30,
      );

      // Shouldn't return banned user like for post.
      const getPosts = await agent
        .get(`/posts/${createdPost.body.id}`)
        .expect(404);

      expectErrorsMessages(getPosts, 'postId');

      await agent
        .put(`/sa/users/${createdUser.body.id}/ban`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: false,
          banReason: lorem30,
        })
        .expect(204);

      const result2 = await agent
        .get(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(200);

      expectFirstBannedPaginatedUser(
        result2,
        1,
        1,
        10,
        1,
        createUserInput,
        false,
      );

      // Should return banned user like for post.
      const getPosts2 = await agent
        .get(`/posts/${createdPost.body.id}`)
        .expect(200);

      expectCreatedPost(
        getPosts2,
        createPostInput,
        createdBlog.body.id,
        createdBlog.body.name,
      );
    });

    it(`GET -> "/comments/:id":
        Shouldn't return banned user like for comment.
        Should return unbanned user like for comment;
        status 200;
        used additional methods:
        POST => /sa/users,
        PUT => /sa/users/:id/ban,
        POST => /auth/login,
        POST => /blogger/blogs,
        POST => /blogger/blogs/:blogId/posts,
        POST => /posts/:postId/comments;`, async () => {
      await agent.delete(testing_allData_uri);

      const createdUser = await agent
        .post(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createUserInput)
        .expect(201);

      expectCreatedUser(createdUser, createUserInput, false, null);

      const createdUser2 = await agent
        .post(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createUserInput2)
        .expect(201);

      expectCreatedUser(createdUser2, createUserInput2, false, null);

      const login2 = await agent
        .post(`/auth/login`)
        .send({
          loginOrEmail: createUserInput2.login,
          password: createUserInput2.password,
        })
        .expect(200);

      const userToken2 = login2.body.accessToken;

      const login1 = await agent
        .post(`/auth/login`)
        .send({
          loginOrEmail: createUserInput.login,
          password: createUserInput.password,
        })
        .expect(200);

      const userToken1 = login1.body.accessToken;

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${userToken1}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      const createdPost = await agent
        .post(`/blogger/blogs/${createdBlog.body.id}/posts`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send(createPostInput)
        .expect(201);

      expectCreatedPost(
        createdPost,
        createPostInput,
        createdBlog.body.id.toString(),
        createBlogInput.name,
      );

      const createdComment = await agent
        .post(`/posts/${createdPost.body.id}/comments`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send(createCommentInput)
        .expect(201);

      const createdCommentLike = await agent
        .put(`/comments/${createdComment.body.id}/like-status`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send({
          likeStatus: 'Like',
        })
        .expect(204);

      const createdCommentLike2 = await agent
        .put(`/comments/${createdComment.body.id}/like-status`)
        .set('Authorization', `Bearer ${userToken2}`)
        .send({
          likeStatus: 'Like',
        })
        .expect(204);

      const getComments = await agent
        .get(`/comments/${createdComment.body.id}/`)
        .set('Authorization', `Bearer ${userToken1}`)
        .expect(200);

      expectCreatedComment(
        getComments,
        createCommentInput,
        createdUser.body.id,
        createUserInput.login,
        2,
        0,
        'Like',
      );

      await agent
        .put(`/sa/users/${createdUser2.body.id}/ban`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
          banReason: lorem30,
        })
        .expect(204);

      const result = await agent
        .get(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ sortDirection: 'desc' })
        .expect(200);

      expectFirstBannedPaginatedUser(
        result,
        1,
        1,
        10,
        2,
        createUserInput2,
        true,
        lorem30,
      );

      const getComments2 = await agent
        .get(`/comments/${createdComment.body.id}/`)
        .set('Authorization', `Bearer ${userToken1}`)
        .expect(200);

      expectCreatedComment(
        getComments2,
        createCommentInput,
        createdUser.body.id,
        createUserInput.login,
        1,
        0,
        'Like',
      );
    });

    it(`GET -> "/posts/:id": Shouldn't return banned user like for post. 
        Should return unbanned user like for post; 
        status 200; 
        used additional methods: 
        POST => /sa/users, 
        PUT => /sa/users/:id/ban, 
        POST => /auth/login, 
        POST => /blogger/blogs, 
        POST => /blogger/blogs/:blogId/posts;`, async () => {
      await agent.delete(testing_allData_uri);

      const createdUser = await agent
        .post(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createUserInput)
        .expect(201);

      expectCreatedUser(createdUser, createUserInput, false, null);

      const createdUser2 = await agent
        .post(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createUserInput2)
        .expect(201);

      expectCreatedUser(createdUser2, createUserInput2, false, null);

      const login2 = await agent
        .post(`/auth/login`)
        .send({
          loginOrEmail: createUserInput2.login,
          password: createUserInput2.password,
        })
        .expect(200);

      const userToken2 = login2.body.accessToken;

      const login1 = await agent
        .post(`/auth/login`)
        .send({
          loginOrEmail: createUserInput.login,
          password: createUserInput.password,
        })
        .expect(200);

      const userToken1 = login1.body.accessToken;

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${userToken1}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      const createdPost = await agent
        .post(`/blogger/blogs/${createdBlog.body.id}/posts`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send(createPostInput)
        .expect(201);
      console.log(createdPost.body);

      expectCreatedPost(
        createdPost,
        createPostInput,
        createdBlog.body.id.toString(),
        createBlogInput.name,
      );

      const createdPostLike = await agent
        .put(`/posts/${createdPost.body.id}/like-status`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send({
          likeStatus: 'Like',
        })
        .expect(204);

      const createdPostLike2 = await agent
        .put(`/posts/${createdPost.body.id}/like-status`)
        .set('Authorization', `Bearer ${userToken2}`)
        .send({
          likeStatus: 'Like',
        })
        .expect(204);

      const getPosts = await agent
        .get(`/posts/${createdPost.body.id}/`)
        .set('Authorization', `Bearer ${userToken1}`)
        .expect(200);

      expectGetPostById(getPosts, 2, 0, 'Like');

      await agent
        .put(`/sa/users/${createdUser2.body.id}/ban`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: true,
          banReason: lorem30,
        })
        .expect(204);

      const result = await agent
        .get(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ sortDirection: 'desc' })
        .expect(200);

      expectFirstBannedPaginatedUser(
        result,
        1,
        1,
        10,
        2,
        createUserInput2,
        true,
        lorem30,
      );

      const getPosts2 = await agent
        .get(`/posts/${createdPost.body.id}/`)
        .set('Authorization', `Bearer ${userToken1}`)
        .expect(200);

      expectGetPostById(getPosts2, 1, 0, 'Like');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
