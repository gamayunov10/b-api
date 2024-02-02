import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { waitForIt } from '../../base/utils/functions/wait';
import {
  sa_blogs_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../../base/utils/constants/auth.constants';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import {
  createBlogInput,
  createBlogInput2,
  createBlogInput3,
  createBlogInput4,
  createBlogInput5,
  createBlogInput6,
  createBlogInput7,
} from '../../base/utils/constants/blogs.constant';
import { expectFirstPaginatedBlog } from '../../base/utils/functions/expect/blogs/expectFirstPaginatedBlog';
import { expectPaginatedBlogs } from '../../base/utils/functions/expect/blogs/expectPaginatedBlogs';

describe('Blogs: GET sa/blogs', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: GET sa/blogs', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Return all blogs with paging if login is incorrect`, async () => {
      const response = await agent
        .get(sa_blogs_uri)
        .auth('incorrect', basicAuthPassword)
        .expect(401);

      expectErrorWithPath(response, 401, sa_blogs_uri);
    });

    it(`should not Return all blogs with paging if login is incorrect`, async () => {
      const response = await agent
        .post(sa_blogs_uri)
        .auth('', basicAuthPassword)
        .expect(401);

      expectErrorWithPath(response, 401, sa_blogs_uri);
    });

    it(`should not Return all blogs with paging if password is incorrect`, async () => {
      const response = await agent
        .post(sa_blogs_uri)
        .auth(basicAuthLogin, 'incorrect')
        .query({ pageSize: 3, sortDirection: 'asc' })
        .expect(401);

      expectErrorWithPath(
        response,
        401,
        '/sa/blogs/?pageSize=3&sortDirection=asc',
      );
    });

    it(`should not Return all blogs with paging if password is incorrect`, async () => {
      const response = await agent
        .post(sa_blogs_uri)
        .auth(basicAuthLogin, '')
        .expect(401);

      expectErrorWithPath(response, 401, sa_blogs_uri);
    });
  });

  describe('positive: GET sa/blogs', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Return created blog`, async () => {
      await usersTestManager.createBlog(createBlogInput);

      const response = await agent
        .get(sa_blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 3, sortDirection: 'asc' })
        .expect(200);

      expectFirstPaginatedBlog(response, 1, 1, 3, 1, createBlogInput);
    });

    it(`should Return created blog by searchNameTerm`, async () => {
      await agent.delete(testing_allData_uri);

      await usersTestManager.createBlog(createBlogInput7);

      const response = await agent
        .get(sa_blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 3, searchNameTerm: '7' })
        .expect(200);

      expectFirstPaginatedBlog(response, 1, 1, 3, 1, createBlogInput7);
    });

    it(`should Returns all blogs with paging`, async () => {
      await agent.delete(testing_allData_uri);

      await usersTestManager.createBlog(createBlogInput);
      await usersTestManager.createBlog(createBlogInput2);
      await usersTestManager.createBlog(createBlogInput3);
      await usersTestManager.createBlog(createBlogInput4);
      await usersTestManager.createBlog(createBlogInput5);
      await usersTestManager.createBlog(createBlogInput6);
      await usersTestManager.createBlog(createBlogInput7);

      const response = await agent
        .get(sa_blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 10, sortDirection: 'asc' })
        .expect(200);

      expectPaginatedBlogs(
        response,
        1,
        1,
        10,
        7,
        createBlogInput,
        createBlogInput2,
        createBlogInput3,
        createBlogInput4,
        createBlogInput5,
        createBlogInput6,
        createBlogInput7,
      );
    });

    it(`should Returns all blogs with paging`, async () => {
      await agent.delete(testing_allData_uri);

      await usersTestManager.createBlog(createBlogInput);
      await usersTestManager.createBlog(createBlogInput2);
      await usersTestManager.createBlog(createBlogInput3);
      await usersTestManager.createBlog(createBlogInput4);
      await usersTestManager.createBlog(createBlogInput5);
      await usersTestManager.createBlog(createBlogInput6);
      await usersTestManager.createBlog(createBlogInput7);

      const response = await agent
        .get(sa_blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 7, sortDirection: 'desc' })
        .expect(200);

      expectPaginatedBlogs(
        response,
        1,
        1,
        7,
        7,
        createBlogInput7,
        createBlogInput6,
        createBlogInput5,
        createBlogInput4,
        createBlogInput3,
        createBlogInput2,
        createBlogInput,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
