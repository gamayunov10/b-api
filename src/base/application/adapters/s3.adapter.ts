import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as process from 'process';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Adapter {
  s3Client: S3Client;

  private readonly logger = new Logger(S3Adapter.name);

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'eu-east-1',
      endpoint: process.env.S3_DOMAIN,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadImage(
    key: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<boolean> {
    const bucketParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    const command = new PutObjectCommand(bucketParams);
    try {
      await this.s3Client.send(command);
      return true;
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }

      return false;
    }
  }
}
