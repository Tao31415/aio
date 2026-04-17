import { betterAuth } from 'better-auth'
import {
  multiSession,
  bearer,
  admin as adminPlugin,
  createAccessControl,
  username,
  openAPI,
} from 'better-auth/plugins'
import { Redis } from 'ioredis'
import { redisStorage } from '@better-auth/redis-storage'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'
import { Pool } from 'pg'

export const statement = {
  ...defaultStatements,
  project: ['create', 'share', 'update', 'delete'], // <-- Permissions available for created roles
} as const
export const ac = createAccessControl(statement)
export const user = ac.newRole({
  project: ['create'],
})
export const admin = ac.newRole({
  project: ['create', 'update'],
  ...adminAc.statements,
})
export const myCustomRole = ac.newRole({
  project: ['create', 'update', 'delete'],
  user: ['ban'],
})

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  // password: process.env.REDIS_PASSWORD,
})

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'aio',
})

export const auth = betterAuth({
  database: pool,

  basePath: process.env.BETTER_AUTH_BASE_PATH || '/api/v1/auth',
  // disabledPaths: ['/sign-up/email', '/sign-in/email'],
  secondaryStorage: redisStorage({
    client: redis,
    keyPrefix: 'better-auth:', // 可选，默认 "better-auth:"
  }),

  // Trusted origins for CORS (UI runs on port 40000)
  trustedOrigins: [
    'http://localhost:40000',
    'http://127.0.0.1:40000',
    process.env.UI_URL || 'http://localhost:40000',
  ],

  // ==================== PLUGINS ====================
  plugins: [
    multiSession({
      maximumSessions: 10, // Max 10 sessions per device
    }),
    openAPI(),
    bearer(),
    adminPlugin({
      ac: ac,
      roles: {
        admin,
        user,
        myCustomRole,
      },
    }),
    username({
      usernameValidator: (_) => {
        // if (name === 'admin') {
        //   return false
        // }
        return true
      },
    }),
  ],

  // ==================== EMAIL & PASSWORD ====================
  emailAndPassword: {
    enabled: true,
  },

  // ==================== SESSION MANAGEMENT ====================
  session: {
    // Session expires after 7 days
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    // Update session expiration every day when used
    updateAge: 60 * 60 * 24, // 1 day in seconds
    // Session is considered fresh for 5 minutes (for sensitive operations)
    freshAge: 60 * 5, // 5 minutes in seconds

    // Cookie caching for better performance (reduces database calls)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
      strategy: 'compact', // Most efficient for API usage
      refreshCache: false,
    },
  },

  // ==================== RATE LIMITING ====================
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds time window
    max: 100, // max 100 requests per window
    // Store rate limit data in database for persistence
    storage: 'secondary-storage',
    modelName: 'rateLimit',
  },

  // ==================== ADVANCED CONFIGURATION ====================
  advanced: {
    // Cookie configuration for API usage
    cookiePrefix: 'aio',
    // Always use secure cookies in production
    useSecureCookies: process.env.NODE_ENV === 'production',
    // IP address configuration for rate limiting
    ipAddress: {
      // Use x-forwarded-for header (common in production behind proxies)
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
      // Rate limit IPv6 by /64 subnet to prevent bypass attacks
      ipv6Subnet: 64,
    },
  },
})

export type Auth = typeof auth
