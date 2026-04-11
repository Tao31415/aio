import { Injectable } from '@nestjs/common'
import { fn } from '@aio/utils'

@Injectable()
export class AppService {
  getHello(): string {
    return `Environment: ${process.env.NODE_ENV} ${fn()})`
  }
}
