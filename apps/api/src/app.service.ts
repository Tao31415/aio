import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return `Environment: ${process.env.NODE_ENV}`
  }
}
