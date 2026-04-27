import Link from 'next/link'

import styles from './catalog-ui.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerBrand}>
        <Link className={styles.headerTitle} href="/">
          I Wonder
        </Link>
      </div>

      <Link className={styles.headerLink} href="/artists/ye">
        Explore Ye
      </Link>
    </header>
  )
}
