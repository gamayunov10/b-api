import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { applyAppSettings } from './settings/apply-app-setting'

const PORT = parseInt(process.env.PORT, 10) || 5000

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  applyAppSettings(app)

  await app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`, process.env.ENV)
  })
}

bootstrap()
