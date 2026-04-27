import Link from 'next/link'

import { AlbumForm } from '@/app/admin/forms'
import styles from '@/app/admin/admin.module.css'
import { requireAdminSession } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export default async function NewAlbumPage() {
  await requireAdminSession()

  const supabase = getSupabaseAdmin()
  const { data: artists, error } = await supabase
    .from('artists')
    .select('id, name, slug')
    .order('name', { ascending: true })

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.stack}>
          <section className={styles.card}>
            <div className={styles.stack}>
              <h1 className={styles.title}>New Album</h1>
              <p className={styles.subtitle}>
                album は既存 artist に紐づけて作成します。select から選べない場合は、先に
                artist を追加してください。
              </p>
              <div className={styles.inlineLinks}>
                <Link href="/admin">管理画面トップ</Link>
                <Link href="/admin/artists/new">artist 作成へ</Link>
                <Link href="/admin/songs/new">song 作成へ</Link>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            {error ? (
              <div className={styles.messageError}>{error.message}</div>
            ) : artists && artists.length > 0 ? (
              <AlbumForm artists={artists} />
            ) : (
              <div className={styles.messageError}>
                artist がまだありません。先に `/admin/artists/new` から 1 件作成してください。
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
