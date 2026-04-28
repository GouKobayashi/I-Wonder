import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'

import { AlbumCard } from '@/components/AlbumCard'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ExternalLinkButtons } from '@/components/ExternalLinkButtons'
import { PageShell } from '@/components/PageShell'
import { SongCard } from '@/components/SongCard'
import { XShareButton } from '@/components/XShareButton'
import {
  getPublishedAlbumsByArtistId,
  getPublishedArtistBySlug,
  getPublishedSongsByArtistId,
} from '@/lib/music-catalog'

import styles from '@/components/catalog-ui.module.css'

type RouteParams = {
  artistSlug: string
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { artistSlug } = await params
  const artist = await getPublishedArtistBySlug(artistSlug)

  if (!artist) {
    return {
      title: 'Not Found',
    }
  }

  const description =
    artist.bio_short ??
    `Artist page for ${artist.name} on I Wonder, a music database for lyrics, background, and context.`

  return {
    title: artist.name,
    description,
    alternates: {
      canonical: `/artists/${artist.slug}`,
    },
    openGraph: {
      title: artist.name,
      description,
      type: 'website',
    },
  }
}

function buildArtistLinks(artistName: string) {
  const query = encodeURIComponent(artistName)

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

export default async function ArtistPage({ params }: { params: Promise<RouteParams> }) {
  const { artistSlug } = await params

  const artist = await getPublishedArtistBySlug(artistSlug)
  if (!artist) {
    notFound()
  }

  const albums = await getPublishedAlbumsByArtistId(artist.id)
  const highlightSongs = await getPublishedSongsByArtistId(artist.id, 20)

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={`${styles.heroFeature} ${styles.artistHeroLayout}`}>
          <div className={`${styles.heroBody} ${styles.artistHeroBody}`}>
            <Breadcrumb
              items={[
                { href: '/', label: 'Home' },
                { label: artist.name },
              ]}
            />
            <div className={`${styles.heroCopy} ${styles.artistHeroCopy}`}>
              <p className={styles.heroKicker}>Artist</p>
              <h1 className={`${styles.heroTitle} ${styles.artistHeroTitle}`}>{artist.name}</h1>
            </div>
          </div>

          <div className={`${styles.heroMediaColumn} ${styles.artistHeroMediaColumn}`}>
            <div className={styles.artistHeroFrame}>
              {artist.artist_image_url ? (
                <Image
                  className={styles.artistHeroImage}
                  src={artist.artist_image_url}
                  alt={artist.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : (
                <div className={styles.heroImageFallback}>{artist.name.slice(0, 1)}</div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <ExternalLinkButtons links={buildArtistLinks(artist.name)} />
          <XShareButton title={artist.name} urlPath={`/artists/${artist.slug}`} />
        </div>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Albums</h2>
          </div>

          {albums.length > 0 ? (
            <div className={styles.cardGrid}>
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  artistSlug={artist.slug}
                  artistName={artist.name}
                  album={album}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>公開済みアルバムはまだありません。</div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Songs</h2>
          </div>

          {highlightSongs.length > 0 ? (
            <div className={styles.cardGrid}>
              {highlightSongs.map(({ song, album }) => (
                <SongCard
                  key={song.id}
                  href={`/artists/${artist.slug}/albums/${album.slug}/songs/${song.slug}`}
                  title={song.title}
                  albumTitle={album.title}
                  trackNumber={song.track_number}
                  discNumber={song.disc_number}
                  showTrackInfo={false}
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
