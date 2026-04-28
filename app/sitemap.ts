import type { MetadataRoute } from 'next'

import {
  getPublishedAlbumsByArtistId,
  getPublishedArtists,
  getPublishedSongsByAlbumId,
} from '@/lib/music-catalog'
import { getSiteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const artists = await getPublishedArtists()

  const artistEntries: MetadataRoute.Sitemap = artists.map((artist) => ({
    url: `${siteUrl}/artists/${artist.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const albumEntries: MetadataRoute.Sitemap = []
  const songEntries: MetadataRoute.Sitemap = []

  for (const artist of artists) {
    const albums = await getPublishedAlbumsByArtistId(artist.id)

    for (const album of albums) {
      albumEntries.push({
        url: `${siteUrl}/artists/${artist.slug}/albums/${album.slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      })

      const songs = await getPublishedSongsByAlbumId(album.id)
      for (const song of songs) {
        songEntries.push({
          url: `${siteUrl}/artists/${artist.slug}/albums/${album.slug}/songs/${song.slug}`,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  }

  return [
    {
      url: siteUrl,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/artists`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/albums`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...artistEntries,
    ...albumEntries,
    ...songEntries,
  ]
}
