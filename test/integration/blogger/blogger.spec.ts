import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { createUserInput } from '../../base/utils/constants/users.constants';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { expectCreatedBlog } from '../../base/utils/functions/expect/blogs/expectCreatedBlog';
import { testing_allData_uri } from '../../base/utils/constants/routes';
import { lorem30 } from '../../base/utils/constants/lorems';
import { expectFirstBannedPaginatedBlog } from '../../base/utils/functions/expect/blogs/expectFirstBannedPaginatedBlog';
import { createPostInput } from '../../base/utils/constants/posts.constants';
import { expectCreatedBlogForPost } from '../../base/utils/functions/expect/blogs/expectCreatedBlogForPost';
import { createCommentInput } from '../../base/utils/constants/comments.constant';

describe('PairQuizGame: v3', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('Blogger: int', () => {
    it(`POST -> "/posts/:postId/comments": 
        banned user by blogger cant comment posts of current blog; 
        status 403; 
        used additional methods: 
        POST => sa/users, 
        POST => auth/login, 
        POST => blogger/blogs, 
        POST => blogger/blogs/:id/posts;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);
      const testingUser = await usersTestManager.createAndLoginUser(2);

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      const createdPost = await agent
        .post(`/blogger/blogs/${createdBlog.body.id}/posts`)
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createPostInput)
        .expect(201);

      expectCreatedBlogForPost(
        createdPost,
        createPostInput,
        createdBlog.body.id,
        createdBlog.body.name,
        0,
        0,
        'None',
      );

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

      const createdComment = await agent
        .post(`/posts/${createdPost.body.id}/comments`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .send(createCommentInput)
        .expect(403);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
