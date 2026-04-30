import { ImageResponse } from 'next/og'

import { SocialImage } from '@/lib/social-image'
import { getPublishedAlbumBySlug, getPublishedArtistBySlug } from '@/lib/music-catalog'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'Album preview image'
export const contentType = 'image/png'
export const runtime = 'edge'

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ artistSlug: string; albumSlug: string }>
}) {
  const { artistSlug, albumSlug } = await params
  const artist = await getPublishedArtistBySlug(artistSlug)

  if (!artist) {
    return new ImageResponse(
      <SocialImage
        eyebrow="Albums"
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
        eyebrow="Albums"
        title={artist.name}
        subtitle="I Wonderで歌詞・背景・文脈から読み解きます。"
      />,
      size,
    )
  }

  return new ImageResponse(
    <SocialImage
      eyebrow="Album"
      title={album.title}
      subtitle={`${artist.name}のアルバムです。`}
    />,
    size,
  )
}
