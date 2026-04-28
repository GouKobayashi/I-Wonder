import Link from 'next/link'

import { getSiteUrl } from '@/lib/site'

import styles from './catalog-ui.module.css'

type XShareButtonProps = {
  title: string
  urlPath: string
  summary?: string
}

export function XShareButton({ title, urlPath, summary }: XShareButtonProps) {
  const shareUrl = new URL('https://x.com/intent/post')
  const pageUrl = `${getSiteUrl()}${urlPath}`

  shareUrl.searchParams.set('url', pageUrl)
  shareUrl.searchParams.set('text', summary ? `${title}\n${summary}` : title)

  return (
    <Link
      className={styles.xShareButton}
      href={shareUrl.toString()}
      target="_blank"
      rel="noreferrer"
    >
      Share on X
    </Link>
  )
}
