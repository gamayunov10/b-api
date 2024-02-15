import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { waitForIt } from '../../../src/base/utils/wait';
import {
  blogs_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../../base/utils/constants/auth.constants';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { expectCreatedBlog } from '../../base/utils/functions/expect/blogs/expectCreatedBlog';

describe('Blogs: GET blogs/:id', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: GET blogs/:id', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Return blog by id if blog does not exist`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const response = await agent
        .get(`/blogs/${blogId + 1}/posts`) // blogId + 1
        .expect(404);

      expectErrorsMessages(response, 'blogId');
    });
  });

  describe('positive: GET blogs/:id', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Return created blog`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const response = await agent
        .get(blogs_uri + blogId)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 3, sortDirection: 'asc' })
        .expect(200);

      expectCreatedBlog(response, createBlogInput);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
