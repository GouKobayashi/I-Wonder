import Link from 'next/link'

import { logoutAdmin } from '@/app/admin/actions'
import styles from '@/app/admin/admin.module.css'
import { requireAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdminSession()

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.stack}>
          <section className={styles.card}>
            <div className={styles.stack}>
              <h1 className={styles.title}>Admin</h1>
              <p className={styles.subtitle}>
                まず 1 曲分のデータを迷わず登録できることに絞った最小 CMS です。
              </p>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.navList}>
              <Link className={styles.navLink} href="/admin/artists/new">
                artist を作成
              </Link>
              <Link className={styles.navLink} href="/admin/albums/new">
                album を作成
              </Link>
              <Link className={styles.navLink} href="/admin/songs/new">
                song を作成
              </Link>
              <Link className={styles.navLink} href="/debug/supabase">
                /debug/supabase で確認
              </Link>
            </div>
          </section>

          <section className={styles.card}>
            <form action={logoutAdmin}>
              <button className={styles.secondaryButton} type="submit">
                ログアウト
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
