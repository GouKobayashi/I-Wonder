import Link from 'next/link'

import { SongForm } from '@/app/admin/forms'
import styles from '@/app/admin/admin.module.css'
import { requireAdminSession } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export default async function NewSongPage() {
  await requireAdminSession()

  const supabase = getSupabaseAdmin()
  const { data: albums, error } = await supabase
    .from('albums')
    .select('id, title, slug')
    .order('title', { ascending: true })

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.stack}>
          <section className={styles.card}>
            <div className={styles.stack}>
              <h1 className={styles.title}>New Song</h1>
              <p className={styles.subtitle}>
                song の登録に必要な情報を 1 画面に集約しています。必須項目から埋めて、その後に概要欄を追加してください。
              </p>
              <div className={styles.inlineLinks}>
                <Link href="/admin">管理画面トップ</Link>
                <Link href="/admin/artists/new">artist 作成へ</Link>
                <Link href="/admin/albums/new">album 作成へ</Link>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            {error ? (
              <div className={styles.messageError}>{error.message}</div>
            ) : albums && albums.length > 0 ? (
              <SongForm albums={albums} />
            ) : (
              <div className={styles.messageError}>
                album がまだありません。先に `/admin/albums/new` から 1 件作成してください。
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
