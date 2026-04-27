import Link from 'next/link'

import { formatTrackPosition } from '@/lib/music-catalog'

import styles from './catalog-ui.module.css'

type SongCardProps = {
  href: string
  title: string
  albumTitle?: string
  trackNumber: number | null
  discNumber: number | null
  showDisc?: boolean
  bodyPreview?: string | null
  isCurrent?: boolean
}

export function SongCard({
  href,
  title,
  albumTitle,
  trackNumber,
  discNumber,
  showDisc = false,
  bodyPreview,
  isCurrent = false,
}: SongCardProps) {
  const className = isCurrent
    ? `${styles.songCard} ${styles.songCardCurrent}`
    : styles.songCard

  return (
    <Link className={className} href={href}>
      <div className={styles.cardBody}>
        <p className={styles.cardEyebrow}>
          {showDisc ? formatTrackPosition(trackNumber, discNumber) : `Track ${trackNumber ?? '-'}`}
        </p>
        <h3 className={styles.cardTitle}>{title}</h3>
        {albumTitle ? <p className={styles.cardSubtitle}>{albumTitle}</p> : null}
        {bodyPreview ? <p className={styles.cardSubtitle}>{bodyPreview}</p> : null}
      </div>
    </Link>
  )
}
