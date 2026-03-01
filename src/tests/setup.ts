import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();

  // Guard for SSR tests running in node environment
  if (typeof window === 'undefined') {
    return;
  }

  // Reset window.Zickt between tests
  delete window.Zickt;
  delete window.zicktSettings;

  // Remove any injected script tags
  document.querySelectorAll('script[src*="cdn.zickt.com"]').forEach((el) => el.remove());
});
