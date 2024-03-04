import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';
import path from 'path';

import { UsersTestManager } from '../../base/managers/users.manager';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import { expectCreatedBlog } from '../../base/utils/functions/expect/blogs/expectCreatedBlog';
import { testing_allData_uri } from '../../base/utils/constants/routes';
import { createPostInput } from '../../base/utils/constants/posts.constants';
import { expectCreatedPostForBlog } from '../../base/utils/functions/expect/blogs/expectCreatedPostForBlog';
import { expectCreatedThreeMainImages } from '../../base/utils/functions/expect/blogs/expectCreatedThreeMainImages';
import { expectPostWithImages } from '../../base/utils/functions/expect/posts/expectPostWithImages';
import { emptyLikeInfo } from '../../base/utils/constants/likes.constant';
import { expectCreatedWallpaper } from '../../base/utils/functions/expect/blogs/expectCreatedWallpaper';
import { expectWallpaperAndMainImages } from '../../base/utils/functions/expect/blogs/expectWallpaperAndMainImages';
import { expectFoundBlogsForUser } from '../../base/utils/functions/expect/blogs/expectFoundBlogsForUser';
import { expectFoundPostsForUser } from '../../base/utils/functions/expect/posts/expectFoundPostsForUser';

describe('Images: v1', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('Images: int', () => {
    it(`GET -> "posts/:id": 
        Create blog. 
        Create post. 
        Add main image to blog. 
        Get post by id. 
        Should return post with added images; 
        status 200; content: post by id with images; 
        used additional methods: 
        POST => /blogger/blogs, 
        POST => /blogger/blogs/:blogId/posts, 
        POST -> /blogger/blogs/:blogId/posts/:postId/images/main;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);

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

      expectCreatedPostForBlog(
        createdPost,
        createPostInput,
        createdBlog.body.id,
        createdBlog.body.name,
        0,
        0,
        'None',
      );

      const imagePath = path.join(
        __dirname,
        '../../base/assets/white940-432.jpg',
      );

      const uploadImage = await agent
        .post(
          `/blogger/blogs/${createdBlog.body.id}/posts/${createdPost.body.id}/images/main`,
        )
        .set('Authorization', `Bearer ${blogger.token}`)
        .attach('file', imagePath)
        .expect(201);

      expectCreatedThreeMainImages(uploadImage, createdPost.body.id);

      const getPostResponse = await agent
        .get(`/posts/${createdPost.body.id}`)
        .expect(200);

      expectPostWithImages(
        getPostResponse,
        createdBlog,
        createPostInput,
        emptyLikeInfo,
      );
    });

    it(`upload images for blog
        POST -> "/blogger/blogs/:blogId/images/wallpaper": 
        Create blog. 
        Add wallpaper 1028x312 to blog. 
        Should return created wallpaper. 
        Get image using wallpaper.url. 
        The image should match the sent wallpaper; 
        status 201; 
        content: created wallpaper for blog; 
        used additional methods: 
        POST => /blogger/blogs;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      const imagePath = path.join(
        __dirname,
        '../../base/assets/1028-312-wp.jpg',
      );

      const uploadImage = await agent
        .post(`/blogger/blogs/${createdBlog.body.id}/images/wallpaper`)
        .set('Authorization', `Bearer ${blogger.token}`)
        .attach('file', imagePath)
        .expect(201);

      expectCreatedWallpaper(uploadImage, createdBlog.body.id);
    });

    it(`GET -> "blogs": 
        Create 5 blogs. 
        Add wallpaper to each blog. 
        Add main image to each blog. 
        Get blogs. 
        Should return blog list with added images; 
        status 200; 
        content: blogs with images; 
        used additional methods: 
        POST -> /blogger/blogs, 
        POST -> /blogger/blogs/:blogId/images/main, 
        POST -> /blogger/blogs/:blogId/images/wallpaper;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);

      for (let i = 0; i < 5; i++) {
        const createdBlog = await agent
          .post('/blogger/blogs')
          .set('Authorization', `Bearer ${blogger.token}`)
          .send(createBlogInput)
          .expect(201);

        expectCreatedBlog(createdBlog, createBlogInput);

        const imagePath = path.join(
          __dirname,
          '../../base/assets/1028-312-wp.jpg',
        );

        const uploadImage = await agent
          .post(`/blogger/blogs/${createdBlog.body.id}/images/wallpaper`)
          .set('Authorization', `Bearer ${blogger.token}`)
          .attach('file', imagePath)
          .expect(201);

        expectCreatedWallpaper(uploadImage, createdBlog.body.id);

        const imagePathMain = path.join(
          __dirname,
          '../../base/assets/node-156.png',
        );

        const uploadMainImage = await agent
          .post(`/blogger/blogs/${createdBlog.body.id}/images/main`)
          .set('Authorization', `Bearer ${blogger.token}`)
          .attach('file', imagePathMain)
          .expect(201);

        expectWallpaperAndMainImages(uploadMainImage, createdBlog.body.id);
      }

      const getBlogsByBlogger = await agent
        .get(`/blogger/blogs`)
        .set('Authorization', `Bearer ${blogger.token}`)
        .expect(200);

      expectFoundBlogsForUser(getBlogsByBlogger, 1, 1, 10, 5, createBlogInput);

      const getBlogs = await agent.get(`/blogs`).expect(200);

      expectFoundBlogsForUser(getBlogs, 1, 1, 10, 5, createBlogInput);
    }, 20000);

    it(`POST -> "/blogger/blogs/:blogId/posts/:postId/images/main": 
        Create blog. 
        Create post for the blog. 
        Add main image 940x432 to post. 
        Should return created images (940x432px, 300x180px, 149x96px). 
        Get images using main.$.url. 
        One of the images should match the sent image, 
        the others should be cropped; 
        status 201; content: created images for post; 
        used additional methods: 
        POST => /blogger/blogs, 
        POST => /blogger/blogs/:blogId/posts;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);

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

      expectCreatedPostForBlog(
        createdPost,
        createPostInput,
        createdBlog.body.id,
        createdBlog.body.name,
        0,
        0,
        'None',
      );

      const imagePath = path.join(
        __dirname,
        '../../base/assets/white940-432.jpg',
      );

      const uploadImage = await agent
        .post(
          `/blogger/blogs/${createdBlog.body.id}/posts/${createdPost.body.id}/images/main`,
        )
        .set('Authorization', `Bearer ${blogger.token}`)
        .attach('file', imagePath)
        .expect(201);

      expectCreatedThreeMainImages(uploadImage, createdPost.body.id);

      const getPostResponse = await agent
        .get(`/posts/${createdPost.body.id}`)
        .expect(200);

      expectPostWithImages(
        getPostResponse,
        createdBlog,
        createPostInput,
        emptyLikeInfo,
      );
    });

    it(`GET -> "blogs/:blogId/posts": 
        Create blog. 
        Create 5 posts for the blog. 
        Add main image to each post. 
        Get posts. 
        Should return post list with added images; 
        status 200; 
        content: posts with images; 
        used additional methods: 
        POST => /blogger/blogs, 
        POST => /blogger/blogs/:blogId/posts, 
        POST -> /blogger/blogs/:blogId/posts/:postId/images/main;`, async () => {
      await agent.delete(testing_allData_uri);

      const blogger = await usersTestManager.createAndLoginUser(1);

      const createdBlog = await agent
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${blogger.token}`)
        .send(createBlogInput)
        .expect(201);

      expectCreatedBlog(createdBlog, createBlogInput);

      for (let i = 0; i < 5; i++) {
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

        const imagePath = path.join(
          __dirname,
          '../../base/assets/white940-432.jpg',
        );

        const uploadImage = await agent
          .post(
            `/blogger/blogs/${createdBlog.body.id}/posts/${createdPost.body.id}/images/main`,
          )
          .set('Authorization', `Bearer ${blogger.token}`)
          .attach('file', imagePath)
          .expect(201);

        expectCreatedThreeMainImages(uploadImage, createdPost.body.id);
      }

      const getPosts = await agent.get(`/posts/`).expect(200);

      expectFoundPostsForUser(
        getPosts,
        createdBlog,
        1,
        1,
        10,
        5,
        createPostInput,
        emptyLikeInfo,
      );

      const getPostsByBlogId = await agent
        .get(`/blogs/${createdBlog.body.id}/posts`)
        .expect(200);

      expectFoundPostsForUser(
        getPostsByBlogId,
        createdBlog,
        1,
        1,
        10,
        5,
        createPostInput,
        emptyLikeInfo,
      );
      console.log(blogger.token);
    }, 20000);
  });

  afterAll(async () => {
    await app.close();
  });
});
