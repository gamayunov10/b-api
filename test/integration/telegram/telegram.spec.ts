import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { expectCreatedBlog } from '../../base/utils/functions/expect/blogs/expectCreatedBlog';
import { testing_allData_uri } from '../../base/utils/constants/routes';
import { expectFoundBlog } from '../../base/utils/functions/expect/blogs/expectFoundBlog';
import { SubscribeStatus } from '../../../src/base/enums/SubscribeStatus.enum';
import { createPostInput } from '../../base/utils/constants/posts.constants';
import { expectCreatedPostForBlog } from '../../base/utils/functions/expect/blogs/expectCreatedPostForBlog';
import { waitForIt } from '../../../src/base/utils/wait';
import { TelegramAdapter } from '../../../src/features/integrations/telegram/adapters/telegram.adapter';
import { telegramBotPayload } from '../../base/utils/constants/telegram.constant';

describe('Telegram: v1', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('Telegram: int', () => {
    it(`POST -> "blogs/:blogId/subscription": 
        User1 create blog3. 
        User2 subscribed to blog3. 
        User2 try to subscribe to blog3 again. 
        Get blog3 by user2. 
        Should return blog with 'currentUserSubscriptionStatus' = 'Subscribed', 
        'subscribersCount' should be 1.; 
        status 201; 
        used additional methods: 
        POST => /blogger/blogs, 
        GET => /blogs/:blogId;`, async () => {
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
        .post(`/blogs/${createdBlog.body.id}/subscription`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(204);

      await agent
        .post(`/blogs/${createdBlog.body.id}/subscription`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(204);

      const subscribeResult = await agent
        .get(`/blogs/${createdBlog.body.id}`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(200);

      expectFoundBlog(
        subscribeResult,
        createBlogInput,
        SubscribeStatus.SUBSCRIBED,
        1,
      );
    });

    it(`DELETE -> "blogs/:blogId/subscription": 
        User1 create blog2. 
        User2 subscribed to blog2. 
        User2 has unsubscribed from blog2. 
        Get blog2 by user2. 
        Should return blog with 'currentUserSubscriptionStatus' = 'Unsubscribed', 'subscribersCount' should be 0. 
        Get blog2 by user3. 
        Should return blog with 'currentUserSubscriptionStatus' = 'None', 'subscribersCount' should be 0. 
        Get blog2 by unauthorized user. 
        Should return blog with 'currentUserSubscriptionStatus' = 'None', 'subscribersCount' should be 0.; 
        status 201; 
        used additional methods: 
        POST => /blogger/blogs, 
        POST => /blogs/:blogId/subscription, 
        GET => /blogs/:blogId;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);
      const testingUser = await usersTestManager.createAndLoginUser(2);
      const testingUser2 = await usersTestManager.createAndLoginUser(3);

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      await agent
        .post(`/blogs/${createdBlog.body.id}/subscription`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(204);

      await agent
        .delete(`/blogs/${createdBlog.body.id}/subscription`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(204);

      const subscribeResult = await agent
        .get(`/blogs/${createdBlog.body.id}`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(200);

      expectFoundBlog(
        subscribeResult,
        createBlogInput,
        SubscribeStatus.UNSUBSCRIBED,
        0,
      );

      const subscribeResult2 = await agent
        .get(`/blogs/${createdBlog.body.id}`)
        .set('Authorization', `Bearer ${testingUser2.token}`)
        .expect(200);

      expectFoundBlog(
        subscribeResult2,
        createBlogInput,
        SubscribeStatus.NONE,
        0,
      );

      const subscribeResult3 = await agent
        .get(`/blogs/${createdBlog.body.id}`)
        .expect(200);

      expectFoundBlog(
        subscribeResult3,
        createBlogInput,
        SubscribeStatus.NONE,
        0,
      );
    });

    it(`1.  DELETE -> "blogs/:blogId/subscription": 
            User1 create blog2. 
            User2 subscribed to blog2. 
            User2 has unsubscribed from blog2. 
            Get blog2 by user2. 
            Should return blog with 'currentUserSubscriptionStatus' = 'Unsubscribed', 'subscribersCount' should be 0. 
            Get blog2 by user3. 
            Should return blog with 'currentUserSubscriptionStatus' = 'None', 'subscribersCount' should be 0. 
            Get blog2 by unauthorized user. 
            Should return blog with 'currentUserSubscriptionStatus' = 'None', 'subscribersCount' should be 0.; 
            status 201; 
            used additional methods: 
            POST => /blogger/blogs, 
            POST => /blogs/:blogId/subscription, 
            GET => /blogs/:blogId;
            
        2. POST -> "blogs/:blogId/subscription": 
            User1 create blog3. 
            User2 subscribed to blog3. 
            User2 try to subscribe to blog3 again. 
            Get blog3 by user2. 
            Should return blog with 'currentUserSubscriptionStatus' = 'Subscribed', 'subscribersCount' should be 1.; 
            status 201; 
            used additional methods: 
            POST => /blogger/blogs, 
            GET => /blogs/:blogId;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);
      const testingUser = await usersTestManager.createAndLoginUser(2);
      const testingUser2 = await usersTestManager.createAndLoginUser(3);

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      await agent
        .post(`/blogs/${createdBlog.body.id}/subscription`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(204);

      await agent
        .delete(`/blogs/${createdBlog.body.id}/subscription`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(204);

      const subscribeResult = await agent
        .get(`/blogs/${createdBlog.body.id}`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(200);

      expectFoundBlog(
        subscribeResult,
        createBlogInput,
        SubscribeStatus.UNSUBSCRIBED,
        0,
      );

      const subscribeResult2 = await agent
        .get(`/blogs/${createdBlog.body.id}`)
        .set('Authorization', `Bearer ${testingUser2.token}`)
        .expect(200);

      expectFoundBlog(
        subscribeResult2,
        createBlogInput,
        SubscribeStatus.NONE,
        0,
      );

      const subscribeResult3 = await agent
        .get(`/blogs/${createdBlog.body.id}`)
        .expect(200);

      expectFoundBlog(
        subscribeResult3,
        createBlogInput,
        SubscribeStatus.NONE,
        0,
      );

      const blogger_2 = await usersTestManager.createAndLoginUser(4);
      const testingUser_2 = await usersTestManager.createAndLoginUser(5);

      const createdBlog_2 = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${blogger_2.token}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      await agent
        .post(`/blogs/${createdBlog_2.body.id}/subscription`)
        .set('Authorization', `Bearer ${testingUser_2.token}`)
        .expect(204);

      await agent
        .post(`/blogs/${createdBlog_2.body.id}/subscription`)
        .set('Authorization', `Bearer ${testingUser_2.token}`)
        .expect(204);

      const subscribeResult_2 = await agent
        .get(`/blogs/${createdBlog_2.body.id}`)
        .set('Authorization', `Bearer ${testingUser_2.token}`)
        .expect(200);

      expectFoundBlog(
        subscribeResult_2,
        createBlogInput,
        SubscribeStatus.SUBSCRIBED,
        1,
      );
    });

    it(`POST -> "blogger/blogs/:blogId/posts": 
        User1 create blog1. 
        User2 subscribed to blog1. 
        User2 got auth bot link with personal user code like 'https://t.me/BotBotBot?code=123'. 
        User2 follow the link and start the bot with user's personal code like '/start code=123'. 
        User1 create post1 for blog1. 
        Await 2 sec. 
        User2 should receive a message via telegram bot about the publication of a new post. 
        The message should contain the name of the blog1. 
        Ex.: 'New post published for blog "It-inc news"'; 
        status 201; 
        used additional methods: 
        POST => /blogger/blogs, 
        POST => /blogs/:blogId/subscription, 
        GET => /integrations/telegram/auth-bot-link;`, async () => {
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
        .post(`/blogs/${createdBlog.body.id}/subscription`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(204);

      const subscribeResult = await agent
        .get(`/blogs/${createdBlog.body.id}`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(200);

      expectFoundBlog(
        subscribeResult,
        createBlogInput,
        SubscribeStatus.SUBSCRIBED,
        1,
      );

      const getLink = await agent
        .get(`/integrations/telegram/auth-bot-link`)
        .set('Authorization', `Bearer ${testingUser.token}`)
        .expect(200);

      const startMessage = getLink.body.link.split('=');
      const code = startMessage[1];
      const payload = telegramBotPayload;
      payload.message.text = `/start code=${code}`;

      await agent
        .post(`/integrations/telegram/webhook`)
        .send(payload)
        .expect(204);

      const executeSpy = jest.spyOn(TelegramAdapter.prototype, 'sendMessage');

      const createdPost = await agent
        .post(`/blogger/blogs/${createdBlog.body.id}/posts`)
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createPostInput)
        .expect(201);

      expectCreatedPostForBlog(
        createdPost,
        createPostInput,
        createdBlog.body.id,
        createdBlog.body.name,
        0,
        0,
        'None',
      );

      await waitForIt(2);

      expect(executeSpy).toHaveBeenCalledWith(
        `New post published for blog ${createdBlog.body.name}`,
        payload.message.from.id.toString(),
      );

      executeSpy.mockClear();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
