'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

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

  useEffect(() => {
    if (!pathname || !window.gtag) {
      return
    }

    const pagePath = `${window.location.pathname}${window.location.search}`

    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: pagePath,
      page_title: document.title,
      send_to: measurementId,
    })
  }, [measurementId, pathname])

  return null
}
