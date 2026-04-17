import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'local',
  betterAuthBasePath: process.env.BETTER_AUTH_BASE_PATH || '/api/v1/auth',
}))
