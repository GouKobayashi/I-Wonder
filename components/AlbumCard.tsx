import Link from 'next/link'

import { formatReleaseDate } from '@/lib/music-catalog'

import styles from './catalog-ui.module.css'

type AlbumCardProps = {
  artistSlug: string
  artistName: string
  album: {
    slug: string
    title: string
    release_date: string | null
    cover_image_url: string | null
  }
  songCount?: number
  description?: string
}

export function AlbumCard({
  artistSlug,
  artistName,
  album,
  songCount,
  description,
}: AlbumCardProps) {
  const href = `/artists/${artistSlug}/albums/${album.slug}`

  return (
    <Link className={styles.albumCard} href={href}>
      <div className={styles.albumCover}>
        {album.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.albumCoverImage} src={album.cover_image_url} alt={album.title} />
        ) : (
          <div className={styles.albumCoverFallback}>{album.title}</div>
        )}
      </div>

      <div className={styles.cardBody}>
        <p className={styles.cardEyebrow}>{artistName}</p>
        <h3 className={styles.cardTitle}>{album.title}</h3>
      </div>
    </Link>
  )
}
