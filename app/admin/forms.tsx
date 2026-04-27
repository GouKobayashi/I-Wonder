'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import {
  createAlbum,
  createArtist,
  createSong,
  loginAdmin,
} from '@/app/admin/actions'
import { INITIAL_FORM_STATE, type FormState } from '@/app/admin/form-state'
import styles from '@/app/admin/admin.module.css'

type ArtistOption = {
  id: string
  name: string
  slug: string
}

type AlbumOption = {
  id: string
  title: string
  slug: string
}

function StatusMessage({ state }: { state: FormState }) {
  if (state.status === 'success') {
    return (
      <div className={styles.messageSuccess}>
        <p>{state.message}</p>
        {state.createdId ? <p className={styles.meta}>id: {state.createdId}</p> : null}
      </div>
    )
  }

  if (state.status === 'error' && state.message) {
    return <div className={styles.messageError}>{state.message}</div>
  }

  return null
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button className={styles.button} type="submit" disabled={pending}>
      {pending ? '送信中...' : label}
    </button>
  )
}

function FieldError({
  state,
  name,
}: {
  state: FormState
  name: string
}) {
  const error = state.fieldErrors?.[name]

  if (!error) {
    return null
  }

  return <p className={styles.fieldError}>{error}</p>
}

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action] = useActionState(loginAdmin, INITIAL_FORM_STATE)

  return (
    <form action={action} className={styles.form}>
      {!configured ? (
        <div className={styles.messageError}>
          ADMIN_PASSWORD が未設定です。.env.local に追加してください。
        </div>
      ) : null}

      <StatusMessage state={state} />

      <div className={styles.field}>
        <label htmlFor="password">Admin password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" />
        <FieldError state={state} name="password" />
      </div>

      <div className={styles.actions}>
        <SubmitButton label="ログイン" />
      </div>
    </form>
  )
}

export function ArtistForm() {
  const [state, action] = useActionState(createArtist, INITIAL_FORM_STATE)

  return (
    <form action={action} className={styles.form}>
      <StatusMessage state={state} />

      <div className={styles.field}>
        <label htmlFor="slug">slug</label>
        <input id="slug" name="slug" required />
        <FieldError state={state} name="slug" />
      </div>

      <div className={styles.field}>
        <label htmlFor="name">name</label>
        <input id="name" name="name" required />
        <FieldError state={state} name="name" />
      </div>

      <div className={styles.field}>
        <label htmlFor="artist_image">artist_image</label>
        <input id="artist_image" name="artist_image" type="file" accept="image/*" />
        <div className={styles.fieldHint}>
          <p>画像ファイルをそのままアップロードします。</p>
          <p>保存先は Supabase Storage の `artist-images` バケットです。</p>
        </div>
        <FieldError state={state} name="artist_image" />
      </div>

      <div className={styles.field}>
        <label htmlFor="bio_short">bio_short</label>
        <textarea id="bio_short" name="bio_short" />
      </div>

      <div className={styles.field}>
        <label htmlFor="country">country</label>
        <input id="country" name="country" />
      </div>

      <label className={styles.checkboxRow}>
        <input name="published" type="checkbox" defaultChecked />
        <span>published</span>
      </label>

      <div className={styles.actions}>
        <SubmitButton label="artist を作成" />
        <Link className={styles.secondaryButton} href="/admin">
          管理画面トップ
        </Link>
      </div>
    </form>
  )
}

export function AlbumForm({ artists }: { artists: ArtistOption[] }) {
  const [state, action] = useActionState(createAlbum, INITIAL_FORM_STATE)

  return (
    <form action={action} className={styles.form}>
      <StatusMessage state={state} />

      <div className={styles.field}>
        <label htmlFor="primary_artist_id">primary_artist_id</label>
        <select id="primary_artist_id" name="primary_artist_id" required defaultValue="">
          <option value="" disabled>
            artist を選択してください
          </option>
          {artists.map((artist) => (
            <option key={artist.id} value={artist.id}>
              {artist.name} ({artist.slug})
            </option>
          ))}
        </select>
        <FieldError state={state} name="primary_artist_id" />
      </div>

      <div className={styles.field}>
        <label htmlFor="slug">slug</label>
        <input id="slug" name="slug" required />
        <FieldError state={state} name="slug" />
      </div>

      <div className={styles.field}>
        <label htmlFor="title">title</label>
        <input id="title" name="title" required />
        <FieldError state={state} name="title" />
      </div>

      <div className={styles.field}>
        <label htmlFor="release_date">release_date</label>
        <input id="release_date" name="release_date" type="date" />
        <div className={styles.fieldHint}>
          <p>未入力の場合は album の release_date を使います。</p>
        </div>
        <FieldError state={state} name="release_date" />
      </div>

      <div className={styles.field}>
        <label htmlFor="cover_image">cover_image</label>
        <input id="cover_image" name="cover_image" type="file" accept="image/*" />
        <div className={styles.fieldHint}>
          <p>ジャケット画像をそのままアップロードします。</p>
          <p>保存先は Supabase Storage の `album-images` バケットです。</p>
        </div>
        <FieldError state={state} name="cover_image" />
      </div>

      <label className={styles.checkboxRow}>
        <input name="published" type="checkbox" defaultChecked />
        <span>published</span>
      </label>

      <div className={styles.actions}>
        <SubmitButton label="album を作成" />
        <Link className={styles.secondaryButton} href="/admin/artists/new">
          先に artist を作る
        </Link>
      </div>
    </form>
  )
}

export function SongForm({ albums }: { albums: AlbumOption[] }) {
  const [state, action] = useActionState(createSong, INITIAL_FORM_STATE)

  return (
    <form action={action} className={styles.form}>
      <StatusMessage state={state} />

      <div className={styles.field}>
        <label htmlFor="primary_album_id">primary_album_id</label>
        <select id="primary_album_id" name="primary_album_id" required defaultValue="">
          <option value="" disabled>
            album を選択してください
          </option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              {album.title} ({album.slug})
            </option>
          ))}
        </select>
        <FieldError state={state} name="primary_album_id" />
      </div>

      <div className={styles.field}>
        <label htmlFor="slug">slug</label>
        <input id="slug" name="slug" required />
        <FieldError state={state} name="slug" />
      </div>

      <div className={styles.field}>
        <label htmlFor="title">title</label>
        <input id="title" name="title" required />
        <FieldError state={state} name="title" />
      </div>

      <div className={styles.field}>
        <label htmlFor="release_date">release_date</label>
        <input id="release_date" name="release_date" type="date" />
        <FieldError state={state} name="release_date" />
      </div>

      <div className={styles.field}>
        <label htmlFor="track_number">track_number</label>
        <input id="track_number" name="track_number" type="number" min="1" step="1" />
        <FieldError state={state} name="track_number" />
      </div>

      <div className={styles.field}>
        <label htmlFor="disc_number">disc_number</label>
        <input id="disc_number" name="disc_number" type="number" min="1" step="1" />
        <FieldError state={state} name="disc_number" />
      </div>

      <div className={styles.field}>
        <label htmlFor="body_explanation">body_explanation</label>
        <div className={styles.fieldHint}>
          <p>本文の冒頭2〜4文で、この曲の要点を短く説明してください</p>
          <p>その後に「英語フレーズ → 和訳 → 解説」の形で続けてください</p>
          <p>共通でない要素は原則本文の中で扱ってください</p>
        </div>
        <textarea id="body_explanation" name="body_explanation" />
      </div>

      <label className={styles.checkboxRow}>
        <input name="has_samples" type="checkbox" />
        <span>has_samples</span>
      </label>

      <label className={styles.checkboxRow}>
        <input name="published" type="checkbox" defaultChecked />
        <span>published</span>
      </label>

      <div className={styles.actions}>
        <SubmitButton label="song を作成" />
        <Link className={styles.secondaryButton} href="/admin/albums/new">
          先に album を作る
        </Link>
      </div>
    </form>
  )
}
