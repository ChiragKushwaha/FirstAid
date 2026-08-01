'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ALL_ROUTES = [
  '/',
  '/triage',
  '/cpr',
  '/dosage',
  '/protocols',
  '/offline',
  '/protocols/protocol_trauma_hemorrhage',
  '/protocols/protocol_cardiac_cpr_adult',
  '/protocols/protocol_cardiac_cpr_pediatric',
  '/protocols/protocol_airway_choking_adult',
  '/protocols/protocol_airway_choking_infant',
  '/protocols/protocol_environmental_anaphylaxis',
  '/protocols/protocol_trauma_burns',
  '/protocols/protocol_trauma_fractures',
  '/protocols/protocol_neurological_head_trauma',
  '/protocols/protocol_environmental_hypothermia',
  '/protocols/protocol_environmental_heatstroke',
  '/protocols/protocol_environmental_bites',
  '/protocols/protocol_neurological_seizure',
  '/protocols/protocol_respiratory_asthma',
  '/protocols/protocol_trauma_spinal',
  '/protocols/protocol_metabolic_diabetic',
  '/protocols/protocol_cardiac_stroke',
  '/protocols/protocol_respiratory_drowning',
  '/protocols/protocol_trauma_eye',
  '/protocols/protocol_trauma_amputation',
];

export default function RoutePreloader() {
  const router = useRouter();

  useEffect(() => {
    // Helper to check if running as an installed PWA / Standalone Web App
    const isStandalone = () => {
      if (typeof window === 'undefined') return false;
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isNavStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
      return isStandaloneMedia || isNavStandalone;
    };

    const preloadAllRoutes = () => {
      if (!router) return;
      console.log('[OfflinePreloader] Safely preloading Next.js client routes...');

      ALL_ROUTES.forEach((route) => {
        try {
          router.prefetch(route);
        } catch (err) {
          // Ignore prefetch timing errors on initialization
        }
      });
    };

    if (typeof window !== 'undefined') {
      const isApp = isStandalone();
      const delay = isApp ? 1000 : 3000;

      // Ensure router is fully initialized before triggering prefetch
      const timer = setTimeout(() => {
        if (document.readyState === 'complete') {
          preloadAllRoutes();
        } else {
          window.addEventListener('load', preloadAllRoutes, { once: true });
        }
      }, delay);

      const handleAppInstalled = () => {
        console.log('[OfflinePreloader] PWA app installed event detected!');
        preloadAllRoutes();
      };

      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, [router]);

  return null;
}
