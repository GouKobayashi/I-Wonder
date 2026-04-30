'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

type GoogleAnalyticsProps = {
  measurementId: string
}

type GtagEvent = (...args: unknown[]) => void

declare global {
  interface Window {
    gtag?: GtagEvent
  }
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()

  useEffect(() => {
    if (!pathname || !window.gtag) {
      return
    }

    const pagePath = search ? `${pathname}?${search}` : pathname

    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: pagePath,
      page_title: document.title,
      send_to: measurementId,
    })
  }, [measurementId, pathname, search])

  return null
}
