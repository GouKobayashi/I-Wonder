import { ArtistCard } from '@/components/ArtistCard'
import { PageShell } from '@/components/PageShell'
import { getPublishedArtists } from '@/lib/music-catalog'
import { SITE_DESCRIPTION } from '@/lib/metadata'
import type { Metadata } from 'next'

import styles from '@/components/catalog-ui.module.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
}

export default async function HomePage() {
  const artists = await getPublishedArtists()

  return (
    <PageShell>
      <section className={styles.homeHero}>
        <div className={styles.homeHeroBody}>
          <h1 className={styles.homeHeroTitle}>I Wonder</h1>
          <p className={styles.homeHeroLead}>
            海外の音楽を、歌詞・背景・文脈から読み解くためのデータベースです。
          </p>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>アーティスト</h2>
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
