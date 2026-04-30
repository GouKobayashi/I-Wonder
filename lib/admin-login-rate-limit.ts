import 'server-only'

type AttemptState = {
  attempts: number[]
  blockedUntil: number
}

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const LOCKOUT_MS = 15 * 60 * 1000

const attemptStore = globalThis as typeof globalThis & {
  __iwAdminLoginAttempts?: Map<string, AttemptState>
}

function getStore() {
  if (!attemptStore.__iwAdminLoginAttempts) {
    attemptStore.__iwAdminLoginAttempts = new Map<string, AttemptState>()
  }

  return attemptStore.__iwAdminLoginAttempts
}

function normalizeHeaderValue(value: string | null | undefined) {
  return value?.trim() || 'unknown'
}

export function getAdminLoginRateLimitKey(ipAddress: string | null | undefined, userAgent: string | null | undefined) {
  return `${normalizeHeaderValue(ipAddress)}|${normalizeHeaderValue(userAgent)}`
}

function pruneAttempts(attempts: number[], now: number) {
  return attempts.filter((timestamp) => now - timestamp <= WINDOW_MS)
}

export function checkAdminLoginRateLimit(key: string) {
  const store = getStore()
  const now = Date.now()
  const state = store.get(key)

  if (!state) {
    return { allowed: true as const }
  }

  const attempts = pruneAttempts(state.attempts, now)

  if (state.blockedUntil > now) {
    return {
      allowed: false as const,
      retryAfterMs: state.blockedUntil - now,
    }
  }

  if (attempts.length >= MAX_ATTEMPTS) {
    const blockedUntil = now + LOCKOUT_MS
    store.set(key, {
      attempts,
      blockedUntil,
    })

    return {
      allowed: false as const,
      retryAfterMs: LOCKOUT_MS,
    }
  }

  if (attempts.length === 0 && state.blockedUntil <= now) {
    store.delete(key)
  } else if (attempts.length !== state.attempts.length) {
    store.set(key, {
      attempts,
      blockedUntil: 0,
    })
  }

  return { allowed: true as const }
}

export function recordAdminLoginFailure(key: string) {
  const store = getStore()
  const now = Date.now()
  const state = store.get(key)
  const attempts = pruneAttempts(state?.attempts ?? [], now)

  attempts.push(now)

  const blockedUntil = attempts.length >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0

  store.set(key, {
    attempts,
    blockedUntil,
  })

  return {
    blockedUntil,
    isLockedOut: blockedUntil > now,
  }
}

export function clearAdminLoginFailures(key: string) {
  getStore().delete(key)
}

export function formatAdminLoginLockoutMessage(retryAfterMs: number) {
  const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterMs / 60000))

  return `試行回数が多すぎます。${retryAfterMinutes} 分ほど待ってから再度お試しください。`
}
