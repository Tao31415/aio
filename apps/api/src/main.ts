import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { AppModule } from './app.module'
import { Logger } from 'nestjs-pino'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { VersioningType } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  })
  app.setGlobalPrefix('api', {
    exclude: ['api/docs'],
  })
  // 启用版本控制
  app.enableVersioning({
    type: VersioningType.URI, // 基于 URI 版本控制，例如 /v1/xxx
    defaultVersion: '1', // 默认版本号
  })
  // 使用 pino logger
  app.useLogger(app.get(Logger))

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('AIO API')
    .setDescription('API documentation for AIO')
    .setVersion('1.0')
    .addCookieAuth('aio.session_token')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    jsonDocumentUrl: 'api/v1/common-docs',
    swaggerOptions: {
      persistAuthorization: true,
      urls: [
        { url: '/api/v1/auth-docs', name: 'Auth API' },
        { url: '/api/v1/common-docs', name: 'Main API' },
      ],
    },
  })

  // 连接 MQTT 微服务
  app.connectMicroservice({
    transport: Transport.MQTT,
    options: {
      url: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    },
  })

  await app.startAllMicroservices()

  const configService = app.get(ConfigService)
  const corsOrigins = configService.get<string[]>('app.corsOrigins', [])

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`), false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Cookie'],
  })
  app.enableShutdownHooks()
  await app.listen(process.env.PORT ?? 3000)

  const logger = app.get(Logger)
  logger.log({ url: await app.getUrl() }, 'Application is running')
  logger.log({ url: await app.getUrl() }, 'Swagger docs available')
}
bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
