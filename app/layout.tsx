import type { Metadata } from "next";
import Script from 'next/script';
import "./globals.css";
import { getSiteUrl } from "@/lib/site";
import { SITE_DESCRIPTION } from "@/lib/metadata";
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA_ID

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'I Wonder',
    template: '%s | I Wonder',
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'I Wonder',
    title: 'I Wonder',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'I Wonder',
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body>
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              id="google-analytics-init"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    send_page_view: false
                  });
                `,
              }}
            />
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
