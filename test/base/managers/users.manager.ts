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

export class UsersTestManager {
  constructor(
    protected readonly app: INestApplication,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.email).toBe(responseModel.email);
  }

  async createUser(createModel: any): Promise<Response> {
    return supertest(this.app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(createModel)
      .expect(201);
  }

  async updateUser(
    adminAccessToken: string,
    updateModel: any,
  ): Promise<Response> {
    return supertest(this.app.getHttpServer())
      .put('/sa/users')
      .auth(adminAccessToken, {
        type: 'bearer',
      })
      .send(updateModel)
      .expect(204);
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

  async login(loginOrEmail: string, password: string): Promise<Response> {
    return await supertest(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: loginOrEmail,
        password: password,
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

  async getEmailExpirationDate(loginOrEmail: string): Promise<Date | null> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmailForTesting(
        loginOrEmail,
      );

    return user?.emailExpirationDate;
  }

  async getPasswordExpirationDate(loginOrEmail: string): Promise<Date | null> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmailForTesting(
        loginOrEmail,
      );

    return user?.passwordExpirationDate;
  }

  async getDeviceId(loginOrEmail: string): Promise<string | null> {
    const user =
      await this.usersQueryRepository.getUserByLoginOrEmailForTesting(
        loginOrEmail,
      );

    return user?.deviceId;
  }
}
