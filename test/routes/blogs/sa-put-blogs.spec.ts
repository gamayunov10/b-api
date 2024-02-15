import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { waitForIt } from '../../../src/base/utils/wait';
import {
  sa_blogs_uri,
  testing_allData_uri,
} from '../../base/utils/constants/routes';
import {
  basicAuthLogin,
  basicAuthPassword,
  someSiteURl,
} from '../../base/utils/constants/auth.constants';
import {
  blogDescription,
  createBlogInput,
  createBlogInput2,
} from '../../base/utils/constants/blogs.constant';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import { lorem1000, lorem15, lorem20 } from '../../base/utils/constants/lorems';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { expectUpdatedBlog } from '../../base/utils/functions/expect/blogs/expectUpdatedBlog';

describe('Blogs: PUT sa/blogs/:id', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: PUT sa/blogs/:id', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Update existing Blog by id with InputModel if login is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const id = blog.body.id;

      const response = await agent
        .put(sa_blogs_uri + id)
        .auth('test', basicAuthPassword)
        .send(createBlogInput)
        .expect(401);

      expectErrorWithPath(response, 401, sa_blogs_uri + id);
    });

    it(`should not Update existing Blog by id with InputModel if password is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const id = blog.body.id;

      const response = await agent
        .put(sa_blogs_uri + id)
        .auth(basicAuthLogin, 'basicAuthPassword')
        .send(createBlogInput)
        .expect(401);

      expectErrorWithPath(response, 401, sa_blogs_uri + id);
    });

    it(`should not Update existing Blog by id with InputModel If the inputModel has incorrect values`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const id = blog.body.id;

      const response = await agent
        .put(sa_blogs_uri + id)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: lorem20, // maxLength: 15
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(400);

      expectErrorsMessages(response, 'name');
    });

    it(`should not Update existing Blog by id with InputModel If the inputModel has incorrect values`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const id = blog.body.id;

      const response = await agent
        .put(sa_blogs_uri + id)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: lorem15,
          description: lorem1000, // maxLength: 500
          websiteUrl: someSiteURl,
        })
        .expect(400);

      expectErrorsMessages(response, 'description');
    });

    it(`should not Update existing Blog by id with InputModel If the inputModel has incorrect values`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const id = blog.body.id;

      const response = await agent
        .put(sa_blogs_uri + id)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: lorem15,
          description: blogDescription,
          websiteUrl: 'someSiteURl', // pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
        })
        .expect(400);

      expectErrorsMessages(response, 'websiteUrl');
    });
  });

  describe('positive: PUT sa/blogs/:id', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Update existing Blog by id with InputModel`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const id = blog.body.id;

      await agent
        .put(sa_blogs_uri + id)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createBlogInput2)
        .expect(204);

      const updatedBlog = await usersTestManager.findBlogById(id);

      expectUpdatedBlog(updatedBlog, createBlogInput2);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
