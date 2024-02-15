import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { waitForIt } from '../../../src/base/utils/wait';
import {
  posts_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import {
  createPostInput,
  createPostInput2,
  createPostInput3,
  createPostInput4,
  createPostInput5,
  createPostInput6,
  createPostInput7,
} from '../../base/utils/constants/posts.constants';
import { expectFirstPaginatedPost } from '../../base/utils/functions/expect/posts/expectFirstPaginatedPost';
import { expectPaginatedPosts } from '../../base/utils/functions/expect/posts/expectPaginatedPosts';

describe('Posts: GET posts', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  // describe('negative: GET blogs', () => {
  //   it(`should clear db`, async () => {
  //     await agent.delete(testing_allData_uri);
  //   });
  // });

  describe('positive: GET posts', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Return created post`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      await usersTestManager.createPostForBlog(createPostInput, blogId);

      const response = await agent
        .get(posts_uri)
        .query({ pageSize: 3, sortDirection: 'asc' })
        .expect(200);

      expectFirstPaginatedPost(
        response,
        1,
        1,
        3,
        1,
        createPostInput,
        blogId,
        createBlogInput.name,
      );
    });

    it(`should Return created post`, async () => {
      await agent.delete(testing_allData_uri);

      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      await usersTestManager.createPostForBlog(createPostInput2, blogId);

      const response = await agent
        .get(posts_uri)
        .query({ pageSize: 5 })
        .expect(200);

      expectFirstPaginatedPost(
        response,
        1,
        1,
        5,
        1,
        createPostInput2,
        blogId,
        createBlogInput.name,
      );
    });

    it(`should Returns all posts with paging`, async () => {
      await agent.delete(testing_allData_uri);

      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      await usersTestManager.createPostForBlog(createPostInput, blogId);
      await usersTestManager.createPostForBlog(createPostInput2, blogId);
      await usersTestManager.createPostForBlog(createPostInput3, blogId);
      await usersTestManager.createPostForBlog(createPostInput4, blogId);
      await usersTestManager.createPostForBlog(createPostInput5, blogId);
      await usersTestManager.createPostForBlog(createPostInput6, blogId);
      await usersTestManager.createPostForBlog(createPostInput7, blogId);

      const response = await agent
        .get(posts_uri)
        .query({ pageSize: 10, sortDirection: 'asc' })
        .expect(200);

      expectPaginatedPosts(
        response,
        1,
        1,
        10,
        7,
        createPostInput,
        createPostInput2,
        createPostInput3,
        createPostInput4,
        createPostInput5,
        createPostInput6,
        createPostInput7,
        blogId,
        createBlogInput.name,
      );
    });

    it(`should Returns all posts with paging`, async () => {
      await agent.delete(testing_allData_uri);

      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      await usersTestManager.createPostForBlog(createPostInput, blogId);
      await usersTestManager.createPostForBlog(createPostInput2, blogId);
      await usersTestManager.createPostForBlog(createPostInput3, blogId);
      await usersTestManager.createPostForBlog(createPostInput4, blogId);
      await usersTestManager.createPostForBlog(createPostInput5, blogId);
      await usersTestManager.createPostForBlog(createPostInput6, blogId);
      await usersTestManager.createPostForBlog(createPostInput7, blogId);

      const response = await agent
        .get(posts_uri)
        .query({ pageSize: 8, sortDirection: 'desc' })
        .expect(200);

      expectPaginatedPosts(
        response,
        1,
        1,
        8,
        7,
        createPostInput7,
        createPostInput6,
        createPostInput5,
        createPostInput4,
        createPostInput3,
        createPostInput2,
        createPostInput,
        blogId,
        createBlogInput.name,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
