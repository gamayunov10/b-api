import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { HttpExceptionFilter } from '../infrastructure/exception-filters/http-exception-filter'
import { AppModule } from '../app.module'
import { useContainer } from 'class-validator'
import { customExceptionFactory } from 'src/infrastructure/exception-filters/exception.factory'

const APP_PREFIX = '/api'

export const applyAppSettings = (app: INestApplication) => {
  app.enableCors()
  // app.use(cookieParser())
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: customExceptionFactory,
    }),
  )

  app.useGlobalFilters(new HttpExceptionFilter())

  setAppPrefix(app)

  setSwagger(app)

  setAppPipes(app)

  setAppExceptionsFilters(app)
}

const setAppPrefix = (app: INestApplication) => {
  app.setGlobalPrefix(APP_PREFIX)
}

const setSwagger = (app: INestApplication) => {
  if (process.env.ENV !== 'PRODUCTION') {
    const swaggerPath = APP_PREFIX + '/swagger'

    const config = new DocumentBuilder()
      .setTitle('BLOGGER API')
      .addBearerAuth()
      .setVersion('1.0')
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'Blogger Swagger',
    })
  }
}

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const customErrors = []

        errors.forEach((e) => {
          const constraintKeys = Object.keys(e.constraints)

          constraintKeys.forEach((cKey) => {
            const msg = e.constraints[cKey]

            customErrors.push({ key: e.property, message: msg })
          })
        })

        throw new BadRequestException(customErrors)
      },
    }),
  )
}

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter())
}
