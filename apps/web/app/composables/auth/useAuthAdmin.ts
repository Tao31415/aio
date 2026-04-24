import { getAuthClient } from '../auth/session-manager'
import type { UserProfile } from '~/types'
import {
  safeUserWithRoleToUserProfile,
  userListToUserProfileList,
} from '~/utils/transform'

const logger = useLogger('auth.admin')

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
  users: UserProfile[]
  total: number
  limit?: number
  offset?: number
}

export interface CreateUserOptions {
  password: string
  name: string
  username: string
  role?: 'admin' | 'user'
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
    try {
      const query = {
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
      }

      logger.debug({ query }, 'listUsers params')
      const { data, error } = await client.admin.listUsers({ query })

      if (error) {
        logger.error({ err: error }, 'Failed to list users')
        return { users: [], total: 0 }
      }

      const users = userListToUserProfileList(data.users)
      const total = data.total
      logger.info({ total }, 'Users listed successfully')
      return { users, total }
    } catch (err) {
      logger.error({ err }, 'Failed to list users')
      throw err
    }
  }

  async function getUser(userId: string): Promise<UserProfile | null> {
    try {
      const params = { query: { id: userId } }
      logger.debug({ params }, 'getUser params')
      const { data, error } = await client.admin.getUser(params)

      if (error) {
        logger.error({ err: error, userId }, 'Failed to get user')
        return null
      }

      if (!data) {
        logger.warn({ userId }, 'User not found')
        return null
      }

      const user = safeUserWithRoleToUserProfile(data)
      logger.info({ userId }, 'User retrieved successfully')
      return user
    } catch (err) {
      logger.error({ err, userId }, 'Failed to get user')
      throw err
    }
  }

  async function createUser(
    options: CreateUserOptions
  ): Promise<UserProfile | null> {
    try {
      const email = `${crypto.randomUUID()}@aio.com`
      const params = {
        email,
        password: options.password,
        name: options.name,
        role: options.role,
        data: { username: options.username },
      }

      logger.debug({ params }, 'createUser params')
      const { data, error } = await client.admin.createUser(params)

      if (error) {
        logger.error(
          { err: error, username: options.username },
          'Failed to create user'
        )
        return null
      }

      if (!data) {
        logger.error(
          { username: options.username },
          'Failed to create user: no data returned'
        )
        return null
      }

      const user = safeUserWithRoleToUserProfile(data.user)
      if (!user) {
        logger.error(
          { username: options.username },
          'Failed to create user: invalid data'
        )
        return null
      }

      logger.info(
        { userId: user.id, username: options.username },
        'User created successfully'
      )
      return user
    } catch (err) {
      logger.error({ err, username: options.username }, 'Failed to create user')
      throw err
    }
  }

  async function updateUser(
    options: UpdateUserOptions
  ): Promise<UserProfile | null> {
    try {
      const params = {
        userId: options.userId,
        data: options.data,
      }

      logger.debug({ params }, 'updateUser params')
      const { data, error } = await client.admin.updateUser(params)

      if (error) {
        logger.error(
          { err: error, userId: options.userId },
          'Failed to update user'
        )
        return null
      }

      if (!data) {
        logger.error(
          { userId: options.userId },
          'Failed to update user: no data returned'
        )
        return null
      }

      const user = safeUserWithRoleToUserProfile(data)
      if (!user) {
        logger.error(
          { userId: options.userId },
          'Failed to update user: invalid data'
        )
        return null
      }

      logger.info({ userId: options.userId }, 'User updated successfully')
      return user
    } catch (err) {
      logger.error({ err, userId: options.userId }, 'Failed to update user')
      throw err
    }
  }

  async function setUserPassword(
    options: SetUserPasswordOptions
  ): Promise<boolean> {
    try {
      const params = {
        newPassword: options.newPassword,
        userId: options.userId,
      }

      logger.debug({ params }, 'setUserPassword params')
      const { data, error } = await client.admin.setUserPassword(params)
      if (error) {
        logger.error(
          { err: error, userId: options.userId },
          'Failed to set user password'
        )
        return false
      }

      if (data.status) {
        logger.info(
          { userId: options.userId },
          'User password set successfully'
        )
      }
      return data.status
    } catch (err) {
      logger.error(
        { err, userId: options.userId },
        'Failed to set user password'
      )
      throw err
    }
  }

  async function setUserRole(options: SetUserRoleOptions): Promise<boolean> {
    try {
      const params = {
        userId: options.userId,
        role: options.role,
      }

      logger.debug({ params }, 'setUserRole params')
      const { data, error } = await client.admin.setRole(params)

      if (error) {
        logger.error(
          { err: error, userId: options.userId },
          'Failed to set user password'
        )
        return false
      }

      if (data.user) {
        logger.info(
          { userId: options.userId, role: options.role },
          'User role set successfully'
        )
      }
      return data.user !== null
    } catch (err) {
      logger.error(
        { err, userId: options.userId, role: options.role },
        'Failed to set user role'
      )
      throw err
    }
  }

  async function banUser(options: BanUserOptions): Promise<boolean> {
    try {
      const params = {
        userId: options.userId,
        banReason: options.banReason,
        banExpiresIn: options.banExpiresIn,
      }

      logger.debug({ params }, 'banUser params')
      const { data, error } = await client.admin.banUser(params)

      if (error) {
        logger.error(
          { err: error, userId: options.userId },
          'Failed to ban user'
        )
        return false
      }

      if (data.user) {
        logger.info(
          { userId: options.userId, banReason: options.banReason },
          'User banned successfully'
        )
      }
      return data.user !== null
    } catch (err) {
      logger.error({ err, userId: options.userId }, 'Failed to ban user')
      throw err
    }
  }

  async function unbanUser(userId: string): Promise<boolean> {
    try {
      const params = { userId }

      logger.debug({ params }, 'unbanUser params')
      const { data, error } = await client.admin.unbanUser(params)

      if (error) {
        logger.error({ err: error, userId: userId }, 'Failed to unban user')
        return false
      }

      if (data.user) {
        logger.info({ userId }, 'User unbanned successfully')
      }
      return data.user !== null
    } catch (err) {
      logger.error({ err, userId }, 'Failed to unban user')
      throw err
    }
  }

  async function deleteUser(userId: string): Promise<boolean> {
    try {
      const params = { userId }

      logger.debug({ params }, 'deleteUser params')
      const { data, error } = await client.admin.removeUser(params)

      if (error) {
        logger.error({ err: error, userId: userId }, 'Failed to delete user')
        return false
      }

      if (data.success) {
        logger.info({ userId }, 'User deleted successfully')
      }
      return data.success
    } catch (err) {
      logger.error({ err, userId }, 'Failed to delete user')
      throw err
    }
  }

  return {
    listUsers,
    getUser,
    createUser,
    updateUser,
    setUserPassword,
    setUserRole,
    banUser,
    unbanUser,
    deleteUser,
  }
}
