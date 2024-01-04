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
import {
  createPostInput,
  updatedPostInput,
} from '../../base/utils/constants/posts.constants';
import { expectFilteredMessages } from '../../base/utils/functions/expect/expectFilteredMessages';
import {
  lorem100,
  lorem1000,
  lorem1001,
  lorem30,
  lorem50,
} from '../../base/utils/constants/lorems';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { expectUpdatedPost } from '../../base/utils/functions/expect/posts/expectUpdatedPost';

describe('Blogs: PUT sa/blogs/:blogId/posts/:postId', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: PUT sa/blogs/:blogId/posts/:postId', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Update existing post by id with InputModel if login is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .put(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth('incorrect', basicAuthPassword)
        .send(updatedPostInput)
        .expect(401);

      expectFilteredMessages(
        response,
        401,
        `/sa/blogs/${blogId}/posts/${postId}`,
      );
    });

    it(`should not Update existing post by id with InputModel if password is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .put(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth(basicAuthLogin, '123')
        .send(updatedPostInput)
        .expect(401);

      expectFilteredMessages(
        response,
        401,
        `/sa/blogs/${blogId}/posts/${postId}`,
      );
    });

    it(`should not Update existing post by id with InputModel If the inputModel has incorrect values`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .put(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: lorem50, // maxLength: 30
          shortDescription: lorem50,
          content: lorem1000,
        })
        .expect(400);

      expectErrorsMessages(response, 'title');
    });

    it(`should not Update existing post by id with InputModel If the inputModel has incorrect values`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .put(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: lorem30,
          shortDescription: lorem100 + 1, // maxLength: 100
          content: lorem1000,
        })
        .expect(400);

      expectErrorsMessages(response, 'shortDescription');
    });

    it(`should not Update existing post by id with InputModel If the inputModel has incorrect values`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .put(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: lorem30,
          shortDescription: lorem100,
          content: lorem1001, // maxLength: 1000
        })
        .expect(400);

      expectErrorsMessages(response, 'content');
    });

    it(`should not Update existing post by id with InputModel If the inputModel has incorrect values,
    postId does not exist`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const postId = 1;

      const response = await agent
        .put(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: lorem30,
          shortDescription: lorem100,
          content: lorem1000,
        })
        .expect(404);

      expectErrorsMessages(response, 'postId');
    });

    it(`should not Update existing post by id with InputModel If the inputModel has incorrect values,
    blogId does not exist`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      const response = await agent
        .put(`/sa/blogs/${blogId + 1}/posts/${postId}`) // blogId + 1
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: lorem30,
          shortDescription: lorem100,
          content: lorem1000,
        })
        .expect(404);

      expectErrorsMessages(response, 'blogId');
    });
  });

  describe('positive: PUT sa/blogs/:blogId/posts/:postId', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Update existing post by id with InputModel`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const post = await usersTestManager.createPostForBlog(
        createPostInput,
        blogId,
      );
      const postId = post.body.id;

      await agent
        .put(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(updatedPostInput)
        .expect(204);

      const updatedPost = await usersTestManager.findPostByPostId(postId);

      expectUpdatedPost(
        updatedPost,
        updatedPostInput,
        blogId,
        createBlogInput.name,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
