import { ArtistCard } from '@/components/ArtistCard'
import { PageShell } from '@/components/PageShell'
import { getPublishedArtists } from '@/lib/music-catalog'

import styles from '@/components/catalog-ui.module.css'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const artists = await getPublishedArtists()

  return (
    <PageShell>
      <section className={styles.homeHero}>
        <div className={styles.homeHeroBody}>
          <h1 className={styles.homeHeroTitle}>I Wonderへようこそ</h1>
          <p className={styles.homeHeroLead}>
            I Wonderは、外国圏の音楽を歌詞、バックグラウンド、コンテキストから読み解くための楽曲データベースです。
          </p>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Artists</h2>
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
