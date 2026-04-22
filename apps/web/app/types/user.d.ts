import type { AvatarProps } from '@nuxt/ui'
import { createAuthClient } from 'better-auth/client'
import {
  adminClient,
  usernameClient,
  multiSessionClient,
} from 'better-auth/client/plugins'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export interface AdminUser {
  id: string
  username: string
  displayUsername: string | null
  role: 'admin' | 'user'
  banned: boolean
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
}

export type AuthClient = ReturnType<typeof createAuthClient<typeof _typeConfig>>
export type Session = AuthClient['$Infer']['Session']['session']
export type User = AuthClient['$Infer']['Session']['user']

// need improve
const _typeConfig = {
  baseURL: '',
  basePath: '',
  appName: 'aio',
  logger: {
    disabled: false,
    disableColors: false,
    level: 'debug',
    log: (level: any, message: any, ...args: any) => {
      // Custom logging implementation
      console.log(`[${level}] ${message}`, ...args)
    },
  },
  session: {
    storageKey: 'better-auth-session',
    fetchDataOnMount: true,
  },
  fetchOptions: {
    credentials: 'include' as const,
  },
  plugins: [adminClient(), usernameClient(), multiSessionClient()],
}
