import type { Metadata } from 'next'

import { supabase } from '@/utils/supabase'
import { requireAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function SupabaseDebugPage() {
  await requireAdminSession()

  let error: string | null = null
  let data: {
    artists: Record<string, unknown>[]
    albums: Record<string, unknown>[]
    songs: Record<string, unknown>[]
  } | null = null

  try {
    const [artistsRes, albumsRes, songsRes] = await Promise.all([
      supabase.from('artists').select('*').limit(5),
      supabase.from('albums').select('*').limit(5),
      supabase.from('songs').select('*').limit(5),
    ])

    if (artistsRes.error) throw new Error(`Artists fetch error: ${artistsRes.error.message}`)
    if (albumsRes.error) throw new Error(`Albums fetch error: ${albumsRes.error.message}`)
    if (songsRes.error) throw new Error(`Songs fetch error: ${songsRes.error.message}`)

    data = {
      artists: artistsRes.data,
      albums: albumsRes.data,
      songs: songsRes.data,
    }
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : 'An unknown error occurred'
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Supabase Connection Debug</h1>
      
      {error ? (
        <div style={{ color: 'red', marginTop: '1rem', padding: '1rem', border: '1px solid red' }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          <h2>Connection Successful</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Successfully connected using publishable key and fetched up to 5 records from each table.
          </p>
          <pre style={{ background: '#1e1e1e', padding: '1rem', borderRadius: '4px', overflowX: 'auto', color: '#d4d4d4', fontSize: '14px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
