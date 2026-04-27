'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
  isAdminConfigured,
  verifyAdminPassword,
} from '@/lib/admin-auth'
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

function normalizeSupabaseErrorMessage(message: string) {
  return message || 'Supabase でエラーが発生しました。'
}

export async function loginAdmin(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isAdminConfigured()) {
    return getConfigurationState()
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
    return {
      status: 'error',
      message: 'パスワードが違います。',
    }
  }

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

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
    }
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('artists')
    .insert({
      slug,
      name,
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
  const coverImageUrl = getOptionalStringValue(formData, 'cover_image_url')
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

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
    }
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('albums')
    .insert({
      primary_artist_id: primaryArtistId,
      slug,
      title,
      release_date: releaseDate.value,
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
  const { data, error } = await supabase
    .from('songs')
    .insert({
      primary_album_id: primaryAlbumId,
      slug,
      title,
      release_date: releaseDate.value,
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

  return {
    status: 'success',
    message: `song "${data.title}" を作成しました。`,
    createdId: data.id,
  }
}
