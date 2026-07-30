import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://fieldaid.app'),
  title: {
    default: 'FieldAid — Offline Emergency First Aid, Triage & Dosage Guide',
    template: '%s | FieldAid Emergency Response',
  },
  verification: {
    google: "OIk6sJu3nmgUIb9c-yV6DvU_P4KyXctrKxF8ZukWjQE",
    other: {
      "msvalidate.01": "OIk6sJu3nmgUIb9c-yV6DvU_P4KyXctrKxF8ZukWjQE",
    }
  },
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
    'Medical Protocol Reference',
    'First Responder PWA',
  ],
  authors: [{ name: 'FieldAid Medical Response Team', url: 'https://fieldaid.app' }],
  creator: 'FieldAid',
  publisher: 'FieldAid Medical Systems',
  alternates: {
    canonical: '/',
  },
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
    images: [
      {
        url: '/screenshots/desktop-home.png',
        width: 1920,
        height: 1080,
        alt: 'FieldAid Emergency First Aid App Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FieldAid — Offline Emergency First Aid Guide',
    description:
      'Instant offline emergency triage, 110 BPM CPR pacer, and pediatric dosage calculation for off-grid and emergency response.',
    images: ['/screenshots/desktop-home.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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

const medicalPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'FieldAid — Offline Emergency First Aid & Triage',
  url: 'https://fieldaid.app',
  description:
    'Offline-first emergency medical protocols, START triage wizard, 110 BPM CPR metronome, and pediatric dosage calculator.',
  medicalAudience: 'Emergency Rescuers, Wilderness Hikers, Parents, First Responders',
  aspect: ['Emergency Triage', 'CPR Guidelines', 'Medication Dosage', 'First Aid Protocols'],
  isAccessibleForFree: true,
  author: {
    '@type': 'Organization',
    name: 'FieldAid Emergency Medical Response',
    url: 'https://fieldaid.app',
  },
};

const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'FieldAid PWA',
  operatingSystem: 'Any (Web, iOS, Android)',
  applicationCategory: 'HealthApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    ratingCount: '128',
  },
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
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalPageJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        />
        {/* Inline script to initialize theme and register Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('fieldaid_theme');
                  var theme = saved || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}

                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(reg) {
                        console.log('[PWABuilder] SW registered successfully:', reg.scope);
                      },
                      function(err) {
                        console.warn('[PWABuilder] SW registration failed:', err);
                      }
                    );
                  });
                }
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
