import Image from 'next/image'
import Link from 'next/link'

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
}

export function AlbumCard({ artistSlug, artistName, album }: AlbumCardProps) {
  const href = `/artists/${artistSlug}/albums/${album.slug}`

  return (
    <Link className={styles.albumCard} href={href}>
      <div className={styles.albumCover}>
        {album.cover_image_url ? (
          <Image
            className={styles.albumCoverImage}
            src={album.cover_image_url}
            alt={album.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1400px) 33vw, 280px"
          />
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
