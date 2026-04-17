import { Logger, Module } from '@nestjs/common'
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth'
import { TypeOrmModule } from '@nestjs/typeorm'
import { auth } from './auth'
import { User, Account, Verification } from './entities'
import type { NextFunction, Request, Response } from 'express'

const logger = new Logger('AuthModule')
const authRouteWhitelist = ['sign-in', 'sign-out', 'get-session']
const authBasePath = auth.options.basePath ?? '/api/v1/auth'

@Module({
  imports: [
    BetterAuthModule.forRoot({
      auth,
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
          res.status(403).json({ message: '该接口已被禁用' })
          return
        }

        next()
      },
      bodyParser: {
        json: { limit: '10mb' },
        urlencoded: { limit: '10mb', extended: true },
        rawBody: true,
      },
    }),
    TypeOrmModule.forFeature([User, Account, Verification]),
  ],
  controllers: [],
})
export class AuthModule {}
