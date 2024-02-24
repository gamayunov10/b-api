import { INestApplication } from '@nestjs/common';
import supertest, { Response } from 'supertest';

import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query.repository';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../utils/constants/auth.constants';
import { BlogsQueryRepository } from '../../../src/features/blogs/infrastructure/blogs.query.repository';
import { BlogViewModel } from '../../../src/features/blogs/api/models/output/blog-view.model';
import { PostsQueryRepository } from '../../../src/features/posts/infrastructure/posts.query.repository';
import { PostViewModel } from '../../../src/features/posts/api/models/output/post-view.model';
import { CommentInputModel } from '../../../src/features/comments/api/models/input/comment-input.model';
import { createCommentInput } from '../utils/constants/comments.constant';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  createUserInput4,
  createUserInput5,
  createUserInput6,
  createUserInput7,
  userPassword,
} from '../utils/constants/users.constants';
import { CommentsQueryRepository } from '../../../src/features/comments/infrastructure/comments.query.repository';
import { CommentViewModel } from '../../../src/features/comments/api/models/output/comment-view.model';

export class UsersTestManager {
  constructor(
    protected readonly app: INestApplication,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.email).toBe(responseModel.email);
  }

  async createUser(createModel: any): Promise<Response> {
    return supertest(this.app.getHttpServer())
      .post('/sa/users')
      .auth(basicAuthLogin, basicAuthPassword)
      .send(createModel)
      .expect(201);
  }

  async createAndLoginUser(user: number) {
    let createModel = createUserInput;

    if (user === 2) {
      createModel = createUserInput2;
    }

    if (user === 3) {
      createModel = createUserInput3;
    }

    if (user === 4) {
      createModel = createUserInput4;
    }

    if (user === 5) {
      createModel = createUserInput5;
    }

    if (user === 6) {
      createModel = createUserInput6;
    }

    if (user === 7) {
      createModel = createUserInput7;
    }

    await supertest(this.app.getHttpServer())
      .post('/sa/users')
      .auth(basicAuthLogin, basicAuthPassword)
      .send(createModel)
      .expect(201);

    const login = await supertest(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: createModel.login,
        password: createModel.password,
      })
      .expect(200);

    const token = login.body.accessToken;
    const id = await this.getUserIdByLogin(createModel.login);

    return {
      token,
      id,
    };
  }

  async getUserIdByLogin(login: string): Promise<number> {
    return await this.usersQueryRepository.findUserByLogin(login);
  }

  async createCommentForPost(
    createModel: CommentInputModel,
    postId: string,
    token: string,
  ): Promise<Response> {
    return supertest(this.app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send(createCommentInput)
      .expect(201);
  }

  async createBlog(createModel: any): Promise<Response> {
    return supertest(this.app.getHttpServer())
      .post('/sa/blogs')
      .auth(basicAuthLogin, basicAuthPassword)
      .send(createModel)
      .expect(201);
  }

  async findBlogById(id: number): Promise<BlogViewModel | null> {
    return await this.blogsQueryRepository.findBlogById(id);
  }

  async createPostForBlog(createModel: any, blogId: number): Promise<Response> {
    return supertest(this.app.getHttpServer())
      .post(`/sa/blogs/${blogId}/posts`)
      .auth(basicAuthLogin, basicAuthPassword)
      .send(createModel)
      .expect(201);
  }

  async findPostByPostId(id: number): Promise<PostViewModel | null> {
    return await this.postsQueryRepository.findPostByPostId(id);
  }

  async findComment(id: number): Promise<CommentViewModel | null> {
    return await this.commentsQueryRepository.findComment(id);
  }

  async login(loginOrEmail: string): Promise<Response> {
    return await supertest(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: loginOrEmail,
        password: userPassword,
      })
      .expect(200);
  }

  async getEmailConfirmationCode(loginOrEmail: string): Promise<string | null> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmailForTesting(
        loginOrEmail,
      );

    return user?.emailConfirmationCode;
  }

  async getPasswordRecoveryCode(loginOrEmail: string): Promise<string | null> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmailForTesting(
        loginOrEmail,
      );

    return user?.passwordRecoveryCode;
  }

  async getDeviceId(loginOrEmail: string): Promise<string | null> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmailForTesting(
        loginOrEmail,
      );

    return user?.deviceId;
  }
}
