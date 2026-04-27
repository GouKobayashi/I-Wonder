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

export async function getPublishedArtistBySlug(artistSlug: string) {
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

export async function getPublishedArtists() {
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

export async function getPublishedAlbumBySlug(albumSlug: string, artistId: string) {
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

export async function getPublishedAlbumsByArtistId(artistId: string) {
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

export async function getPublishedSongBySlug(songSlug: string, albumId: string) {
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

export async function getPublishedSongsByAlbumId(albumId: string) {
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

export async function getPublishedSongsByArtistId(artistId: string, limit = 20) {
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
    .filter((item): item is { song: SongRecord; album: Pick<AlbumRecord, 'id' | 'slug' | 'title' | 'primary_artist_id' | 'published'> } => item !== null)
}

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
