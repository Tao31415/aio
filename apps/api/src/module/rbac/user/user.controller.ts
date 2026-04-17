import { Controller, Get } from '@nestjs/common'
import {
  AllowAnonymous,
  Session,
  OptionalAuth,
} from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'

@Controller('users')
export class UserController {
  @Get('me')
  getProfile(@Session() session: UserSession) {
    return session
  }

  @Get('public')
  @AllowAnonymous() // Allow anonymous access (no authentication required)
  publicRoute() {
    return { message: 'This route is public' }
  }

  @Get('optional')
  @OptionalAuth() // Authentication is optional for this route
  optionalRoute(@Session() session: UserSession) {
    return { authenticated: !!session, session }
  }
}
