import type { AuthClient, Session, User } from '~/types'

interface EnsureSessionOptions {
  force?: boolean
  reason?: string
  client?: AuthClient
}

interface EnsureSessionResult {
  status: ReturnType<typeof useAuthStore>['status']
  session: Session | null
  user: User | null
  error?: unknown
}

let inFlight: Promise<EnsureSessionResult> | null = null

const AUTH_ERROR_CODES = new Set(['UNAUTHORIZED', 'FORBIDDEN'])

function getErrorRecord(error: unknown): Record<string, unknown> | null {
  if (!error || typeof error !== 'object') {
    return null
  }

  return error as Record<string, unknown>
}

function getErrorStatus(error: unknown): number | undefined {
  const record = getErrorRecord(error)
  if (!record) {
    return undefined
  }

  const status =
    typeof record.status === 'number'
      ? record.status
      : typeof record.statusCode === 'number'
        ? record.statusCode
        : undefined

  return status
}

function getErrorCode(error: unknown): string | undefined {
  const record = getErrorRecord(error)
  return typeof record?.code === 'string'
    ? record.code.toUpperCase()
    : undefined
}

function getErrorMessage(error: unknown): string {
  const record = getErrorRecord(error)
  if (typeof record?.message === 'string' && record.message.trim()) {
    return record.message
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return '获取会话失败'
}

function isAuthFailure(error: unknown): boolean {
  const status = getErrorStatus(error)
  const code = getErrorCode(error)
  const message = getErrorMessage(error)

  if (status === 401 || status === 403) {
    return true
  }

  if (code && AUTH_ERROR_CODES.has(code)) {
    return true
  }

  return /unauthorized|forbidden|invalid session|session not found/i.test(
    message
  )
}

export function getAuthClient(client?: AuthClient): AuthClient {
  if (client) {
    return client
  }

  const { $auth } = useNuxtApp()
  if (!$auth) {
    throw new Error(
      'Auth client not initialized. Please ensure auth plugin is loaded.'
    )
  }

  return $auth
}

function getCurrentState(
  store: ReturnType<typeof useAuthStore>
): EnsureSessionResult {
  return {
    status: store.status,
    session: store.session,
    user: store.user,
  }
}

export async function ensureSession(
  options: EnsureSessionOptions = {}
): Promise<EnsureSessionResult> {
  const { force = false, reason = 'unknown', client } = options
  const authClient = getAuthClient(client)
  const store = useAuthStore()
  const logger = useLogger('auth.session')

  if (inFlight) {
    logger.debug({ reason }, 'auth.ensureSession joined in-flight request')
    return inFlight
  }

  if (store.isReady && !force) {
    logger.debug(
      { reason, status: store.status },
      'auth.ensureSession reused store'
    )
    return getCurrentState(store)
  }

  const previousStatus = store.status

  inFlight = (async () => {
    store.setLoading(reason)
    logger.debug(
      { force, reason, previousStatus },
      'auth.ensureSession started'
    )

    try {
      const { data, error } = await authClient.getSession()

      if (error) {
        const authFailure = isAuthFailure(error)
        logger.warn(
          { authFailure, error, reason },
          'auth.ensureSession returned an error'
        )

        if (authFailure || !store.isReady) {
          store.setUnauthenticated(`ensure-session:${reason}`)
        }

        if (!authFailure) {
          store.setError(getErrorMessage(error))
        } else {
          store.clearError()
        }

        return {
          ...getCurrentState(store),
          error,
        }
      }

      store.clearError()
      store.setSession({ session: data?.session, user: data?.user })
      return getCurrentState(store)
    } catch (error) {
      logger.error({ error, reason }, 'auth.ensureSession exception')
      store.setError(getErrorMessage(error))

      if (!store.isReady) {
        store.setUnauthenticated(`ensure-session-exception:${reason}`)
      }

      return {
        ...getCurrentState(store),
        error,
      }
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}
