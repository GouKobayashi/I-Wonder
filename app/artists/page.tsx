import type { Metadata } from 'next'

import { ArtistCard } from '@/components/ArtistCard'
import { PageShell } from '@/components/PageShell'
import styles from '@/components/catalog-ui.module.css'
import { getPublishedArtists } from '@/lib/music-catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Artists',
  description: 'Browse all published artists in I Wonder.',
}

export default async function ArtistsPage() {
  const artists = await getPublishedArtists()

  return (
    <PageShell>
      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>Artists</h1>
          </div>

          {artists.length > 0 ? (
            <div className={styles.cardGrid}>
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>公開済みのアーティストはまだありません。</div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
