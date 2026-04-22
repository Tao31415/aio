import { getAuthClient } from '../auth/session-manager'
import type { AdminUser } from '~/types'

export interface ListUsersOptions {
  searchValue?: string
  searchField?: 'email' | 'name'
  searchOperator?: 'contains' | 'starts_with' | 'ends_with'
  limit?: number
  offset?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  filterField?: string
  filterValue?: string | number | boolean | string[] | number[]
  filterOperator?:
    | 'eq'
    | 'ne'
    | 'lt'
    | 'lte'
    | 'gt'
    | 'gte'
    | 'in'
    | 'not_in'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
}

export interface ListUsersResult {
  users: AdminUser[]
  total: number
  limit?: number
  offset?: number
}

export interface CreateUserOptions {
  email: string
  password: string
  name: string
  username: string
  role?: 'admin' | 'user'
  data?: Record<string, unknown>
}

export interface UpdateUserOptions {
  userId: string
  data: {
    displayUsername?: string
    name?: string
    image?: string
    [key: string]: unknown
  }
}

export interface SetUserPasswordOptions {
  userId: string
  newPassword: string
}

export interface SetUserRoleOptions {
  userId: string
  role: 'admin' | 'user'
}

export interface BanUserOptions {
  userId: string
  banReason?: string
  banExpiresIn?: number
}

export const useAuthAdmin = () => {
  const client = getAuthClient()

  async function listUsers(
    options: ListUsersOptions = {}
  ): Promise<ListUsersResult> {
    const result = await client.admin.listUsers({
      query: {
        searchValue: options.searchValue,
        searchField: options.searchField,
        searchOperator: options.searchOperator,
        limit: options.limit,
        offset: options.offset,
        sortBy: options.sortBy,
        sortDirection: options.sortDirection,
        filterField: options.filterField,
        filterValue: options.filterValue,
        filterOperator: options.filterOperator,
      },
    })
    return result as unknown as ListUsersResult
  }

  async function getUser(userId: string): Promise<AdminUser | null> {
    const result = await client.admin.getUser({
      query: { id: userId },
    })
    return (result as { data: AdminUser | null }).data
  }

  async function createUser(options: CreateUserOptions): Promise<AdminUser> {
    const result = await client.admin.createUser({
      email: options.email,
      password: options.password,
      name: options.name,
      role: options.role,
      data: {
        username: options.username,
        ...options.data,
      }
    })
    return result as unknown as AdminUser
  }

  async function updateUser(options: UpdateUserOptions): Promise<AdminUser> {
    const result = await client.admin.updateUser({
      userId: options.userId,
      data: options.data,
    })
    return result as unknown as AdminUser
  }

  async function setUserPassword(
    options: SetUserPasswordOptions
  ): Promise<void> {
    await client.admin.setUserPassword({
      newPassword: options.newPassword,
      userId: options.userId,
    })
  }

  async function setUserRole(options: SetUserRoleOptions): Promise<void> {
    await client.admin.setRole({
      userId: options.userId,
      role: options.role,
    })
  }

  async function banUser(options: BanUserOptions): Promise<void> {
    await client.admin.banUser({
      userId: options.userId,
      banReason: options.banReason,
      banExpiresIn: options.banExpiresIn,
    })
  }

  async function unbanUser(userId: string): Promise<void> {
    await client.admin.unbanUser({
      userId,
    })
  }

  async function deleteUser(userId: string): Promise<void> {
    await client.admin.removeUser({
      userId,
    })
  }

  async function listUserSessions(userId: string): Promise<unknown[]> {
    const result = await client.admin.listUserSessions({
      userId,
    })
    return result as unknown as unknown[]
  }

  async function revokeUserSession(sessionToken: string): Promise<void> {
    await client.admin.revokeUserSession({
      sessionToken,
    })
  }

  async function revokeAllUserSessions(userId: string): Promise<void> {
    await client.admin.revokeUserSessions({
      userId,
    })
  }

  return {
    client,
    listUsers,
    getUser,
    createUser,
    updateUser,
    setUserPassword,
    setUserRole,
    banUser,
    unbanUser,
    deleteUser,
    listUserSessions,
    revokeUserSession,
    revokeAllUserSessions,
  }
}
