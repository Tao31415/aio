import type { UserWithRole } from 'better-auth/client/plugins'
import type { UserProfile, User } from '~/types'

function assertIsUserWithRole(value: unknown): asserts value is UserWithRole {
  if (!value || typeof value !== 'object') {
    throw new TypeError('Expected UserWithRole to be an object')
  }
  const obj = value as Record<string, unknown>
  if (typeof obj.id !== 'string') {
    throw new TypeError('UserWithRole must have string id')
  }
  if (typeof obj.role !== 'string') {
    throw new TypeError('UserWithRole must have string role')
  }
}

function assertIsUser(value: unknown): asserts value is User {
  if (!value || typeof value !== 'object') {
    throw new TypeError('Expected User to be an object')
  }
  const obj = value as Record<string, unknown>
  if (typeof obj.id !== 'string') {
    throw new TypeError('User must have string id')
  }
}

function safeString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function safeNullString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function safeBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false
}

function safeDateString(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value).toISOString()
  }
  return new Date().toISOString()
}

function safeStringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
    ? value
    : []
}

export function userWithRoleToUserProfile(raw: UserWithRole): UserProfile {
  assertIsUserWithRole(raw)
  const ext = raw as unknown as Record<string, unknown>
  return {
    id: raw.id,
    username: safeString(ext.username),
    displayUsername: safeNullString(ext.name),
    role: raw.role as 'admin' | 'user',
    banned: safeBoolean(raw.banned),
    permissions: safeStringArray(ext.permissions),
    createdAt: safeDateString(raw.createdAt),
    updatedAt: safeDateString(raw.updatedAt),
  }
}

export function userToUserProfile(raw: User): UserProfile {
  assertIsUser(raw)
  const ext = raw as unknown as Record<string, unknown>
  return {
    id: raw.id,
    username: safeString(ext.username),
    displayUsername: safeNullString(ext.displayUsername),
    role: safeString(ext.role) as 'admin' | 'user',
    banned: safeBoolean(ext.banned),
    permissions: safeStringArray(ext.permissions),
    createdAt: safeDateString(raw.createdAt),
    updatedAt: safeDateString(raw.updatedAt),
  }
}

export function safeUserToUserProfile(raw: User): UserProfile | null {
  try {
    return userToUserProfile(raw)
  } catch {
    return null
  }
}

export function safeUserWithRoleToUserProfile(
  raw: UserWithRole | null
): UserProfile | null {
  if (!raw) {
    return null
  }
  try {
    return userWithRoleToUserProfile(raw)
  } catch {
    return null
  }
}

export function userListToUserProfileList(
  rawList: UserWithRole[]
): UserProfile[] {
  return rawList
    .map((user) => safeUserWithRoleToUserProfile(user))
    .filter((user): user is UserProfile => user !== null)
}
