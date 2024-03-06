import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { TgBlogSubscriber } from '../domain/tg.blog.subscriber.entity';

@Injectable()
export class TgBlogSubscribersQueryRepository {
  private readonly logger = new Logger(TgBlogSubscribersQueryRepository.name);
  private readonly configService = new ConfigService();
  constructor(
    @InjectRepository(TgBlogSubscriber)
    private readonly blogSubscribersRepository: Repository<TgBlogSubscriber>,
  ) {}

  async findActiveSubscriber(userId: number): Promise<TgBlogSubscriber | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('s')
        .where(`s.userId = :userId`, { userId })
        .getOne();
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }

      return null;
    }
  }

  async findTelegramId(telegramId: number): Promise<TgBlogSubscriber | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('s')
        .where(`s.telegramId = :telegramId`, {
          telegramId,
        })
        .getOne();
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }

      return null;
    }
  }

  async findSubscriberByTelegramCode(
    telegramCode: string,
  ): Promise<TgBlogSubscriber | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('s')
        .where(`s.telegramCode = :telegramCode`, {
          telegramCode,
        })
        .getOne();
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }

      return null;
    }
  }

  async findRecordForSubscribe(
    blogId: number,
    userId: number,
  ): Promise<TgBlogSubscriber | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('s')
        .where(
          `(s.userId = :userId and s.blogId = :blogId) or (s.userId = :userId and s.subscribeStatus = 'None')`,
          {
            blogId: blogId,
            userId: userId,
          },
        )
        .getOne();
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }

      return null;
    }
  }

  async findSubscribersForTelegramNotification(
    blogId: number,
  ): Promise<TgBlogSubscriber[] | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('s')
        .select('s.telegramId')
        .where(`s.blogId = :blogId`, {
          blogId,
        })
        .andWhere(`s.subscribeStatus = 'Subscribed'`)
        .andWhere(`s.telegramId is NOT NULL`)
        .getMany();
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }

      return null;
    }
  }
}
