import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { AppModule } from './app.module'
import { Logger } from 'nestjs-pino'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  })

  // 使用 pino logger
  app.useLogger(app.get(Logger))

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('AIO API')
    .setDescription('API documentation for AIO')
    .setVersion('1.0')
    .addCookieAuth('nest-auth.session_token')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  // 连接 MQTT 微服务
  // app.connectMicroservice({
  //   transport: Transport.MQTT,
  //   options: {
  //     url: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  //   },
  // })

  // await app.startAllMicroservices()

  app.enableCors({
    origin: ['http://localhost:40000', 'http://127.0.0.1:4000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Cookie'],
  })

  await app.listen(process.env.PORT ?? 3000)

  const logger = app.get(Logger)
  logger.log(`Application is running on: ${await app.getUrl()}`)
  logger.log(`Swagger docs available at: ${await app.getUrl()}/api/docs`)
}
bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
