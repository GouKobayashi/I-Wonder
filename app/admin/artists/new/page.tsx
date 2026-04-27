import Link from 'next/link'

import { ArtistForm } from '@/app/admin/forms'
import styles from '@/app/admin/admin.module.css'
import { requireAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function NewArtistPage() {
  await requireAdminSession()

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.stack}>
          <section className={styles.card}>
            <div className={styles.stack}>
              <h1 className={styles.title}>New Artist</h1>
              <p className={styles.subtitle}>
                まず artist の基本情報を登録します。album 作成前にここを 1 件通してください。
              </p>
              <div className={styles.inlineLinks}>
                <Link href="/admin">管理画面トップ</Link>
                <Link href="/admin/albums/new">album 作成へ</Link>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <ArtistForm />
          </section>
        </div>
      </div>
    </main>
  )
}
