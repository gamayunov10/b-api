import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { expectCreatedBlog } from '../../base/utils/functions/expect/blogs/expectCreatedBlog';
import { testing_allData_uri } from '../../base/utils/constants/routes';
import { lorem30 } from '../../base/utils/constants/lorems';
import { expectCreatedPostForBlog } from '../../base/utils/functions/expect/blogs/expectCreatedPostForBlog';
import { createPostInput } from '../../base/utils/constants/posts.constants';
import { expectFirstPaginatedPost } from '../../base/utils/functions/expect/posts/expectFirstPaginatedPost';
import { expectCreatedPost } from '../../base/utils/functions/expect/posts/expectCreatedPost';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../../base/utils/constants/auth.constants';
import { expectFirstBannedPaginatedUser } from '../../base/utils/functions/expect/users/expectFirstBannedPaginatedUser';
import { createUserInput2 } from '../../base/utils/constants/users.constants';
import { createCommentInput } from '../../base/utils/constants/comments.constant';
import { expectFirstPaginatedComment } from '../../base/utils/functions/expect/comments/expectFirstPaginatedComment';

describe('Public ban', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('v_1', () => {
    it(`GET -> "/blogs/:blogId/posts": 
        should return status 200; 
        content: posts for specific blog with pagination; 
        used additional methods: 
        POST -> /blogger/blogs, 
        POST => /blogger/blogs/:blogId/posts;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      const createdPost = await agent
        .post(`/blogger/blogs/${createdBlog.body.id}/posts`)
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createPostInput)
        .expect(201);

      expectCreatedPostForBlog(
        createdPost,
        createPostInput,
        createdBlog.body.id,
        createdBlog.body.name,
        0,
        0,
        'None',
      );

      const getPosts = await agent
        .get(`/blogs/${createdBlog.body.id}/posts`)
        .expect(200);

      expectFirstPaginatedPost(
        getPosts,
        1,
        1,
        10,
        1,
        createPostInput,
        createdBlog.body.id,
        createdBlog.body.name,
      );
    });

    it(`GET -> "/posts/:id": should return status 200; 
        content: post by id; 
        used additional methods: 
        POST -> /blogger/blogs, 
        POST => /blogger/blogs/:blogId/posts;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      const createdPost = await agent
        .post(`/blogger/blogs/${createdBlog.body.id}/posts`)
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createPostInput)
        .expect(201);

      expectCreatedPostForBlog(
        createdPost,
        createPostInput,
        createdBlog.body.id,
        createdBlog.body.name,
        0,
        0,
        'None',
      );

      const getPosts = await agent
        .get(`/posts/${createdPost.body.id}`)
        .expect(200);

      expectCreatedPost(
        getPosts,
        createPostInput,
        createdBlog.body.id,
        createdBlog.body.name,
      );
    });

    it(`GET -> "/comments/:id": 
        Shouldn't return banned user comment. 
        Should return unbanned user comment; 
        status 404; used additional methods: 
        POST => /sa/users, 
        PUT => /sa/users/:id/ban, 
        POST => /auth/login, 
        POST => /blogger/blogs, 
        POST => /blogger/blogs/:blogId/posts, 
        POST => /posts/:postId/comments;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);
      const testingUser = await usersTestManager.createAndLoginUser(2);

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      const createdPost = await agent
        .post(`/blogger/blogs/${createdBlog.body.id}/posts`)
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createPostInput)
        .expect(201);

      expectCreatedPostForBlog(
        createdPost,
        createPostInput,
        createdBlog.body.id,
        createdBlog.body.name,
        0,
        0,
        'None',
      );

      const createdComment = await agent
        .post(`/posts/${createdPost.body.id}/comments`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .send(createCommentInput)
        .expect(201);

      await agent
        .put(`/sa/users/${testingUser.id}/ban`)
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

      const getComment = await agent
        .get(`/posts/${createdPost.body.id}/comments`)
        .expect(200);

      expectFirstPaginatedComment(getComment, 0, 1, 10, 0, false);

      await agent
        .put(`/sa/users/${testingUser.id}/ban`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          isBanned: false,
          banReason: lorem30,
        })
        .expect(204);

      const result2 = await agent
        .get(`/sa/users/`)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ sortDirection: 'desc' })
        .expect(200);

      expectFirstBannedPaginatedUser(
        result2,
        1,
        1,
        10,
        2,
        createUserInput2,
        false,
        null,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
