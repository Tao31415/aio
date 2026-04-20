import type { RouteLocationRaw } from 'vue-router'
import { useAuthStatus } from './auth/useAuthStatus'
import { useAuthActions } from './auth/useAuthActions'
import { ensureSession, getAuthClient } from './auth/session-manager'

export interface SignOutOptions {
  redirectTo?: RouteLocationRaw
  redirect?: boolean
}

export interface FetchSessionOptions {
  force?: boolean
}

export const useAuth = () => {
  const client = getAuthClient()
  const status = useAuthStatus()
  const actions = useAuthActions()

  const fetchSession = async (options: FetchSessionOptions = {}) => {
    const { force = false } = options
    return ensureSession({ force, reason: 'useAuth.fetchSession' })
  }

  return {
    ...status,
    ...actions,
    errorCodes: client.$ERROR_CODES,
    fetchSession,
    client,
  }
}
