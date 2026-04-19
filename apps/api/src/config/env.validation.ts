import { z } from 'zod'

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['local', 'development', 'production', 'test']),
  PORT: z.coerce.number().int().min(1).max(65535),

  // PostgreSQL
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().int(),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('aio'),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().int(),
  REDIS_PASSWORD: z.string(),

  // MinIO (S3 Compatible)
  MINIO_ENDPOINT: z.string(),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET: z.string().default('default'),

  // MQTT
  MQTT_BROKER_URL: z.string(),

  // CORS
  CORS_ORIGIN: z
    .string()
    .default('')
    .describe('允许的浏览器 Origin，多个值用逗号分隔'),

  // Better Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'Secret must be at least 32 characters'),
  BETTER_AUTH_BASE_PATH: z.string().default('/api/v1/auth'),
  BETTER_AUTH_URL: z.string().default(''),
})

export const validationEnv = (): Env => {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(z.treeifyError(parsed.error))
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

export type Env = z.infer<typeof envSchema>
