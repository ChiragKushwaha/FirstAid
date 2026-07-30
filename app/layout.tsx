import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FieldAid — Offline Emergency First Aid, Triage & Dosage Guide',
  description:
    'Offline-first emergency medical reference, START triage decision tree, 110 BPM CPR metronome, and weight-based pediatric dosage calculator for zero-connectivity environments.',
  keywords: [
    'Emergency First Aid',
    'Offline First Aid App',
    'START Triage',
    'JumpSTART Pediatric Triage',
    'CPR Metronome 110 BPM',
    'Pediatric Dosage Calculator',
    'Wilderness First Aid',
    'Disaster Medical Response',
  ],
  authors: [{ name: 'FieldAid Medical Response Team' }],
  creator: 'FieldAid',
  publisher: 'FieldAid PWA',
  formatDetection: {
    telephone: true,
    email: false,
    address: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FieldAid',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fieldaid.app',
    title: 'FieldAid — Offline Emergency First Aid & Triage PWA',
    description:
      'Zero-latency, 100% offline emergency medical protocols, START triage wizard, 110 BPM CPR metronome, and weight-based dosage calculator.',
    siteName: 'FieldAid',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FieldAid — Offline Emergency First Aid Guide',
    description:
      'Instant offline emergency triage, 110 BPM CPR pacer, and pediatric dosage calculation for off-grid and emergency response.',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'FieldAid — Offline Emergency First Aid & Triage',
  description:
    'Offline-first emergency medical protocols, START triage wizard, 110 BPM CPR metronome, and pediatric dosage calculator.',
  medicalAudience: 'Emergency Rescuers, Wilderness Hikers, Parents, First Responders',
  aspect: ['Emergency Triage', 'CPR Guidelines', 'Medication Dosage', 'First Aid Protocols'],
  isAccessibleForFree: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Inline script to initialize theme without FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('fieldaid_theme');
                  if (saved) {
                    document.documentElement.setAttribute('data-theme', saved);
                  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                    document.documentElement.setAttribute('data-theme', light);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
        className="bg-black text-white antialiased select-none overflow-x-hidden transition-colors duration-200"
      >
        <div
          role="status"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
          id="aria-announcer"
        />
        <div className="min-h-screen flex flex-col max-w-md mx-auto relative bg-canvas">
          {children}
        </div>
      </body>
    </html>
  );
}
