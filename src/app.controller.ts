import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';
import { SwaggerOptions } from './infrastructure/decorators/swagger';

@Controller()
@ApiTags('Home')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @SwaggerOptions(
    'Checking the api for functionality',
    false,
    false,
    200,
    'Works Fine!',
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  )
  getHello(): string {
    return this.appService.getHello();
  }
}
