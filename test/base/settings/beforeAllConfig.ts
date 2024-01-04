import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../managers/users.manager';
import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query.repository';
import { BlogsQueryRepository } from '../../../src/features/blogs/infrastructure/blogs.query.repository';
import { PostsQueryRepository } from '../../../src/features/posts/infrastructure/posts.query.repository';

import { initializeApp } from './initializeApp';

export async function beforeAllConfig(): Promise<{
  app: INestApplication;
  agent: SuperAgentTest;
  usersTestManager: UsersTestManager;
}> {
  const result = await initializeApp();
  const app = result.app;
  const agent = result.agent;

  const usersQueryRepository = app.get(UsersQueryRepository);
  const blogsQueryRepository = app.get(BlogsQueryRepository);
  const postsQueryRepository = app.get(PostsQueryRepository);

  const usersTestManager = new UsersTestManager(
    app,
    usersQueryRepository,
    blogsQueryRepository,
    postsQueryRepository,
  );

  return { app, agent, usersTestManager };
}
