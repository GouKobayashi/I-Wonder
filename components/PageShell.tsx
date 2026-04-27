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
        </div>
      </div>
    </main>
  )
}
