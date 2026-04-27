import Link from 'next/link'

import styles from './catalog-ui.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerBrand}>
        <Link className={styles.headerTitle} href="/">
          IW
        </Link>
      </div>
    </header>
  )
}
