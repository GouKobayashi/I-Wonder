import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/Breadcrumb'
import { ExternalLinkButtons } from '@/components/ExternalLinkButtons'
import { PageShell } from '@/components/PageShell'
import { SongCard } from '@/components/SongCard'
import { XShareButton } from '@/components/XShareButton'
import {
  getPublishedAlbumBySlug,
  getPublishedArtistBySlug,
  getPublishedSongsByAlbumId,
} from '@/lib/music-catalog'
import { buildOpenGraphImage, buildTwitterImage } from '@/lib/metadata'

import styles from '@/components/catalog-ui.module.css'

type RouteParams = {
  artistSlug: string
  albumSlug: string
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { artistSlug, albumSlug } = await params

  const artist = await getPublishedArtistBySlug(artistSlug)
  if (!artist) {
    return {
      title: 'Not Found',
    }
  }

  const album = await getPublishedAlbumBySlug(albumSlug, artist.id)
  if (!album) {
    return {
      title: 'Not Found',
    }
  }

  const description = `『${album.title}』は${artist.name}のアルバムです。I Wonderで歌詞・背景・文脈から読み解きます。`

  return {
    title: `${album.title} by ${artist.name}`,
    description,
    alternates: {
      canonical: `/artists/${artist.slug}/albums/${album.slug}`,
    },
    openGraph: {
      title: `${album.title} by ${artist.name}`,
      description,
      type: 'website',
      images: buildOpenGraphImage(album.cover_image_url, album.title),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${album.title} by ${artist.name}`,
      description,
      images: buildTwitterImage(album.cover_image_url, album.title),
    },
  }
}

function buildAlbumLinks(artistName: string, albumTitle: string) {
  const query = encodeURIComponent(`${artistName} ${albumTitle}`)

  return [
    {
      href: `https://open.spotify.com/search/${query}`,
      label: 'Spotify',
    },
    {
      href: `https://music.apple.com/jp/search?term=${query}`,
      label: 'Apple Music',
    },
    {
      href: `https://www.youtube.com/results?search_query=${query}`,
      label: 'YouTube',
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
        <div className={`${styles.heroFeature} ${styles.artistHeroLayout}`}>
          <div className={`${styles.heroBody} ${styles.artistHeroBody}`}>
            <Breadcrumb
              items={[
                { href: '/', label: 'ホーム' },
                { href: `/artists/${artist.slug}`, label: artist.name },
                { label: album.title },
              ]}
            />
            <div className={`${styles.heroCopy} ${styles.artistHeroCopy}`}>
              <p className={styles.albumHeroArtistName}>{artist.name}</p>
              <h1 className={`${styles.heroTitle} ${styles.artistHeroTitle}`}>{album.title}</h1>
            </div>
          </div>

          <div className={`${styles.heroMediaColumn} ${styles.artistHeroMediaColumn}`}>
            <div className={styles.albumHeroFrame}>
              {album.cover_image_url ? (
                <Image
                  className={styles.albumHeroImage}
                  src={album.cover_image_url}
                  alt={album.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : (
                <div className={styles.heroImageFallback}>{album.title}</div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <ExternalLinkButtons links={buildAlbumLinks(artist.name, album.title)} />
          <XShareButton title={album.title} urlPath={`/artists/${artist.slug}/albums/${album.slug}`} />
        </div>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>楽曲</h2>
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
            <div className={styles.emptyState}>まだ公開されている楽曲はありません。</div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
