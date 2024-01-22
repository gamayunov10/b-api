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
import { expectFilteredMessages } from '../../base/utils/functions/expect/expectFilteredMessages';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';

describe('Blogs: DELETE sa/blogs/:id', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: DELETE sa/blogs/:id', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Delete blog specified by id if login is incorrect`, async () => {
      const res = await usersTestManager.createBlog(createBlogInput);
      const id = res.body.id;

      const response = await agent
        .delete(sa_blogs_uri + id)
        .auth('', basicAuthPassword)
        .expect(401);

      expectFilteredMessages(response, 401, sa_blogs_uri + id);
    });

    it(`should not Delete blog specified by id if login is incorrect`, async () => {
      const res = await usersTestManager.createBlog(createBlogInput);
      const id = res.body.id;

      const response = await agent
        .delete(sa_blogs_uri + id)
        .auth('incorrect', basicAuthPassword)
        .expect(401);

      expectFilteredMessages(response, 401, sa_blogs_uri + id);
    });

    it(`should not Delete blog specified by id if password is incorrect`, async () => {
      const res = await usersTestManager.createBlog(createBlogInput);
      const id = res.body.id;

      const response = await agent
        .delete(sa_blogs_uri + id)
        .auth(basicAuthLogin, '')
        .expect(401);

      expectFilteredMessages(response, 401, sa_blogs_uri + id);
    });

    it(`should not Delete blog specified by id if password is incorrect`, async () => {
      const res = await usersTestManager.createBlog(createBlogInput);
      const id = res.body.id;

      const response = await agent
        .delete(sa_blogs_uri + id)
        .auth(basicAuthLogin, '123')
        .expect(401);

      expectFilteredMessages(response, 401, sa_blogs_uri + id);
    });

    it(`should not Delete blog specified by id If specified user is not exists`, async () => {
      const id = '123';

      const response = await agent
        .delete(sa_blogs_uri + id)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(404);

      expectErrorsMessages(response, 'blogId');
    });
  });

  describe('positive: DELETE sa/blogs/:id', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Delete blog specified by id`, async () => {
      const res = await usersTestManager.createBlog(createBlogInput);
      const id = res.body.id;

      await agent
        .delete(sa_blogs_uri + id)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(204);

      await agent
        .delete(sa_blogs_uri + id)
        .auth(basicAuthLogin, basicAuthPassword)
        .expect(404);

      const deletedBlog = await usersTestManager.findBlogById(id);

      expect(deletedBlog).toBeNull();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
