import { FileValidator, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { ConfigService } from '@nestjs/config';

type ImageOptions = {
  width: number;
  height: number;
  maxSize: number;
};

export class ImageValidator extends FileValidator<ImageOptions> {
  private readonly logger = new Logger(ImageValidator.name);
  private static configService: ConfigService;

  static setConfigService(configService: ConfigService) {
    ImageValidator.configService = configService;
  }

  constructor(
    public width: number,
    public height: number,
    public maxSize: number,
  ) {
    super({
      width,
      height,
      maxSize,
    });
  }

  async isValid(file?: any): Promise<boolean> {
    const image = sharp(file.buffer);
    let metadata;

    try {
      metadata = await image.metadata();
    } catch (e) {
      if (ImageValidator.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }

      return false;
    }

    return !(
      metadata.width !== this.width ||
      metadata.height !== this.height ||
      metadata.size > this.maxSize ||
      (metadata.format !== 'jpeg' &&
        metadata.format !== 'jpg' &&
        metadata.format !== 'png')
    );
  }
  buildErrorMessage(): string {
    return 'Format is incorrect';
  }
}
