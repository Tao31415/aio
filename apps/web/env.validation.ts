import { z } from 'zod'

/**
 * 环境变量校验 Schema
 * 重要：这些环境变量必须在编译/运行时提供，否则应用将报错
 */
const envSchema = z.object({
  // API 基础 URL（必填）
  NUXT_PUBLIC_API_BASE: z
    .string()
    .min(1, 'NUXT_PUBLIC_API_BASE is required')
    .describe('API 基础 URL，如 http://localhost:30000'),

  // Better Auth 基础路径（必填）
  BETTER_AUTH_BASE_PATH: z
    .string()
    .min(1, 'BETTER_AUTH_BASE_PATH is required')
    .default('/api/v1/auth')
    .describe('Better Auth 基础路径，如 /api/v1/auth'),

  // 环境
  NUXT_PUBLIC_ENV: z
    .enum(['local', 'development', 'production', 'test'])
    .describe('运行环境'),

  // 日志级别
  NUXT_PUBLIC_LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info')
    .describe('日志级别'),

  // Web 端口
  PORT: z.coerce
    .number()
    .min(1)
    .max(65535)
    .default(40000)
    .describe('Web 服务端口'),

  // 启用 Mock 数据
  NUXT_PUBLIC_MOCK: z.coerce
    .boolean()
    .default(false)
    .describe('是否启用 Mock 数据'),

  // 启用注册功能
  NUXT_PUBLIC_ENABLE_REGISTRATION: z.coerce
    .boolean()
    .default(false)
    .describe('是否启用用户注册'),

  // 演示账号邮箱
  NUXT_PUBLIC_DEMO_USERNAME: z
    .string()
    .min(2)
    .default('admin')
    .describe('演示账号'),

  // 演示账号密码
  NUXT_PUBLIC_DEMO_PASSWORD: z
    .string()
    .min(1)
    .default('123456')
    .describe('演示账号密码'),

  // 显示演示提示
  NUXT_PUBLIC_SHOW_DEMO_HINT: z.coerce
    .boolean()
    .default(true)
    .describe('是否显示演示账号提示'),

  // 应用标题
  NUXT_PUBLIC_APP_TITLE: z.string().default('Admin Pro').describe('应用标题'),

  // 品牌名称
  NUXT_PUBLIC_BRAND_NAME: z.string().default('Halolight').describe('品牌名称'),

  // Google Analytics ID
  NUXT_PUBLIC_GA_ID: z.string().default('').describe('Google Analytics ID'),
})

/**
 * 校验环境变量并返回结果
 * 如果校验失败，会抛出错误导致应用无法启动
 */
export function validateEnv(): EnvSchema {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const errors = z.treeifyError(result.error)
    console.error('环境变量校验失败 / Environment Validation Failed')
    console.error(errors)
    throw new Error(`Environment validation failed:\n${result.error}`)
  }
  console.info('[Env] Environment validation passed')
  return result.data
}

export type EnvSchema = z.infer<typeof envSchema>
