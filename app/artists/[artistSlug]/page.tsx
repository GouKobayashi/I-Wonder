import { notFound } from 'next/navigation'

import { AlbumCard } from '@/components/AlbumCard'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ExternalLinkButtons } from '@/components/ExternalLinkButtons'
import { PageShell } from '@/components/PageShell'
import { SongCard } from '@/components/SongCard'
import {
  getArtistDisplayLabel,
  getPublishedAlbumsByArtistId,
  getPublishedArtistBySlug,
  getPublishedSongsByAlbumId,
} from '@/lib/music-catalog'

import styles from '@/components/catalog-ui.module.css'

type RouteParams = {
  artistSlug: string
}

export const dynamic = 'force-dynamic'

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

function getSongPreview(bodyExplanation: string | null) {
  if (!bodyExplanation) {
    return null
  }

  const [firstLine] = bodyExplanation.split('\n')
  return firstLine.trim()
}


export default async function ArtistPage({ params }: { params: Promise<RouteParams> }) {
  const { artistSlug } = await params

  const artist = await getPublishedArtistBySlug(artistSlug)
  if (!artist) {
    notFound()
  }

  const albums = await getPublishedAlbumsByArtistId(artist.id)
  const albumSongs = await Promise.all(albums.map((album) => getPublishedSongsByAlbumId(album.id)))
  const highlightSongs = albumSongs.flat().slice(0, 4)

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroBody}>
          <Breadcrumb
            items={[
              { href: '/', label: 'Home' },
              { label: artist.name },
            ]}
          />
          <h1 className={styles.heroTitle}>{getArtistDisplayLabel(artist)}</h1>
        </div>
        <ExternalLinkButtons links={buildArtistLinks(artist.name)} />
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Albums</h2>
          </div>

          {albums.length > 0 ? (
            <div className={styles.cardGrid}>
              {albums.map((album, index) => (
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
              {highlightSongs.map((song) => {
                const album = albums.find((item) => item.id === song.primary_album_id)
                if (!album) {
                  return null
                }

                return (
                  <SongCard
                    key={song.id}
                    href={`/artists/${artist.slug}/albums/${album.slug}/songs/${song.slug}`}
                    title={song.title}
                    albumTitle={album.title}
                    artistName={artist.name}
                    trackNumber={song.track_number}
                    discNumber={song.disc_number}
                    bodyPreview={getSongPreview(song.body_explanation)}
                  />
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>公開済み曲はまだありません。</div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
