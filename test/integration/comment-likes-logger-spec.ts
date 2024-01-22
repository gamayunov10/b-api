import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../base/managers/users.manager';
import { beforeAllConfig } from '../base/settings/beforeAllConfig';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  createUserInput4,
  createUserInput5,
} from '../base/utils/constants/users.constants';
import { waitForIt } from '../base/utils/functions/wait';
import {
  comments_uri,
  posts_uri,
  testing_allData_uri,
} from '../base/utils/constants/routes';
import { createBlogInput } from '../base/utils/constants/blogs.constant';
import {
  createPostInput,
  createPostInput10,
  createPostInput2,
  createPostInput3,
  createPostInput4,
  createPostInput5,
  createPostInput6,
  createPostInput7,
  createPostInput8,
  createPostInput9,
} from '../base/utils/constants/posts.constants';
import { LikeStatus } from '../../src/base/enums/like_status.enum';
import { createCommentInput } from '../base/utils/constants/comments.constant';

describe('Comment likes', () => {
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
  let postId7;
  let postId8;
  let postId9;
  let postId10;

  let commentId1;
  let commentId2;
  let commentId3;
  let commentId4;
  let commentId5;
  let commentId6;
  let commentId7;
  let commentId8;
  let commentId9;
  let commentId10;

  let tokenUser1;
  let tokenUser2;
  let tokenUser3;
  let tokenUser4;
  let tokenUser5;

  describe('clear db', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 20000);
  });

  describe('creating users:5 & blog:1 & posts:10', () => {
    it(`should create & login 5 users`, async () => {
      await usersTestManager.createUser(createUserInput);
      await usersTestManager.createUser(createUserInput2);
      await usersTestManager.createUser(createUserInput3);
      await usersTestManager.createUser(createUserInput4);
      await usersTestManager.createUser(createUserInput5);

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

      const user5Response = await usersTestManager.login(
        createUserInput5.login,
      );
      tokenUser5 = user5Response.body.accessToken;
    }, 15000);

    it(`should create new blog`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      blogId = blog.body.id;
    });

    it(`should create 10 posts`, async () => {
      await usersTestManager.createPostForBlog(createPostInput, blogId);
      await usersTestManager.createPostForBlog(createPostInput2, blogId);
      await usersTestManager.createPostForBlog(createPostInput3, blogId);
      await usersTestManager.createPostForBlog(createPostInput4, blogId);
      await usersTestManager.createPostForBlog(createPostInput5, blogId);
      await usersTestManager.createPostForBlog(createPostInput6, blogId);
      await usersTestManager.createPostForBlog(createPostInput7, blogId);
      await usersTestManager.createPostForBlog(createPostInput8, blogId);
      await usersTestManager.createPostForBlog(createPostInput9, blogId);
      await usersTestManager.createPostForBlog(createPostInput10, blogId);

      const posts = await agent.get(posts_uri).expect(200);

      postId1 = posts.body.items[0].id;
      postId2 = posts.body.items[1].id;
      postId3 = posts.body.items[2].id;
      postId4 = posts.body.items[3].id;
      postId5 = posts.body.items[4].id;
      postId6 = posts.body.items[5].id;
      postId7 = posts.body.items[6].id;
      postId8 = posts.body.items[7].id;
      postId9 = posts.body.items[8].id;
      postId10 = posts.body.items[9].id;
    }, 20000);

    it(`should create 10 comments`, async () => {
      await usersTestManager.createCommentForPost(
        createCommentInput,
        postId1,
        tokenUser1,
      );
      await usersTestManager.createCommentForPost(
        createCommentInput,
        postId1,
        tokenUser2,
      );
      await usersTestManager.createCommentForPost(
        createCommentInput,
        postId1,
        tokenUser3,
      );
      await usersTestManager.createCommentForPost(
        createCommentInput,
        postId1,
        tokenUser4,
      );
      await usersTestManager.createCommentForPost(
        createCommentInput,
        postId1,
        tokenUser5,
      );
      await usersTestManager.createCommentForPost(
        createCommentInput,
        postId1,
        tokenUser1,
      );
      await usersTestManager.createCommentForPost(
        createCommentInput,
        postId1,
        tokenUser2,
      );
      await usersTestManager.createCommentForPost(
        createCommentInput,
        postId1,
        tokenUser3,
      );
      await usersTestManager.createCommentForPost(
        createCommentInput,
        postId1,
        tokenUser4,
      );
      await usersTestManager.createCommentForPost(
        createCommentInput,
        postId1,
        tokenUser5,
      );

      const comments = await agent
        .get(posts_uri + postId1 + comments_uri)
        .expect(200);

      commentId1 = comments.body.items[0].id;
      commentId2 = comments.body.items[1].id;
      commentId3 = comments.body.items[2].id;
      commentId4 = comments.body.items[3].id;
      commentId5 = comments.body.items[4].id;
      commentId6 = comments.body.items[5].id;
      commentId7 = comments.body.items[6].id;
      commentId8 = comments.body.items[7].id;
      commentId9 = comments.body.items[8].id;
      commentId10 = comments.body.items[9].id;
    }, 20000);
  });

  describe('like operations', () => {
    it('should like comment 1 by user 1', async () => {
      await agent
        .put(`/comments/${commentId1}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like comment 1 by user 2', async () => {
      await agent
        .put(`/comments/${commentId1}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like comment 1 by user 3', async () => {
      await agent
        .put(`/comments/${commentId1}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser3}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like comment 1 by user 4', async () => {
      await agent
        .put(`/comments/${commentId1}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser4}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should Dislike comment 1 by user 5', async () => {
      console.log(
        `commentId::${commentId1} lc:4, dc:1, tokenUser5::${tokenUser5} userStatus:: ${LikeStatus.DISLIKE}, postId:: ${postId1}`,
      );
      await agent
        .put(`/comments/${commentId1}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser5}`)
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should Dislike comment 2 by user 1', async () => {
      await agent
        .put(`/comments/${commentId2}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should Dislike comment 2 by user 2', async () => {
      await agent
        .put(`/comments/${commentId2}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should Dislike comment 2 by user 3', async () => {
      await agent
        .put(`/comments/${commentId2}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser3}`)
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should Dislike comment 2 by user 4', async () => {
      await agent
        .put(`/comments/${commentId2}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser4}`)
        .send({
          likeStatus: LikeStatus.DISLIKE,
        })
        .expect(204);
    });

    it('should Like comment 2 by user 5', async () => {
      console.log(
        `commentId::${commentId2} lc:1, dc:4, tokenUser5::${tokenUser5} userStatus:: ${LikeStatus.LIKE}, postId:: ${postId1}`,
      );
      await agent
        .put(`/comments/${commentId2}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser5}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);
    });

    it('should like/unlike comment 3 by user 1', async () => {
      await agent
        .put(`/comments/${commentId3}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);

      await agent
        .put(`/comments/${commentId3}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          likeStatus: LikeStatus.NONE,
        })
        .expect(204);
    });

    it('should like/unlike comment 3 by user 2', async () => {
      await agent
        .put(`/comments/${commentId3}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);

      await agent
        .put(`/comments/${commentId3}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send({
          likeStatus: LikeStatus.NONE,
        })
        .expect(204);
    });

    it('should like/unlike comment 3 by user 3', async () => {
      await agent
        .put(`/comments/${commentId3}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser3}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);

      await agent
        .put(`/comments/${commentId3}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser3}`)
        .send({
          likeStatus: LikeStatus.NONE,
        })
        .expect(204);
    });

    it('should like/unlike comment 4 by user 1', async () => {
      await agent
        .put(`/comments/${commentId3}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser4}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);

      await agent
        .put(`/comments/${commentId3}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser4}`)
        .send({
          likeStatus: LikeStatus.NONE,
        })
        .expect(204);
    });

    it('should like/unlike comment 5 by user 1', async () => {
      console.log(
        `commentId::${commentId3} lc:0, dc:0, tokenUser5::${tokenUser5} userStatus:: ${LikeStatus.NONE}, postId:: ${postId1}`,
      );
      await agent
        .put(`/comments/${commentId3}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser5}`)
        .send({
          likeStatus: LikeStatus.LIKE,
        })
        .expect(204);

      await agent
        .put(`/comments/${commentId3}/like-status/`)
        .set('Authorization', `Bearer ${tokenUser5}`)
        .send({
          likeStatus: LikeStatus.NONE,
        })
        .expect(204);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
