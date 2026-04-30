import { ImageResponse } from 'next/og'

import { SocialImage } from '@/lib/social-image'

export const size = {
  width: 1200,
  height: 630,
}

export const alt = 'Albums list preview image'
export const contentType = 'image/png'
export const runtime = 'edge'

export default function TwitterImage() {
  return new ImageResponse(
    <SocialImage
      eyebrow="Albums"
      title="I Wonder"
      subtitle="I Wonderに掲載されているアルバム一覧です。"
    />,
    size,
  )
}
