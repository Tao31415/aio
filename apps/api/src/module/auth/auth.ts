/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { betterAuth } from 'better-auth'
import { multiSession } from 'better-auth/plugins'
import { Pool } from 'pg'
import { z } from 'zod'
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'nest_better_auth',
})

export const auth = betterAuth({
  database: pool,

  // Base path for Better Auth routes (must match what NestJS module expects)
  basePath: '/api/auth',

  // Trusted origins for CORS (UI runs on port 3001)
  trustedOrigins: [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    process.env.UI_URL || 'http://localhost:3001',
  ],

  // ==================== PLUGINS ====================
  plugins: [
    multiSession({
      maximumSessions: 5, // Max 5 sessions per device
    }),
  ],

  // ==================== EMAIL & PASSWORD ====================
  emailAndPassword: {
    enabled: true,
    // Require email verification before login
    requireEmailVerification: true,
    // Send password reset email
    sendResetPassword: async ({ user, url, token }, request) => {
      // TODO: Implement your email sending logic here
      console.log(`[Password Reset] To: ${user.email}`)
      console.log(`[Password Reset] URL: ${url}`)
      console.log(`[Password Reset] Token: ${token}`)
      // Example: await sendEmail({ to: user.email, subject: 'Reset your password', text: `Click the link to reset your password: ${url}` });
    },
  },

  // ==================== EMAIL VERIFICATION ====================
  emailVerification: {
    // Send verification email on signup
    sendOnSignUp: true,
    // Send verification email on sign-in if not verified
    sendOnSignIn: true,
    // Auto sign in after email verification
    autoSignInAfterVerification: true,
    // Send verification email function
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // TODO: Implement your email sending logic here
      console.log(`[Email Verification] To: ${user.email}`)
      console.log(`[Email Verification] URL: ${url}`)
      console.log(`[Email Verification] Token: ${token}`)
      // Example: await sendEmail({ to: user.email, subject: 'Verify your email address', text: `Click the link to verify your email: ${url}` });
    },
    // Callback after successful email verification
    afterEmailVerification: async (user, request) => {
      console.log(
        `[Email Verified] ${user.email} has been successfully verified!`
      )
    },
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
    },
  },

  // ==================== RATE LIMITING ====================
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds time window
    max: 100, // max 100 requests per window
    // Store rate limit data in database for persistence
    storage: 'database',
    modelName: 'rateLimit',
    // Custom rules for sensitive endpoints
    customRules: {
      '/sign-in/email': {
        window: 10,
        max: 5, // 5 attempts per 10 seconds
      },
      '/sign-up/email': {
        window: 60,
        max: 3, // 3 sign-ups per minute
      },
      '/forget-password': {
        window: 60,
        max: 3, // 3 password reset requests per minute
      },
      '/verify-email': {
        window: 10,
        max: 5, // 5 verification attempts per 10 seconds
      },
    },
  },

  // ==================== ADVANCED CONFIGURATION ====================
  advanced: {
    // Cookie configuration for API usage
    cookiePrefix: 'nest-auth',
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
