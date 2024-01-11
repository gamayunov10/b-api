import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../base/managers/users.manager';
import { beforeAllConfig } from '../base/settings/beforeAllConfig';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  createUserInput4,
  userLogin01,
  userLogin02,
  userLogin03,
  userLogin04,
} from '../base/utils/constants/users.constants';
import { waitForIt } from '../base/utils/functions/wait';
import { posts_uri, testing_allData_uri } from '../base/utils/constants/routes';
import { createBlogInput } from '../base/utils/constants/blogs.constant';
import {
  createPostInput,
  createPostInput2,
  createPostInput3,
  createPostInput4,
  createPostInput5,
  createPostInput6,
} from '../base/utils/constants/posts.constants';
import { LikeStatus } from '../../src/base/enums/like_status.enum';

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

  let blogId;

  let postId1;
  let postId2;
  let postId3;
  let postId4;
  let postId5;
  let postId6;

  let tokenUser1;
  let tokenUser2;
  let tokenUser3;
  let tokenUser4;

  describe('negative: GET blogs', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    });
  });

  describe('negative: GET blogs', () => {
    it(`should create & login 4 users`, async () => {
      await usersTestManager.createUser(createUserInput);
      await usersTestManager.createUser(createUserInput2);
      await usersTestManager.createUser(createUserInput3);
      await usersTestManager.createUser(createUserInput4);

      const user1Response = await usersTestManager.login(createUserInput.login);
      tokenUser1 = user1Response.body.accessToken;

      const user2Response = await usersTestManager.login(
        createUserInput2.login,
      );
      tokenUser2 = user2Response.body.accessToken;

      const user3Response = await usersTestManager.login(
        createUserInput3.login,
      );
      tokenUser3 = user3Response.body.accessToken;

      const user4Response = await usersTestManager.login(
        createUserInput4.login,
      );
      tokenUser4 = user4Response.body.accessToken;
    });

    it(`should create new blog`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      blogId = blog.body.id;
    });

    it(`should create 6 posts`, async () => {
      await usersTestManager.createPostForBlog(createPostInput, blogId);
      await usersTestManager.createPostForBlog(createPostInput2, blogId);
      await usersTestManager.createPostForBlog(createPostInput3, blogId);
      await usersTestManager.createPostForBlog(createPostInput4, blogId);
      await usersTestManager.createPostForBlog(createPostInput5, blogId);
      await usersTestManager.createPostForBlog(createPostInput6, blogId);

      const posts = await agent.get(posts_uri).expect(200);

      postId1 = posts.body.items[0].id;
      postId2 = posts.body.items[1].id;
      postId3 = posts.body.items[2].id;
      postId4 = posts.body.items[3].id;
      postId5 = posts.body.items[4].id;
      postId6 = posts.body.items[5].id;
    });

    it('should like post 1 by user 1', async () => {
      return agent
        .put(`/posts/${postId1}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 1 by user 2', async () => {
      return agent
        .put(`/posts/${postId1}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 2 by user 2', async () => {
      return agent
        .put(`/posts/${postId2}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 2 by user 3', async () => {
      return agent
        .put(`/posts/${postId2}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser3}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 3 by user 1', async () => {
      return agent
        .put(`/posts/${postId3}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 4 by user 1', async () => {
      return agent
        .put(`/posts/${postId4}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 4 by user 4', async () => {
      return agent
        .put(`/posts/${postId4}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser4}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 4 by user 2', async () => {
      return agent
        .put(`/posts/${postId4}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 4 by user 3', async () => {
      return agent
        .put(`/posts/${postId4}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser3}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like post 5 by user 2', async () => {
      return agent
        .put(`/posts/${postId5}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should dislike post 5 by user 3', async () => {
      return agent
        .put(`/posts/${postId5}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser3}`)
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should dislike post 6 by user 1', async () => {
      return agent
        .put(`/posts/${postId6}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should dislike post 6 by user 2', async () => {
      return agent
        .put(`/posts/${postId6}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });
  });

  describe('positive: GET posts', () => {
    it('should return correct likes/dislikes counters values', async () => {
      await waitForIt();

      const posts = await agent
        .get(posts_uri)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .expect(200);

      // Post 01
      expect(posts.body.items[0].extendedLikesInfo.likesCount).toBe(2);
      expect(posts.body.items[0].extendedLikesInfo.dislikesCount).toBe(0);

      expect(posts.body.items[0].extendedLikesInfo.myStatus).toBe(
        LikeStatus.LIKE,
      );

      expect(posts.body.items[0].extendedLikesInfo.newestLikes[0].login).toBe(
        userLogin02,
      );
      expect(posts.body.items[0].extendedLikesInfo.newestLikes[1].login).toBe(
        userLogin01,
      );

      // Post 02
      expect(posts.body.items[1].extendedLikesInfo.likesCount).toBe(2);
      expect(posts.body.items[1].extendedLikesInfo.dislikesCount).toBe(0);

      expect(posts.body.items[1].extendedLikesInfo.myStatus).toBe(
        LikeStatus.NONE,
      );

      expect(posts.body.items[1].extendedLikesInfo.newestLikes[0].login).toBe(
        userLogin03,
      );
      expect(posts.body.items[1].extendedLikesInfo.newestLikes[1].login).toBe(
        userLogin02,
      );

      // Post 03
      expect(posts.body.items[2].extendedLikesInfo.likesCount).toBe(1);
      expect(posts.body.items[2].extendedLikesInfo.dislikesCount).toBe(0);

      expect(posts.body.items[2].extendedLikesInfo.myStatus).toBe(
        LikeStatus.LIKE,
      );

      // Post 04
      expect(posts.body.items[3].extendedLikesInfo.likesCount).toBe(4);
      expect(posts.body.items[3].extendedLikesInfo.dislikesCount).toBe(0);

      expect(posts.body.items[2].extendedLikesInfo.myStatus).toBe(
        LikeStatus.LIKE,
      );

      expect(posts.body.items[3].extendedLikesInfo.newestLikes).toHaveLength(3);

      expect(posts.body.items[3].extendedLikesInfo.newestLikes[0].login).toBe(
        userLogin03,
      );
      expect(posts.body.items[3].extendedLikesInfo.newestLikes[1].login).toBe(
        userLogin02,
      );
      expect(posts.body.items[3].extendedLikesInfo.newestLikes[2].login).toBe(
        userLogin04,
      );

      // Post 05
      expect(posts.body.items[4].extendedLikesInfo.likesCount).toBe(1);
      expect(posts.body.items[4].extendedLikesInfo.dislikesCount).toBe(1);

      expect(posts.body.items[4].extendedLikesInfo.myStatus).toBe(
        LikeStatus.NONE,
      );

      expect(posts.body.items[4].extendedLikesInfo.newestLikes[0].login).toBe(
        userLogin02,
      );

      // Post 06
      expect(posts.body.items[5].extendedLikesInfo.likesCount).toBe(1);
      expect(posts.body.items[5].extendedLikesInfo.dislikesCount).toBe(1);

      expect(posts.body.items[5].extendedLikesInfo.myStatus).toBe(
        LikeStatus.LIKE,
      );

      expect(posts.body.items[5].extendedLikesInfo.newestLikes[0].login).toBe(
        userLogin01,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
