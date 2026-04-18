import { Logger, Module } from '@nestjs/common'
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth'
import { createAuthOptions } from './auth'
import { betterAuth } from 'better-auth'
import type { NextFunction, Request, Response } from 'express'
import { REDIS_CLIENT } from '@redis/redis.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { Pool } from 'pg'

const logger = new Logger('AuthModule')
const authRouteWhitelist = [
  'sign-in',
  'sign-out',
  'get-session',
  'ok',
  'is-username-available',
  'sign-up/email',
  'update-user',
  'admin',
]
const authBasePath = 'api/v1/auth'
export const AUTH_CLIENT = 'AUTH_CLIENT'

@Module({
  imports: [
    ConfigModule,
    BetterAuthModule.forRootAsync({
      inject: [ConfigService, REDIS_CLIENT],
      useFactory: (config: ConfigService, redis: Redis) => {
        const authModuleOptions = createAuthOptions({
          pool: new Pool({
            host: config.getOrThrow<string>('db.host'),
            port: config.getOrThrow<number>('db.port'),
            database: config.getOrThrow<string>('db.database'),
            user: config.getOrThrow<string>('db.username'),
            password: config.getOrThrow<string>('db.password'),
          }),
          redis: redis,
          basePath: config.getOrThrow<string>('app.betterAuthBasePath'),
          cookiePrefix: 'aio',
          isProduction: config.getOrThrow<string>('app.env') === 'production',
        })

        return {
          auth: betterAuth(authModuleOptions),
          middleware: (req: Request, res: Response, next: NextFunction) => {
            const requestPath = (req.originalUrl || req.url).split('?')[0]
            const authSubPath = requestPath
              .replace(authBasePath, '')
              .replace(/^\/+/, '')

            logger.debug(`Received auth request path: ${authSubPath || '/'}`)

            const isAllowed = authRouteWhitelist.some((p) =>
              authSubPath.startsWith(p)
            )
            if (!isAllowed) {
              logger.debug('Auth request path is not allowed')
              res.status(403).json({ message: '该接口已被禁用' })
              return
            }
            logger.debug('Auth request path is allowed')
            next()
          },
          bodyParser: {
            json: { limit: '10mb' },
            urlencoded: { limit: '10mb', extended: true },
            rawBody: true,
          },
        }
      },
    }),
  ],
  exports: [],
})
export class AuthModule {}
