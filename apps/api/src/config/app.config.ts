import { registerAs } from '@nestjs/config'

const splitOrigins = (value?: string) =>
  (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const getDefaultCorsOrigins = (env: string) =>
  env === 'production'
    ? ['http://localhost', 'http://127.0.0.1']
    : ['http://localhost:40000', 'http://127.0.0.1:40000']

export default registerAs('app', () => {
  const env = process.env.NODE_ENV || 'local'
  const port = process.env.PORT || (env === 'production' ? '3000' : '30000')
  const corsOrigins = splitOrigins(process.env.CORS_ORIGIN)
  const betterAuthUrl =
    process.env.BETTER_AUTH_URL ||
    (env === 'production' ? 'http://localhost' : `http://localhost:${port}`)

  return {
    env,
    betterAuthBasePath: process.env.BETTER_AUTH_BASE_PATH || '/api/v1/auth',
    betterAuthUrl,
    corsOrigins:
      corsOrigins.length > 0 ? corsOrigins : getDefaultCorsOrigins(env),
  }
})
