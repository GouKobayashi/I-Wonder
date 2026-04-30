import type { Metadata } from 'next'

import { AlbumCard } from '@/components/AlbumCard'
import { PageShell } from '@/components/PageShell'
import styles from '@/components/catalog-ui.module.css'
import { getPublishedAlbums, getPublishedArtists } from '@/lib/music-catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'アルバム',
  description: 'I Wonderに掲載されているアルバム一覧です。',
}

export default async function AlbumsPage() {
  const [albums, artists] = await Promise.all([getPublishedAlbums(), getPublishedArtists()])
  const artistById = new Map(artists.map((artist) => [artist.id, artist]))

  const albumCards = albums
    .map((album) => {
      const artist = artistById.get(album.primary_artist_id)

      if (!artist) {
        return null
      }

      return {
        album,
        artist,
      }
    })
    .filter(
      (
        item,
      ): item is {
        album: (typeof albums)[number]
        artist: (typeof artists)[number]
      } => item !== null,
    )

  return (
    <PageShell>
      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>アルバム</h1>
          </div>

          {albumCards.length > 0 ? (
            <div className={styles.cardGrid}>
              {albumCards.map(({ album, artist }) => (
                <AlbumCard
                  key={album.id}
                  artistSlug={artist.slug}
                  artistName={artist.name}
                  album={album}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>まだ公開されているアルバムはありません。</div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
