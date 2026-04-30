import type { Metadata } from 'next'

import { ArtistCard } from '@/components/ArtistCard'
import { PageShell } from '@/components/PageShell'
import styles from '@/components/catalog-ui.module.css'
import { getPublishedArtists } from '@/lib/music-catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'アーティスト',
  description: 'I Wonderに掲載されているアーティスト一覧です。',
}

export default async function ArtistsPage() {
  const artists = await getPublishedArtists()

  return (
    <PageShell>
      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>アーティスト</h1>
          </div>

          {artists.length > 0 ? (
            <div className={styles.cardGrid}>
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>まだ公開されているアーティストはありません。</div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
