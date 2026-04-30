export const SITE_DESCRIPTION =
  'I Wonderは、海外の音楽を歌詞・背景・文脈から読み解くためのデータベースです。'

export function buildOpenGraphImage(imageUrl?: string | null, alt = 'I Wonder') {
  return [{ url: imageUrl ?? '/opengraph-image', alt }]
}

export function buildTwitterImage(imageUrl?: string | null, alt = 'I Wonder') {
  return [{ url: imageUrl ?? '/twitter-image', alt }]
}
