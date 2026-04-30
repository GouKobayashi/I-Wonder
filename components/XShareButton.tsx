import Link from 'next/link'

import { getCanonicalSiteUrl } from '@/lib/site'

import styles from './catalog-ui.module.css'

type XShareButtonProps = {
  title: string
  urlPath: string
}

function XLogo() {
  return (
    <svg
      className={styles.xShareButtonIcon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M18.9 2H22l-6.77 7.74L23.2 22h-6.25l-4.89-7.4L5.58 22H2.47l7.24-8.28L2 2h6.4l4.42 6.76L18.9 2Zm-1.1 18h1.72L7.46 3.9H5.62L17.8 20Z"
      />
    </svg>
  )
}

export function XShareButton({ title, urlPath }: XShareButtonProps) {
  const shareUrl = new URL('https://x.com/intent/post')
  const pageUrl = `${getCanonicalSiteUrl()}${urlPath}`

  shareUrl.searchParams.set('url', pageUrl)
  shareUrl.searchParams.set('text', '@iwonder_jp')

  return (
    <Link
      className={styles.xShareButton}
      href={shareUrl.toString()}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${title} を X でシェア`}
      title="Share on X"
    >
      <XLogo />
    </Link>
  )
}
