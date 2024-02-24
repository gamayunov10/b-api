import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { expectCreatedBlog } from '../../base/utils/functions/expect/blogs/expectCreatedBlog';
import { testing_allData_uri } from '../../base/utils/constants/routes';
import { lorem30 } from '../../base/utils/constants/lorems';
import { expectFirstBannedPaginatedBlog } from '../../base/utils/functions/expect/blogs/expectFirstBannedPaginatedBlog';

describe('User ban by blogger', () => {
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
    it(`PUT -> "/blogger/users/:id/ban": 
        should ban user by blogger for specified blog. 
        The banned user must be added to the list of banned users; 
        status 204; 
        used additional methods: 
        POST => /sa/users, 
        POST => blogger/blogs, 
        GET => blogger/users/blog/:id;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);
      const testingUser = await usersTestManager.createAndLoginUser(2);

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      await agent
        .put(`/blogger/users/${testingUser.id}/ban`)
        .set('Authorization', `Bearer ${blogger.token}`)
        .send({
          isBanned: true,
          banReason: lorem30,
          blogId: createdBlog.body.id,
        })
        .expect(204);

      const result = await agent
        .get(`/blogger/users/blog/${createdBlog.body.id}`)
        .set('Authorization', `Bearer ${blogger.token}`)
        .query({ sortDirection: 'desc' })
        .expect(200);

      expectFirstBannedPaginatedBlog(
        result,
        1,
        1,
        10,
        1,
        createBlogInput,
        true,
        lorem30,
      );

      await agent
        .put(`/blogger/users/${testingUser.id}/ban`)
        .set('Authorization', `Bearer ${blogger.token}`)
        .send({
          isBanned: false,
          banReason: lorem30,
          blogId: createdBlog.body.id,
        })
        .expect(204);

      const result2 = await agent
        .get(`/blogger/users/blog/${createdBlog.body.id}`)
        .set('Authorization', `Bearer ${blogger.token}`)
        .query({ sortDirection: 'desc' })
        .expect(200);

      expectFirstBannedPaginatedBlog(
        result2,
        0,
        1,
        10,
        0,
        createBlogInput,
        false,
        null,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
