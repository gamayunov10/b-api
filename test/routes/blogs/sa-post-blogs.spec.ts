import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { initializeApp } from '../../base/settings/initializeApp';
import { waitForIt } from '../../base/utils/functions/wait';
import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query.repository';
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
  blogName01,
} from '../../base/utils/constants/blogs.constant';
import { expectFilteredMessages } from '../../base/utils/functions/expectFilteredMessages';
import { lorem1000, lorem15, lorem20 } from '../../base/utils/constants/lorems';
import { expectErrorsMessages } from '../../base/utils/functions/expectErrorsMessages';
import { expectCreatedBlog } from '../../base/utils/functions/devices/expectCreatedBlog';

describe('Blogs: POST sa/blogs', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    await waitForIt(11);
    const result = await initializeApp();
    app = result.app;
    agent = result.agent;
    const usersQueryRepository = app.get(UsersQueryRepository);
    usersTestManager = new UsersTestManager(app, usersQueryRepository);
  }, 15000);

  describe('negative: POST sa/blogs', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Create new blog if login is incorrect`, async () => {
      const response = await agent
        .post(sa_blogs_uri)
        .auth('incorrect', basicAuthPassword)
        .send({
          name: blogName01,
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(401);

      expectFilteredMessages(response, 401, sa_blogs_uri);
    });

    it(`should not Create new blog if login is incorrect`, async () => {
      const response = await agent
        .post(sa_blogs_uri)
        .auth(basicAuthLogin, '123')
        .send({
          name: blogName01,
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(401);

      expectFilteredMessages(response, 401, sa_blogs_uri);
    });

    it(`should not Create new blog If the inputModel has incorrect values`, async () => {
      const response = await agent
        .post(sa_blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: lorem20, // maxLength: 15
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(400);

      expectErrorsMessages(response, 'name');
    });

    it(`should not Create new blog If the inputModel has incorrect values`, async () => {
      const response = await agent
        .post(sa_blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: lorem15,
          description: lorem1000, // maxLength: 500
          websiteUrl: someSiteURl,
        })
        .expect(400);

      expectErrorsMessages(response, 'description');
    });

    it(`should not Create new blog If the inputModel has incorrect values`, async () => {
      const response = await agent
        .post(sa_blogs_uri)
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

  describe('positive: POST sa/blogs', () => {
    it(`should clear db`, async () => {
      await waitForIt(11);
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Create new blog`, async () => {
      const response = await agent
        .post(sa_blogs_uri)
        .auth(basicAuthLogin, basicAuthPassword)
        .send({
          name: blogName01,
          description: blogDescription,
          websiteUrl: someSiteURl,
        })
        .expect(201);

      expectCreatedBlog(response, blogName01, blogDescription, someSiteURl);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
