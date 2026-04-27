import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/Breadcrumb'
import { ExternalLinkButtons } from '@/components/ExternalLinkButtons'
import { PageShell } from '@/components/PageShell'
import { SongBody } from '@/components/SongBody'
import { SongCard } from '@/components/SongCard'
import {
  getPublishedAlbumBySlug,
  getPublishedArtistBySlug,
  getPublishedSongBySlug,
  getPublishedSongsByAlbumId,
} from '@/lib/music-catalog'

import styles from '@/components/catalog-ui.module.css'

type RouteParams = {
  artistSlug: string
  albumSlug: string
  songSlug: string
}

export const dynamic = 'force-dynamic'

function buildSongLinks(artistName: string, albumTitle: string, songTitle: string) {
  const query = encodeURIComponent(`${artistName} ${albumTitle} ${songTitle}`)

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
              { href: '/', label: 'Home' },
              { href: `/artists/${artist.slug}`, label: artist.name },
              { href: `/artists/${artist.slug}/albums/${album.slug}`, label: album.title },
              { label: song.title },
            ]}
          />
          <h1 className={styles.heroTitle}>{song.title}</h1>
        </div>
        <ExternalLinkButtons links={buildSongLinks(artist.name, album.title, song.title)} />
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Explanation</h2>
          </div>
          <SongBody body={song.body_explanation} />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Same Album</h2>
          </div>

          <div className={styles.cardGrid}>
            {albumSongs.map((albumSong) => (
              <SongCard
                key={albumSong.id}
                href={`/artists/${artist.slug}/albums/${album.slug}/songs/${albumSong.slug}`}
                title={albumSong.title}
                albumTitle={album.title}
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
