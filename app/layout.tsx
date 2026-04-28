import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'I Wonder',
    template: '%s | I Wonder',
  },
  description: 'I Wonder is a music database for reading foreign music through lyrics, background, and context.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'I Wonder',
    title: 'I Wonder',
    description:
      'I Wonder is a music database for reading foreign music through lyrics, background, and context.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'I Wonder',
    description:
      'I Wonder is a music database for reading foreign music through lyrics, background, and context.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body>{children}</body>
    </html>
  );
}
