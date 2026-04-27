import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/Breadcrumb'
import { ExternalLinkButtons } from '@/components/ExternalLinkButtons'
import { PageShell } from '@/components/PageShell'
import { SongCard } from '@/components/SongCard'
import {
  getPublishedAlbumBySlug,
  getPublishedArtistBySlug,
  getPublishedSongsByAlbumId,
} from '@/lib/music-catalog'

import styles from '@/components/catalog-ui.module.css'

type RouteParams = {
  artistSlug: string
  albumSlug: string
}

export const dynamic = 'force-dynamic'

function buildAlbumLinks(artistName: string, albumTitle: string) {
  const query = encodeURIComponent(`${artistName} ${albumTitle}`)

  return [
    {
      href: `https://open.spotify.com/search/${query}`,
      label: 'Spotify',
    },
    {
      href: `https://music.apple.com/jp/search?term=${query}`,
      label: 'Apple music',
    },
    {
      href: `https://www.youtube.com/results?search_query=${query}`,
      label: 'Youtube',
    },
  ]
}
export default async function AlbumPage({ params }: { params: Promise<RouteParams> }) {
  const { artistSlug, albumSlug } = await params

  const artist = await getPublishedArtistBySlug(artistSlug)
  if (!artist) {
    notFound()
  }

  const album = await getPublishedAlbumBySlug(albumSlug, artist.id)
  if (!album) {
    notFound()
  }

  const songs = await getPublishedSongsByAlbumId(album.id)
  const showDisc = songs.some((song) => (song.disc_number ?? 1) > 1)

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroFeature}>
          <div className={styles.heroBody}>
            <Breadcrumb
              items={[
                { href: '/', label: 'Home' },
                { href: `/artists/${artist.slug}`, label: artist.name },
                { label: album.title },
              ]}
            />
            <div className={styles.heroCopy}>
              <p className={styles.heroKicker}>{artist.name}</p>
              <h1 className={styles.heroTitle}>{album.title}</h1>
            </div>
          </div>

          <div className={styles.heroMediaColumn}>
            <div className={styles.albumHeroFrame}>
              {album.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.albumHeroImage} src={album.cover_image_url} alt={album.title} />
              ) : (
                <div className={styles.heroImageFallback}>{album.title}</div>
              )}
            </div>
          </div>
        </div>
        <ExternalLinkButtons links={buildAlbumLinks(artist.name, album.title)} />
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Songs</h2>
          </div>

          {songs.length > 0 ? (
            <div className={styles.cardGrid}>
              {songs.map((song) => (
                <SongCard
                  key={song.id}
                  href={`/artists/${artist.slug}/albums/${album.slug}/songs/${song.slug}`}
                  title={song.title}
                  trackNumber={song.track_number}
                  discNumber={song.disc_number}
                  showDisc={showDisc}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>公開済み曲はまだありません。</div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
