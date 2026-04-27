import { redirect } from 'next/navigation'

import { isAdminAuthenticated, isAdminConfigured } from '@/lib/admin-auth'

import { LoginForm } from '@/app/admin/forms'
import styles from '@/app/admin/admin.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect('/admin')
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.stack}>
          <section className={styles.card}>
            <div className={styles.stack}>
              <h1 className={styles.title}>Admin Login</h1>
              <p className={styles.subtitle}>
                `SUPABASE_SECRET_KEY` はサーバーだけで使います。管理画面への入場は別の
                `ADMIN_PASSWORD` で保護します。
              </p>
            </div>
          </section>

          <section className={styles.card}>
            <LoginForm configured={isAdminConfigured()} />
          </section>
        </div>
      </div>
    </main>
  )
}
