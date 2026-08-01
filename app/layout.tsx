import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from 'next';
import RoutePreloader from '@/components/RoutePreloader';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://field-aid.vercel.app'),
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
  authors: [{ name: 'FieldAid Medical Response Team', url: 'https://field-aid.vercel.app' }],
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
    url: 'https://field-aid.vercel.app',
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
  themeColor: '#EDE8DB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const medicalPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'FieldAid — Offline Emergency First Aid & Triage',
  url: 'https://field-aid.vercel.app',
  sameAs: ['https://triage-first-aid.vercel.app'],
  description:
    'Offline-first emergency medical protocols, START triage wizard, 110 BPM CPR metronome, and pediatric dosage calculator.',
  medicalAudience: 'Emergency Rescuers, Wilderness Hikers, Parents, First Responders',
  aspect: ['Emergency Triage', 'CPR Guidelines', 'Medication Dosage', 'First Aid Protocols'],
  isAccessibleForFree: true,
  author: {
    '@type': 'Organization',
    name: 'FieldAid Emergency Medical Response',
    url: 'https://field-aid.vercel.app',
  },
};

const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'FieldAid PWA',
  url: 'https://field-aid.vercel.app',
  sameAs: ['https://triage-first-aid.vercel.app'],
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
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalPageJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        />
        {/* Inline script to initialize theme and register Service Worker safely */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('fieldaid_theme');
                  var theme = saved || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}

                if ('serviceWorker' in navigator) {
                  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      for (var i = 0; i < registrations.length; i++) {
                        registrations[i].unregister();
                      }
                    });
                  } else {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js').then(
                        function(reg) { console.log('[ServiceWorker] Registered:', reg.scope); },
                        function(err) { console.warn('[ServiceWorker] Registration failed:', err); }
                      );
                    });
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body
        style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
        className="antialiased select-none overflow-x-hidden transition-colors duration-300"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--orange)] focus:text-white focus:font-bold focus:rounded-xl focus:shadow-2xl"
        >
          Skip to main content
        </a>
        <RoutePreloader />
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id="aria-announcer"
        />
        <div className="min-h-screen flex flex-col max-w-md mx-auto relative bg-canvas" id="main-content">
          {children}
        </div>
      </body>
      <Analytics />
    </html>
  );
}
