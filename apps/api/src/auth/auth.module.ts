import { Module } from '@nestjs/common'
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth'
import { TypeOrmModule } from '@nestjs/typeorm'
import { auth } from './auth'
import { User, Account, Session, Verification, RateLimit } from './entities'
import { AuthController } from './auth.controller'

@Module({
  imports: [
    BetterAuthModule.forRoot({ auth }),
    TypeOrmModule.forFeature([User, Account, Session, Verification, RateLimit]),
  ],
  controllers: [AuthController],
  exports: [TypeOrmModule],
})
export class AuthModule {}
