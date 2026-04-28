import { ReactNode } from 'react'

import { Header } from './Header'
import styles from './catalog-ui.module.css'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.pageShell}>
      <div className={styles.shellInner}>
        <div className={styles.stack}>
          <Header />
          {children}
          <footer className={styles.pageFooter}>
            <div className={styles.pageFooterBrand}>I Wonder</div>
            <div className={styles.pageFooterMeta}>
              <div>Music database for lyrics, background, and context.</div>
              <div>Explore with care.</div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}
