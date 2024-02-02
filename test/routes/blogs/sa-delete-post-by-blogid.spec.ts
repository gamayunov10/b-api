import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { waitForIt } from '../../base/utils/functions/wait';
import { testing_allData_uri } from '../../base/utils/constants/routes';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../../base/utils/constants/auth.constants';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { createPostInput } from '../../base/utils/constants/posts.constants';

describe('Blogs: DELETE sa/blogs/:blogId/posts/:postId', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: DELETE sa/blogs/:blogId/posts/:postId', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Delete post specified by id if login is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .delete(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth('', basicAuthPassword)
        .expect(401);

      expectErrorWithPath(response, 401, `/sa/blogs/${blogId}/posts/${postId}`);
    });

    it(`should not Delete post specified by id if login is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .delete(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth('incorrect', basicAuthPassword)
        .expect(401);

      expectErrorWithPath(response, 401, `/sa/blogs/${blogId}/posts/${postId}`);
    });

    it(`should not Delete post specified by id if password is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .delete(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth(basicAuthLogin, '')
        .expect(401);

      expectErrorWithPath(response, 401, `/sa/blogs/${blogId}/posts/${postId}`);
    });

    it(`should not Delete post specified by id if password is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .delete(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth(basicAuthLogin, '123')
        .expect(401);

      expectErrorWithPath(response, 401, `/sa/blogs/${blogId}/posts/${postId}`);
    });

    it(`should not Delete post specified by id If specified blog is not exists`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .delete(`/sa/blogs/${blogId + 1}/posts/${postId}`) // blogId + 1
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(404);

      expectErrorsMessages(response, 'blogId');
    });

    it(`should not Delete post specified by id If specified post is not exists`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .delete(`/sa/blogs/${blogId}/posts/${postId + 1}`) // postId + 1
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(404);

      expectErrorsMessages(response, 'postId');
    });
  });

  describe('positive: DELETE sa/blogs/:blogId/posts/:postId', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Delete post specified by id`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      await agent
        .delete(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(204);

      const deletedPost = await usersTestManager.findPostByPostId(postId);

      expect(deletedPost).toBeNull();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
