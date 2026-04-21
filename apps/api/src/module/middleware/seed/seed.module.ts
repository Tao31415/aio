import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@auth/entities/user.entity'
import { AuthModule } from '@auth/auth.module'
import { SeedController } from './seed.controller'
import { SeedService } from './seed.service'

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
