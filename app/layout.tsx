import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FieldAid — Offline Emergency First Aid',
  description:
    'Offline-first emergency triage, first-aid protocols, and dosage calculator for zero-connectivity environments. Works completely offline.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FieldAid',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Outfit & Plus Jakarta Sans — closest 1:1 match to Lufga font */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
        className="bg-black text-white antialiased select-none overflow-x-hidden"
      >
        <div
          role="status"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
          id="aria-announcer"
        />
        <div className="min-h-screen flex flex-col max-w-md mx-auto relative bg-black">
          {children}
        </div>
      </body>
    </html>
  );
}
