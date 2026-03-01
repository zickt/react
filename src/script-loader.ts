/**
 * Commands exposed by the React SDK — a curated subset of the full
 * messenger-sdk `CommandName` union. This is intentionally narrow:
 * the React SDK only surfaces commands that make sense for host-app
 * developers; internal/realtime commands stay in the messenger-sdk.
 *
 * Contract tests in `tests/sdk-contract.test.ts` verify that
 * every value here is a valid `CommandName` in the messenger-sdk.
 */
export type ReactCommand =
  | 'boot'
  | 'shutdown'
  | 'show'
  | 'hide'
  | 'showNewMessage'
  | 'update'
  | 'identify'
  | 'logout'
  | 'getVisitorId';

const CDN_URL = 'https://cdn.zickt.com/loader.js';

let loadPromise: Promise<void> | null = null;

export function loadZicktScript(): Promise<void> {
  if (loadPromise !== null) {
    return loadPromise;
  }

  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${CDN_URL}"]`);
    if (existing !== null) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = CDN_URL;
    script.async = true;

    script.onload = (): void => {
      resolve();
    };

    script.onerror = (): void => {
      loadPromise = null;
      reject(new Error('[Zickt] Failed to load messenger script'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export function callZickt(command: ReactCommand, ...args: unknown[]): unknown {
  if (typeof window !== 'undefined' && typeof window.Zickt === 'function') {
    return window.Zickt(command, ...args);
  }
  return undefined;
}

/** Reset loader state — for testing only */
export function resetLoader(): void {
  loadPromise = null;
}
