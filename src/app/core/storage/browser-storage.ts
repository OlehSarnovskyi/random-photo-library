import { DOCUMENT, inject, InjectionToken } from '@angular/core';

/**
 * `localStorage` behind a DI token, so persistence can be swapped in tests.
 * Resolves to `null` when storage is unavailable (SSR, disabled cookies, privacy modes).
 */
export const BROWSER_STORAGE = new InjectionToken<Storage | null>('BROWSER_STORAGE', {
  providedIn: 'root',
  factory: () => {
    try {
      return inject(DOCUMENT).defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  },
});
