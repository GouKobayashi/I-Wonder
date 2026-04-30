import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/Breadcrumb'
import { ExternalLinkButtons } from '@/components/ExternalLinkButtons'
import { PageShell } from '@/components/PageShell'
import { SongBody } from '@/components/SongBody'
import { SongCard } from '@/components/SongCard'
import { XShareButton } from '@/components/XShareButton'
import {
  getPublishedAlbumBySlug,
  getPublishedArtistBySlug,
  getPublishedSongBySlug,
  getPublishedSongsByAlbumId,
} from '@/lib/music-catalog'
import { buildOpenGraphImage, buildTwitterImage } from '@/lib/metadata'

import styles from '@/components/catalog-ui.module.css'

type RouteParams = {
  artistSlug: string
  albumSlug: string
  songSlug: string
}

export const dynamic = 'force-dynamic'

function getSongDescription(body: string | null, artistName: string, albumTitle: string, songTitle: string) {
  const lines = body
    ?.split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const fallback = `『${songTitle}』は${artistName}の『${albumTitle}』に収録された楽曲です。I Wonderで歌詞・背景・文脈から読み解きます。`
  const candidate = lines?.find((line) => !line.startsWith('#') && !line.startsWith('>')) ?? fallback

  return candidate.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').slice(0, 160)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { artistSlug, albumSlug, songSlug } = await params

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

  const song = await getPublishedSongBySlug(songSlug, album.id)
  if (!song) {
    return {
      title: 'Not Found',
    }
  }

  const description = getSongDescription(song.body_explanation, artist.name, album.title, song.title)

  return {
    title: `${song.title} by ${artist.name}`,
    description,
    alternates: {
      canonical: `/artists/${artist.slug}/albums/${album.slug}/songs/${song.slug}`,
    },
    openGraph: {
      title: `${song.title} by ${artist.name}`,
      description,
      type: 'website',
      images: buildOpenGraphImage(album.cover_image_url, album.title),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${song.title} by ${artist.name}`,
      description,
      images: buildTwitterImage(album.cover_image_url, album.title),
    },
  }
}

function buildSongLinks(artistName: string, albumTitle: string, songTitle: string) {
  const query = encodeURIComponent(`${artistName} ${albumTitle} ${songTitle}`)

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

export default async function SongDetailPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { artistSlug, albumSlug, songSlug } = await params

  const artist = await getPublishedArtistBySlug(artistSlug)
  if (!artist) {
    notFound()
  }

  const album = await getPublishedAlbumBySlug(albumSlug, artist.id)
  if (!album) {
    notFound()
  }

  const song = await getPublishedSongBySlug(songSlug, album.id)
  if (!song) {
    notFound()
  }

  const albumSongs = await getPublishedSongsByAlbumId(album.id)
  const showDisc = albumSongs.some((albumSong) => (albumSong.disc_number ?? 1) > 1)

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroBody}>
          <Breadcrumb
            items={[
              { href: '/', label: 'ホーム' },
              { href: `/artists/${artist.slug}`, label: artist.name },
              { href: `/artists/${artist.slug}/albums/${album.slug}`, label: album.title },
              { label: song.title },
            ]}
          />
          <h1 className={styles.heroTitle}>{song.title}</h1>
        </div>
        <div className={styles.actions}>
          <ExternalLinkButtons links={buildSongLinks(artist.name, album.title, song.title)} />
          <XShareButton
            title={song.title}
            urlPath={`/artists/${artist.slug}/albums/${album.slug}/songs/${song.slug}`}
          />
        </div>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>解説</h2>
          </div>
          <SongBody body={song.body_explanation} />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>同じアルバムの楽曲</h2>
          </div>

          <div className={styles.cardGrid}>
            {albumSongs.map((albumSong) => (
              <SongCard
                key={albumSong.id}
                href={`/artists/${artist.slug}/albums/${album.slug}/songs/${albumSong.slug}`}
                title={albumSong.title}
                trackNumber={albumSong.track_number}
                discNumber={albumSong.disc_number}
                showDisc={showDisc}
                isCurrent={albumSong.id === song.id}
              />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  )
}
