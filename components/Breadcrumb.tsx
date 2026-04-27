import Link from 'next/link'

import styles from './catalog-ui.module.css'

type BreadcrumbItem = {
  href?: string
  label: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1

        return (
          <span key={`${item.label}-${index}`}>
            {item.href && !isCurrent ? (
              <Link className={styles.breadcrumbLink} href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className={isCurrent ? styles.breadcrumbCurrent : undefined}>{item.label}</span>
            )}
            {!isCurrent ? <span className={styles.breadcrumbSeparator}> / </span> : null}
          </span>
        )
      })}
    </nav>
  )
}
