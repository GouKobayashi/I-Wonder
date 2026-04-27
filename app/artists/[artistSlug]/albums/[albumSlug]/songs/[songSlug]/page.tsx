import Link from 'next/link'
import { notFound } from 'next/navigation'

import { supabase } from '@/utils/supabase'

import styles from './page.module.css'

type RouteParams = {
  artistSlug: string
  albumSlug: string
  songSlug: string
}

type ArtistRecord = {
  id: string
  slug: string
  name: string
  published: boolean
}

type AlbumRecord = {
  id: string
  slug: string
  title: string
  primary_artist_id: string
  published: boolean
}

type SongRecord = {
  id: string
  slug: string
  title: string
  release_date: string | null
  track_number: number | null
  disc_number: number | null
  body_explanation: string | null
  primary_album_id: string
  published: boolean
}

type AlbumSongListItem = {
  id: string
  slug: string
  title: string
  disc_number: number | null
  track_number: number | null
}

export const dynamic = 'force-dynamic'

function formatReleaseDate(value: string | null) {
  if (!value) {
    return '未設定'
  }

  return value
}

function formatTrackPosition(trackNumber: number | null, discNumber: number | null) {
  const disc = discNumber ?? '-'
  const track = trackNumber ?? '-'

  return `Disc ${disc} / Track ${track}`
}

async function getArtistBySlug(artistSlug: string) {
  const result = await supabase
    .from('artists')
    .select('id, slug, name, published')
    .eq('slug', artistSlug)
    .eq('published', true)
    .maybeSingle<ArtistRecord>()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

async function getAlbumBySlug(albumSlug: string, artistId: string) {
  const result = await supabase
    .from('albums')
    .select('id, slug, title, primary_artist_id, published')
    .eq('slug', albumSlug)
    .eq('primary_artist_id', artistId)
    .eq('published', true)
    .maybeSingle<AlbumRecord>()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

async function getSongBySlug(songSlug: string, albumId: string) {
  const result = await supabase
    .from('songs')
    .select(
      'id, slug, title, release_date, track_number, disc_number, body_explanation, primary_album_id, published',
    )
    .eq('slug', songSlug)
    .eq('primary_album_id', albumId)
    .eq('published', true)
    .maybeSingle<SongRecord>()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

async function getAlbumSongs(albumId: string) {
  const result = await supabase
    .from('songs')
    .select('id, slug, title, disc_number, track_number')
    .eq('primary_album_id', albumId)
    .eq('published', true)
    .order('disc_number', { ascending: true, nullsFirst: true })
    .order('track_number', { ascending: true, nullsFirst: true })
    .order('title', { ascending: true })
    .returns<AlbumSongListItem[]>()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

export default async function SongDetailPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { artistSlug, albumSlug, songSlug } = await params

  const artist = await getArtistBySlug(artistSlug)
  if (!artist) {
    notFound()
  }

  const album = await getAlbumBySlug(albumSlug, artist.id)
  if (!album) {
    notFound()
  }

  const song = await getSongBySlug(songSlug, album.id)
  if (!song) {
    notFound()
  }

  const albumSongs = await getAlbumSongs(album.id)

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.stack}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link> /{' '}
            <span>{artist.slug}</span> / <span>{album.slug}</span> / <span>{song.slug}</span>
          </nav>

          <section className={styles.hero}>
            <p className={styles.artist}>{artist.name}</p>
            <h1 className={styles.title}>{song.title}</h1>
            <div className={styles.meta}>
              <span>Artist: {artist.name}</span>
              <span>Album: {album.title}</span>
              <span>Release: {formatReleaseDate(song.release_date)}</span>
              <span>{formatTrackPosition(song.track_number, song.disc_number)}</span>
            </div>
          </section>

          <div className={styles.content}>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>本文</h2>
              <p className={styles.bodyText}>{song.body_explanation || '未設定'}</p>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>同じアルバムの曲</h2>
              <div className={styles.trackList}>
                {albumSongs.map((albumSong) => {
                  const isCurrentSong = albumSong.id === song.id

                  return (
                    <Link
                      key={albumSong.id}
                      href={`/artists/${artist.slug}/albums/${album.slug}/songs/${albumSong.slug}`}
                      className={`${styles.trackItem} ${isCurrentSong ? styles.trackItemCurrent : ''}`.trim()}
                    >
                      <span className={styles.trackLabel}>
                        {formatTrackPosition(albumSong.track_number, albumSong.disc_number)}
                      </span>
                      <span className={styles.trackTitle}>{albumSong.title}</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
