import { ImageResponse } from 'next/og'

import { SocialImage } from '@/lib/social-image'
import { getPublishedArtistBySlug } from '@/lib/music-catalog'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'Artist preview image'
export const contentType = 'image/png'
export const runtime = 'edge'

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ artistSlug: string }>
}) {
  const { artistSlug } = await params
  const artist = await getPublishedArtistBySlug(artistSlug)

  if (!artist) {
    return new ImageResponse(
      <SocialImage
        eyebrow="Artists"
        title="I Wonder"
        subtitle="Music database for lyrics, background, and context"
      />,
      size,
    )
  }

  return new ImageResponse(
    <SocialImage
      eyebrow="Artist"
      title={artist.name}
      subtitle={artist.bio_short ?? 'I Wonderで歌詞・背景・文脈から読み解きます。'}
    />,
    size,
  )
}
