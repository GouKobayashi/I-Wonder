import { ImageResponse } from 'next/og'

import { SocialImage } from '@/lib/social-image'
import {
  getPublishedAlbumBySlug,
  getPublishedArtistBySlug,
  getPublishedSongBySlug,
} from '@/lib/music-catalog'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'Song preview image'
export const contentType = 'image/png'
export const runtime = 'edge'

export default async function TwitterImage({
  params,
}: {
  params: Promise<{ artistSlug: string; albumSlug: string; songSlug: string }>
}) {
  const { artistSlug, albumSlug, songSlug } = await params
  const artist = await getPublishedArtistBySlug(artistSlug)

  if (!artist) {
    return new ImageResponse(
      <SocialImage
        eyebrow="Songs"
        title="I Wonder"
        subtitle="Music database for lyrics, background, and context"
      />,
      size,
    )
  }

  const album = await getPublishedAlbumBySlug(albumSlug, artist.id)

  if (!album) {
    return new ImageResponse(
      <SocialImage
        eyebrow="Songs"
        title={artist.name}
        subtitle="I Wonderで歌詞・背景・文脈から読み解きます。"
      />,
      size,
    )
  }

  const song = await getPublishedSongBySlug(songSlug, album.id)

  if (!song) {
    return new ImageResponse(
      <SocialImage
        eyebrow="Songs"
        title={album.title}
        subtitle={`${artist.name}のアルバムです。`}
      />,
      size,
    )
  }

  return new ImageResponse(
    <SocialImage
      eyebrow="Song"
      title={song.title}
      subtitle={`${artist.name} / ${album.title}`}
    />,
    size,
  )
}
