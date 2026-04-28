import { unstable_cache } from 'next/cache'
import { cache } from 'react'

import { supabase } from '@/utils/supabase'

export type ArtistRecord = {
  id: string
  slug: string
  name: string
  artist_image_url: string | null
  bio_short: string | null
  country: string | null
  published: boolean
}

export type AlbumRecord = {
  id: string
  slug: string
  title: string
  release_date: string | null
  cover_image_url: string | null
  primary_artist_id: string
  published: boolean
}

export type SongRecord = {
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

const CATALOG_REVALIDATE_SECONDS = 300

async function fetchPublishedArtistBySlug(artistSlug: string) {
  const result = await supabase
    .from('artists')
    .select('id, slug, name, artist_image_url, bio_short, country, published')
    .eq('slug', artistSlug)
    .eq('published', true)
    .maybeSingle<ArtistRecord>()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

async function fetchPublishedArtists() {
  const result = await supabase
    .from('artists')
    .select('id, slug, name, artist_image_url, bio_short, country, published')
    .eq('published', true)
    .order('name', { ascending: true })
    .returns<ArtistRecord[]>()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

async function fetchPublishedAlbumBySlug(albumSlug: string, artistId: string) {
  const result = await supabase
    .from('albums')
    .select('id, slug, title, release_date, cover_image_url, primary_artist_id, published')
    .eq('slug', albumSlug)
    .eq('primary_artist_id', artistId)
    .eq('published', true)
    .maybeSingle<AlbumRecord>()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

async function fetchPublishedAlbumsByArtistId(artistId: string) {
  const result = await supabase
    .from('albums')
    .select('id, slug, title, release_date, cover_image_url, primary_artist_id, published')
    .eq('primary_artist_id', artistId)
    .eq('published', true)
    .order('release_date', { ascending: false, nullsFirst: false })
    .order('title', { ascending: true })
    .returns<AlbumRecord[]>()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

async function fetchPublishedAlbums() {
  const result = await supabase
    .from('albums')
    .select('id, slug, title, release_date, cover_image_url, primary_artist_id, published')
    .eq('published', true)
    .order('release_date', { ascending: false, nullsFirst: false })
    .order('title', { ascending: true })
    .returns<AlbumRecord[]>()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

async function fetchPublishedSongBySlug(songSlug: string, albumId: string) {
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

async function fetchPublishedSongsByAlbumId(albumId: string) {
  const result = await supabase
    .from('songs')
    .select(
      'id, slug, title, release_date, track_number, disc_number, body_explanation, primary_album_id, published',
    )
    .eq('primary_album_id', albumId)
    .eq('published', true)
    .order('disc_number', { ascending: true, nullsFirst: true })
    .order('track_number', { ascending: true, nullsFirst: true })
    .order('title', { ascending: true })
    .returns<SongRecord[]>()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result.data
}

async function fetchPublishedSongsByArtistId(artistId: string, limit = 20) {
  const albumsResult = await supabase
    .from('albums')
    .select('id, slug, title, primary_artist_id, published')
    .eq('primary_artist_id', artistId)
    .eq('published', true)
    .returns<Array<Pick<AlbumRecord, 'id' | 'slug' | 'title' | 'primary_artist_id' | 'published'>>>()

  if (albumsResult.error) {
    throw new Error(albumsResult.error.message)
  }

  const albumIds = albumsResult.data.map((album) => album.id)

  if (albumIds.length === 0) {
    return []
  }

  const songsResult = await supabase
    .from('songs')
    .select(
      'id, slug, title, release_date, track_number, disc_number, body_explanation, primary_album_id, published',
    )
    .in('primary_album_id', albumIds)
    .eq('published', true)
    .order('release_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<SongRecord[]>()

  if (songsResult.error) {
    throw new Error(songsResult.error.message)
  }

  const albumById = new Map(albumsResult.data.map((album) => [album.id, album]))

  return songsResult.data
    .map((song) => {
      const album = albumById.get(song.primary_album_id)
      if (!album) {
        return null
      }

      return {
        song,
        album,
      }
    })
    .filter(
      (
        item,
      ): item is {
        song: SongRecord
        album: Pick<AlbumRecord, 'id' | 'slug' | 'title' | 'primary_artist_id' | 'published'>
      } => item !== null,
    )
}

const getPublishedArtistBySlugCached = unstable_cache(
  async (artistSlug: string) => fetchPublishedArtistBySlug(artistSlug),
  ['published-artist-by-slug'],
  { revalidate: CATALOG_REVALIDATE_SECONDS },
)

const getPublishedArtistsCached = unstable_cache(async () => fetchPublishedArtists(), ['published-artists'], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
})

const getPublishedAlbumBySlugCached = unstable_cache(
  async (albumSlug: string, artistId: string) => fetchPublishedAlbumBySlug(albumSlug, artistId),
  ['published-album-by-slug'],
  { revalidate: CATALOG_REVALIDATE_SECONDS },
)

const getPublishedAlbumsByArtistIdCached = unstable_cache(
  async (artistId: string) => fetchPublishedAlbumsByArtistId(artistId),
  ['published-albums-by-artist-id'],
  { revalidate: CATALOG_REVALIDATE_SECONDS },
)

const getPublishedAlbumsCached = unstable_cache(async () => fetchPublishedAlbums(), ['published-albums'], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
})

const getPublishedSongBySlugCached = unstable_cache(
  async (songSlug: string, albumId: string) => fetchPublishedSongBySlug(songSlug, albumId),
  ['published-song-by-slug'],
  { revalidate: CATALOG_REVALIDATE_SECONDS },
)

const getPublishedSongsByAlbumIdCached = unstable_cache(
  async (albumId: string) => fetchPublishedSongsByAlbumId(albumId),
  ['published-songs-by-album-id'],
  { revalidate: CATALOG_REVALIDATE_SECONDS },
)

const getPublishedSongsByArtistIdCached = unstable_cache(
  async (artistId: string, limit: number) => fetchPublishedSongsByArtistId(artistId, limit),
  ['published-songs-by-artist-id'],
  { revalidate: CATALOG_REVALIDATE_SECONDS },
)

export const getPublishedArtistBySlug = cache(async (artistSlug: string) =>
  getPublishedArtistBySlugCached(artistSlug),
)

export const getPublishedArtists = cache(async () => getPublishedArtistsCached())

export const getPublishedAlbumBySlug = cache(async (albumSlug: string, artistId: string) =>
  getPublishedAlbumBySlugCached(albumSlug, artistId),
)

export const getPublishedAlbumsByArtistId = cache(async (artistId: string) =>
  getPublishedAlbumsByArtistIdCached(artistId),
)

export const getPublishedAlbums = cache(async () => getPublishedAlbumsCached())

export const getPublishedSongBySlug = cache(async (songSlug: string, albumId: string) =>
  getPublishedSongBySlugCached(songSlug, albumId),
)

export const getPublishedSongsByAlbumId = cache(async (albumId: string) =>
  getPublishedSongsByAlbumIdCached(albumId),
)

export const getPublishedSongsByArtistId = cache(async (artistId: string, limit = 20) =>
  getPublishedSongsByArtistIdCached(artistId, limit),
)

export function formatReleaseDate(value: string | null) {
  if (!value) {
    return 'Release TBD'
  }

  return value
}

export function formatTrackPosition(trackNumber: number | null, discNumber: number | null) {
  const disc = discNumber ?? '-'
  const track = trackNumber ?? '-'

  return `Disc ${disc} / Track ${track}`
}

export function getArtistDisplayLabel(artist: Pick<ArtistRecord, 'slug' | 'name'>) {
  return artist.name
}
