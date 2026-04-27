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
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.albumCoverImage} src={artist.artist_image_url} alt={artist.name} />
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
