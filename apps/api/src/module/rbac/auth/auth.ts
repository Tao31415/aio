import {
  multiSession,
  bearer,
  admin as adminPlugin,
  createAccessControl,
  username,
  openAPI,
} from 'better-auth/plugins'
import type { Redis } from 'ioredis'
import { redisStorage } from '@better-auth/redis-storage'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'
import { BetterAuthOptions } from 'better-auth'
import type { Pool } from 'pg'

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

export interface AuthOptions {
  pool: Pool
  redis: Redis
  baseURL: string
  basePath: string
  isProduction: boolean
  trustedOrigins: string[]
}

export const createAuthOptions = (opts: AuthOptions): BetterAuthOptions => {
  return {
    database: opts.pool,
    // disabledPaths: ["/sign-up/email", "/sign-in/email"],
    // logger: {
    //   disabled: false,
    //   disableColors: false,
    //   level: 'debug',
    //   log: (level, message, ...args) => {
    //     // Custom logging implementation
    //     console.log(`[${level}] ${message}`, ...args)
    //   },
    // },
    baseURL: opts.baseURL,
    basePath: opts.basePath,
    // disabledPaths: ['/sign-up/email', '/sign-in/email'],
    secondaryStorage: redisStorage({
      client: opts.redis,
      keyPrefix: 'better-auth:', // 可选，默认 "better-auth:"
    }),

    // Reuse the same browser origin allowlist as Nest CORS.
    trustedOrigins: opts.trustedOrigins,

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
      useSecureCookies: opts.isProduction,
      // IP address configuration for rate limiting
      ipAddress: {
        // Use x-forwarded-for header (common in production behind proxies)
        ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
        // Rate limit IPv6 by /64 subnet to prevent bypass attacks
        ipv6Subnet: 64,
      },
    },
  }
}
