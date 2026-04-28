import Image from 'next/image'
import Link from 'next/link'

import styles from './catalog-ui.module.css'

type ArtistCardProps = {
  artist: {
    slug: string
    name: string
    artist_image_url: string | null
  }
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const href = `/artists/${artist.slug}`

  return (
    <Link className={styles.albumCard} href={href}>
      <div className={styles.albumCover}>
        {artist.artist_image_url ? (
          <Image
            className={styles.albumCoverImage}
            src={artist.artist_image_url}
            alt={artist.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1400px) 33vw, 280px"
          />
        ) : (
          <div className={styles.albumCoverFallback}>{artist.name.slice(0, 1)}</div>
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{artist.name}</h3>
      </div>
    </Link>
  )
}
