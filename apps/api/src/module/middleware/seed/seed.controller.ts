import { Controller, Post } from '@nestjs/common'
import { SeedService } from './seed.service'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

@Controller('seed')
@AllowAnonymous()
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  createTables() {
    return this.seedService.createTables()
  }
}
