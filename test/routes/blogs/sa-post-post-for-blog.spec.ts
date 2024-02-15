import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { waitForIt } from '../../../src/base/utils/wait';
import { testing_allData_uri } from '../../base/utils/constants/routes';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import {
  basicAuthLogin,
  basicAuthPassword,
  someSiteURl,
} from '../../base/utils/constants/auth.constants';
import {
  blogDescription,
  blogName,
  createBlogInput,
} from '../../base/utils/constants/blogs.constant';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import {
  lorem100,
  lorem1000,
  lorem1001,
  lorem30,
  lorem50,
} from '../../base/utils/constants/lorems';
import { expectErrorsMessages } from '../../base/utils/functions/expect/expectErrorsMessages';
import { createPostInput } from '../../base/utils/constants/posts.constants';
import { expectCreatedPost } from '../../base/utils/functions/expect/posts/expectCreatedPost';

describe('Blogs: POST sa/blogs/:id/posts', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: POST sa/blogs/:id/posts', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Create new post for specific blog if login is incorrect`, async () => {
      const res = await usersTestManager.createBlog(createBlogInput);
      const id = res.body.id;

      const response = await agent
        .post(`/sa/blogs/${id}/posts`)
        .auth('incorrect', basicAuthPassword)
        .send(createPostInput)
        .expect(401);

      expectErrorWithPath(response, 401, `/sa/blogs/${id}/posts`);
    });

    it(`should not Create new post for specific blog if password is incorrect`, async () => {
      const res = await usersTestManager.createBlog(createBlogInput);
      const id = res.body.id;

      const response = await agent
        .post(`/sa/blogs/${id}/posts`)
        .auth(basicAuthLogin, '123')
        .send({
          name: blogName,
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(401);

      expectErrorWithPath(response, 401, `/sa/blogs/${id}/posts`);
    });

    it(`should not Create new post for specific blog If the inputModel has incorrect values`, async () => {
      const res = await usersTestManager.createBlog(createBlogInput);
      const id = res.body.id;

      const response = await agent
        .post(`/sa/blogs/${id}/posts`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: lorem50, // maxLength: 30
          shortDescription: lorem50,
          content: lorem1000,
        })
        .expect(400);

      expectErrorsMessages(response, 'title');
    });

    it(`should not Create new post for specific blog If the inputModel has incorrect values`, async () => {
      const res = await usersTestManager.createBlog(createBlogInput);
      const id = res.body.id;

      const response = await agent
        .post(`/sa/blogs/${id}/posts`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: lorem30,
          shortDescription: lorem100 + 1, // maxLength: 100
          content: lorem1000,
        })
        .expect(400);

      expectErrorsMessages(response, 'shortDescription');
    });

    it(`should not Create new post for specific blog If the inputModel has incorrect values`, async () => {
      const res = await usersTestManager.createBlog(createBlogInput);
      const id = res.body.id;

      const response = await agent
        .post(`/sa/blogs/${id}/posts`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          title: lorem30,
          shortDescription: lorem100,
          content: lorem1001, // maxLength: 1000
        })
        .expect(400);

      expectErrorsMessages(response, 'content');
    });

    it(`should not Create new post for specific blog If the inputModel has incorrect values`, async () => {
      const id = 1;

      const response = await agent
        .post(`/sa/blogs/${id}/posts`)
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

  describe('positive: POST sa/blogs/:id/posts', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Create new post for specific blog`, async () => {
      const res = await usersTestManager.createBlog(createBlogInput);
      const id = res.body.id;

      const response = await agent
        .post(`/sa/blogs/${id}/posts`)
        .auth(basicAuthLogin, basicAuthPassword)
        .send(createPostInput)
        .expect(201);

      expectCreatedPost(response, createPostInput, id, createBlogInput.name);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
