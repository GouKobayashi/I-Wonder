'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { randomUUID } from 'node:crypto'

import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
  isAdminConfigured,
  verifyAdminPassword,
} from '@/lib/admin-auth'
import {
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  formatAdminLoginLockoutMessage,
  getAdminLoginRateLimitKey,
  recordAdminLoginFailure,
} from '@/lib/admin-login-rate-limit'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import type { FormState } from '@/app/admin/form-state'

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function getOptionalStringValue(formData: FormData, key: string) {
  const value = getStringValue(formData, key)
  return value.length > 0 ? value : null
}

function getBooleanValue(formData: FormData, key: string) {
  return formData.get(key) === 'on'
}

function getOptionalIntegerValue(formData: FormData, key: string) {
  const value = getStringValue(formData, key)

  if (!value) {
    return { value: null as number | null }
  }

  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return { error: '1以上の整数を入力してください。' }
  }

  return { value: parsed }
}

function getOptionalFileValue(formData: FormData, key: string) {
  const value = formData.get(key)

  if (!(value instanceof File) || value.size === 0) {
    return { value: null as File | null }
  }

  if (!value.type.startsWith('image/')) {
    return { error: '画像ファイルを選択してください。' }
  }

  if (value.type === 'image/svg+xml') {
    return { error: 'SVG はアップロードできません。PNG, JPEG, WebP, GIF, AVIF を選択してください。' }
  }

  const maxSizeInBytes = 10 * 1024 * 1024
  if (value.size > maxSizeInBytes) {
    return { error: '画像サイズは 10MB 以下にしてください。' }
  }

  return { value }
}

function getOptionalDateValue(formData: FormData, key: string) {
  const value = getStringValue(formData, key)

  if (!value) {
    return { value: null as string | null }
  }

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(value)

  if (!isValidDate) {
    return { error: '日付は YYYY-MM-DD 形式で入力してください。' }
  }

  return { value }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function getUnauthorizedState(): FormState {
  return {
    status: 'error',
    message: '管理者セッションが無効です。ログインし直してください。',
  }
}

function getConfigurationState(): FormState {
  return {
    status: 'error',
    message: 'ADMIN_PASSWORD が未設定です。.env.local に追加してください。',
  }
}

async function getAdminLoginRequestKey() {
  const headerList = await headers()
  const forwardedFor = headerList.get('x-forwarded-for')
  const clientIp = forwardedFor?.split(',')[0]?.trim() ?? headerList.get('x-real-ip')
  const userAgent = headerList.get('user-agent')

  return getAdminLoginRateLimitKey(clientIp, userAgent)
}

function normalizeSupabaseErrorMessage(message: string) {
  return message || 'Supabase でエラーが発生しました。'
}

function getArtistImageBucketName() {
  return process.env.SUPABASE_ARTIST_IMAGE_BUCKET || 'artist-images'
}

function getAlbumImageBucketName() {
  return process.env.SUPABASE_ALBUM_IMAGE_BUCKET || 'album-images'
}

function revalidatePublicCatalogBasePaths() {
  revalidatePath('/')
  revalidatePath('/artists')
  revalidatePath('/albums')
}

async function uploadArtistImage(file: File, artistSlug: string) {
  const supabase = getSupabaseAdmin()
  const bucket = getArtistImageBucketName()
  const fileExtension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : null
  const safeExtension = fileExtension && /^[a-z0-9]+$/.test(fileExtension) ? fileExtension : 'bin'
  const filePath = `${artistSlug}/${randomUUID()}.${safeExtension}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
    contentType: file.type,
    upsert: false,
  })

  if (uploadError) {
    return { error: normalizeSupabaseErrorMessage(uploadError.message) }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return { publicUrl }
}

async function uploadAlbumImage(file: File, artistSlug: string, albumSlug: string) {
  const supabase = getSupabaseAdmin()
  const bucket = getAlbumImageBucketName()
  const fileExtension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : null
  const safeExtension = fileExtension && /^[a-z0-9]+$/.test(fileExtension) ? fileExtension : 'bin'
  const filePath = `${artistSlug}/${albumSlug}/${randomUUID()}.${safeExtension}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
    contentType: file.type,
    upsert: false,
  })

  if (uploadError) {
    return { error: normalizeSupabaseErrorMessage(uploadError.message) }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return { publicUrl }
}

export async function loginAdmin(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isAdminConfigured()) {
    return getConfigurationState()
  }

  const loginKey = await getAdminLoginRequestKey()
  const rateLimitState = checkAdminLoginRateLimit(loginKey)

  if (!rateLimitState.allowed) {
    return {
      status: 'error',
      message: formatAdminLoginLockoutMessage(rateLimitState.retryAfterMs),
    }
  }

  const password = getStringValue(formData, 'password')

  if (!password) {
    return {
      status: 'error',
      fieldErrors: {
        password: 'パスワードを入力してください。',
      },
    }
  }

  if (!(await verifyAdminPassword(password))) {
    const lockoutState = recordAdminLoginFailure(loginKey)

    return {
      status: 'error',
      message: lockoutState.isLockedOut
        ? formatAdminLoginLockoutMessage(Math.max(0, lockoutState.blockedUntil - Date.now()))
        : 'パスワードが違います。',
    }
  }

  clearAdminLoginFailures(loginKey)
  await createAdminSession()
  redirect('/admin')
}

export async function logoutAdmin() {
  await clearAdminSession()
  redirect('/admin/login')
}

export async function createArtist(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAdminAuthenticated())) {
    return getUnauthorizedState()
  }

  const slug = getStringValue(formData, 'slug')
  const name = getStringValue(formData, 'name')
  const artistImage = getOptionalFileValue(formData, 'artist_image')
  const bioShort = getOptionalStringValue(formData, 'bio_short')
  const country = getOptionalStringValue(formData, 'country')
  const published = getBooleanValue(formData, 'published')

  const fieldErrors: Record<string, string> = {}

  if (!slug) {
    fieldErrors.slug = 'slug は必須です。'
  }

  if (!name) {
    fieldErrors.name = 'name は必須です。'
  }

  if (artistImage.error) {
    fieldErrors.artist_image = artistImage.error
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
    }
  }

  let artistImageUrl: string | null = null

  if (artistImage.value) {
    const uploadResult = await uploadArtistImage(artistImage.value, slug)
    if ('error' in uploadResult) {
      return {
        status: 'error',
        message: uploadResult.error,
      }
    }
    artistImageUrl = uploadResult.publicUrl
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('artists')
    .insert({
      slug,
      name,
      artist_image_url: artistImageUrl,
      bio_short: bioShort,
      country,
      published,
    })
    .select('id, slug, name')
    .single()

  if (error) {
    return {
      status: 'error',
      message: normalizeSupabaseErrorMessage(error.message),
    }
  }

  revalidatePath('/admin/albums/new')
  revalidatePath('/debug/supabase')
  revalidatePublicCatalogBasePaths()

  return {
    status: 'success',
    message: `artist "${data.name}" を作成しました。`,
    createdId: data.id,
  }
}

export async function createAlbum(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAdminAuthenticated())) {
    return getUnauthorizedState()
  }

  const primaryArtistId = getStringValue(formData, 'primary_artist_id')
  const slug = getStringValue(formData, 'slug')
  const title = getStringValue(formData, 'title')
  const releaseDate = getOptionalDateValue(formData, 'release_date')
  const albumDescription = getOptionalStringValue(formData, 'album_description')
  const coverImage = getOptionalFileValue(formData, 'cover_image')
  const published = getBooleanValue(formData, 'published')

  const fieldErrors: Record<string, string> = {}

  if (!isUuid(primaryArtistId)) {
    fieldErrors.primary_artist_id = 'artist を選択してください。'
  }

  if (!slug) {
    fieldErrors.slug = 'slug は必須です。'
  }

  if (!title) {
    fieldErrors.title = 'title は必須です。'
  }

  if (releaseDate.error) {
    fieldErrors.release_date = releaseDate.error
  }

  if (coverImage.error) {
    fieldErrors.cover_image = coverImage.error
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
    }
  }

  const supabase = getSupabaseAdmin()
  const { data: artistRecord, error: artistLookupError } = await supabase
    .from('artists')
    .select('slug')
    .eq('id', primaryArtistId)
    .maybeSingle<{ slug: string }>()

  if (artistLookupError) {
    return {
      status: 'error',
      message: normalizeSupabaseErrorMessage(artistLookupError.message),
    }
  }

  if (!artistRecord) {
    return {
      status: 'error',
      fieldErrors: {
        primary_artist_id: 'artist を選択してください。',
      },
    }
  }

  let coverImageUrl: string | null = null

  if (coverImage.value) {
    const uploadResult = await uploadAlbumImage(coverImage.value, artistRecord.slug, slug)
    if ('error' in uploadResult) {
      return {
        status: 'error',
        message: uploadResult.error,
      }
    }
    coverImageUrl = uploadResult.publicUrl
  }

  const { data, error } = await supabase
    .from('albums')
    .insert({
      primary_artist_id: primaryArtistId,
      slug,
      title,
      release_date: releaseDate.value,
      album_description: albumDescription,
      cover_image_url: coverImageUrl,
      published,
    })
    .select('id, slug, title')
    .single()

  if (error) {
    return {
      status: 'error',
      message: normalizeSupabaseErrorMessage(error.message),
    }
  }

  revalidatePath('/admin/songs/new')
  revalidatePath('/debug/supabase')
  revalidatePublicCatalogBasePaths()
  revalidatePath(`/artists/${artistRecord.slug}`)
  revalidatePath(`/artists/${artistRecord.slug}/albums/${slug}`)

  return {
    status: 'success',
    message: `album "${data.title}" を作成しました。`,
    createdId: data.id,
  }
}

export async function createSong(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAdminAuthenticated())) {
    return getUnauthorizedState()
  }

  const primaryAlbumId = getStringValue(formData, 'primary_album_id')
  const slug = getStringValue(formData, 'slug')
  const title = getStringValue(formData, 'title')
  const releaseDate = getOptionalDateValue(formData, 'release_date')
  const trackNumber = getOptionalIntegerValue(formData, 'track_number')
  const discNumber = getOptionalIntegerValue(formData, 'disc_number')
  const bodyExplanation = getOptionalStringValue(formData, 'body_explanation')
  const hasSamples = getBooleanValue(formData, 'has_samples')
  const published = getBooleanValue(formData, 'published')

  const fieldErrors: Record<string, string> = {}

  if (!isUuid(primaryAlbumId)) {
    fieldErrors.primary_album_id = 'album を選択してください。'
  }

  if (!slug) {
    fieldErrors.slug = 'slug は必須です。'
  }

  if (!title) {
    fieldErrors.title = 'title は必須です。'
  }

  if (releaseDate.error) {
    fieldErrors.release_date = releaseDate.error
  }

  if (trackNumber.error) {
    fieldErrors.track_number = trackNumber.error
  }

  if (discNumber.error) {
    fieldErrors.disc_number = discNumber.error
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
    }
  }

  const supabase = getSupabaseAdmin()
  const { data: albumContext, error: albumContextError } = await supabase
    .from('albums')
    .select('slug, release_date, primary_artist_id')
    .eq('id', primaryAlbumId)
    .maybeSingle<{ slug: string; release_date: string | null; primary_artist_id: string }>()

  if (albumContextError) {
    return {
      status: 'error',
      message: normalizeSupabaseErrorMessage(albumContextError.message),
    }
  }

  if (!albumContext) {
    return {
      status: 'error',
      fieldErrors: {
        primary_album_id: 'album を選択してください。',
      },
    }
  }

  const resolvedReleaseDate = releaseDate.value ?? albumContext.release_date

  const { data, error } = await supabase
    .from('songs')
    .insert({
      primary_album_id: primaryAlbumId,
      slug,
      title,
      release_date: resolvedReleaseDate,
      track_number: trackNumber.value,
      disc_number: discNumber.value,
      body_explanation: bodyExplanation,
      has_samples: hasSamples,
      published,
    })
    .select('id, slug, title')
    .single()

  if (error) {
    return {
      status: 'error',
      message: normalizeSupabaseErrorMessage(error.message),
    }
  }

  revalidatePath('/debug/supabase')
  revalidatePublicCatalogBasePaths()

  const { data: artistRecord, error: artistLookupError } = await supabase
    .from('artists')
    .select('slug')
    .eq('id', albumContext.primary_artist_id)
    .maybeSingle<{ slug: string }>()

  if (!artistLookupError && artistRecord) {
    revalidatePath(`/artists/${artistRecord.slug}`)
    revalidatePath(`/artists/${artistRecord.slug}/albums/${albumContext.slug}`)
    revalidatePath(`/artists/${artistRecord.slug}/albums/${albumContext.slug}/songs/${slug}`)
  }

  return {
    status: 'success',
    message: `song "${data.title}" を作成しました。`,
    createdId: data.id,
  }
}
