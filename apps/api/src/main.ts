import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 连接 MQTT 微服务
  app.connectMicroservice({
    transport: Transport.MQTT,
    options: {
      url: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    },
  })

  await app.startAllMicroservices()

  app.enableCors({
    origin: ['http://localhost:4000', 'http://127.0.0.1:4000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
