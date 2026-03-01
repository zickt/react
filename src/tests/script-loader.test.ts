import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { callZickt, loadZicktScript, resetLoader } from '../script-loader';

describe('script-loader', () => {
  beforeEach(() => {
    resetLoader();
  });

  afterEach(() => {
    document.querySelectorAll('script[src*="cdn.zickt.com"]').forEach((el) => el.remove());
  });

  describe('loadZicktScript', () => {
    it('creates a script element pointing to the CDN', async () => {
      const promise = loadZicktScript();

      const script = document.querySelector(
        'script[src="https://cdn.zickt.com/loader.js"]',
      ) as HTMLScriptElement;
      expect(script).toBeTruthy();
      expect(script.async).toBe(true);

      // Simulate script load
      script.onload?.(new Event('load'));
      await promise;
    });

    it('returns the same promise on duplicate calls', () => {
      const p1 = loadZicktScript();
      const p2 = loadZicktScript();
      expect(p1).toBe(p2);
    });

    it('resolves immediately if script tag already exists', async () => {
      const existing = document.createElement('script');
      existing.src = 'https://cdn.zickt.com/loader.js';
      document.head.appendChild(existing);

      await loadZicktScript();
    });

    it('rejects and resets on script error', async () => {
      const promise = loadZicktScript();

      const script = document.querySelector(
        'script[src="https://cdn.zickt.com/loader.js"]',
      ) as HTMLScriptElement;
      script.onerror?.(new Event('error'));

      await expect(promise).rejects.toThrow('[Zickt] Failed to load messenger script');

      // Should allow retrying after failure
      resetLoader();
      const retryPromise = loadZicktScript();
      expect(retryPromise).not.toBe(promise);
    });
  });

  describe('callZickt', () => {
    it('calls window.Zickt when available', () => {
      const mock = vi.fn().mockReturnValue('result');
      window.Zickt = mock;

      const result = callZickt('show');

      expect(mock).toHaveBeenCalledWith('show');
      expect(result).toBe('result');
    });

    it('passes additional arguments', () => {
      const mock = vi.fn();
      window.Zickt = mock;

      callZickt('update', { user: { email: 'a@b.com' } });

      expect(mock).toHaveBeenCalledWith('update', { user: { email: 'a@b.com' } });
    });

    it('returns undefined when window.Zickt is not available', () => {
      delete window.Zickt;
      expect(callZickt('show')).toBeUndefined();
    });

    it('returns undefined when window.Zickt is not a function', () => {
      (window as Record<string, unknown>).Zickt = 'not a function';
      expect(callZickt('show')).toBeUndefined();
    });
  });
});
