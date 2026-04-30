const PRODUCTION_SITE_URL = 'https://i-wonder.jp'

export function getSiteUrl() {
  const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (explicitSiteUrl) {
    return explicitSiteUrl
  }

  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv) {
    return PRODUCTION_SITE_URL
  }

  return 'http://localhost:3000'
}

export function getCanonicalSiteUrl() {
  const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (explicitSiteUrl) {
    return explicitSiteUrl
  }

  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv) {
    return PRODUCTION_SITE_URL
  }

  return getSiteUrl()
}
