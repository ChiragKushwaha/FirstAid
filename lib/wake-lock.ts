/**
 * Screen Wake Lock API wrapper
 * Prevents device screen from sleeping during critical procedures
 */

let wakeLock: WakeLockSentinel | null = null;

export interface WakeLockStatus {
  isActive: boolean;
  isSupported: boolean;
  fallbackMessage: string | null;
}

export async function requestWakeLock(): Promise<WakeLockStatus> {
  if (!('wakeLock' in navigator)) {
    return {
      isActive: false,
      isSupported: false,
      fallbackMessage: 'Screen Wake Lock not supported. Please adjust your device sleep settings to prevent screen timeout during this procedure.',
    };
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');

    // Re-acquire on page visibility change (e.g., tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return { isActive: true, isSupported: true, fallbackMessage: null };
  } catch (err) {
    console.warn('Wake lock request failed:', err);
    return {
      isActive: false,
      isSupported: true,
      fallbackMessage: 'Could not lock screen. Please adjust your device sleep settings.',
    };
  }
}

async function handleVisibilityChange() {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {
      console.warn('Wake lock re-acquire failed:', err);
    }
  }
}

export async function releaseWakeLock(): Promise<void> {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

export function isWakeLockActive(): boolean {
  return wakeLock !== null && !wakeLock.released;
}

/**
 * Get battery level — returns null if Battery API is unsupported
 */
export async function getBatteryLevel(): Promise<number | null> {
  if (!('getBattery' in navigator)) return null;
  try {
    const battery = await (navigator as any).getBattery();
    return battery.level; // 0.0 to 1.0
  } catch {
    return null;
  }
}
