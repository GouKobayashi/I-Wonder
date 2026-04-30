import { ImageResponse } from 'next/og'

import { SocialImage } from '@/lib/social-image'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'Artists list preview image'
export const contentType = 'image/png'
export const runtime = 'edge'

export default function TwitterImage() {
  return new ImageResponse(
    <SocialImage
      eyebrow="Artists"
      title="I Wonder"
      subtitle="I Wonderに掲載されているアーティスト一覧です。"
    />,
    size,
  )
}
