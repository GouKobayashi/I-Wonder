import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_SESSION_COOKIE = 'iw_admin_session'
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? ''
}

export function isAdminConfigured() {
  return getAdminPassword().length > 0
}

function createSessionSignature(payload: string) {
  return createHmac('sha256', getAdminPassword()).update(payload).digest('base64url')
}

function buildSessionValue(expiresAt: number) {
  const payload = Buffer.from(JSON.stringify({ exp: expiresAt })).toString('base64url')
  const signature = createSessionSignature(payload)

  return `${payload}.${signature}`
}

function verifySessionValue(value: string) {
  const [payload, signature] = value.split('.')

  if (!payload || !signature || !isAdminConfigured()) {
    return false
  }

  const expectedSignature = createSessionSignature(payload)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: number
    }

    return typeof decoded.exp === 'number' && decoded.exp > Date.now()
  } catch {
    return false
  }
}

export async function verifyAdminPassword(password: string) {
  const adminPassword = getAdminPassword()

  if (!adminPassword || !password) {
    return false
  }

  const passwordBuffer = Buffer.from(password)
  const adminPasswordBuffer = Buffer.from(adminPassword)

  if (passwordBuffer.length !== adminPasswordBuffer.length) {
    return false
  }

  return timingSafeEqual(passwordBuffer, adminPasswordBuffer)
}

export async function createAdminSession() {
  const cookieStore = await cookies()
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000

  cookieStore.set(ADMIN_SESSION_COOKIE, buildSessionValue(expiresAt), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expiresAt),
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

export async function isAdminAuthenticated() {
  if (!isAdminConfigured()) {
    return false
  }

  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  return session ? verifySessionValue(session) : false
}

export async function requireAdminSession() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }
}
