import { describe, expect, it } from 'vitest';

import * as api from '../index';

describe('public API surface', () => {
  it('exports exactly the expected runtime symbols', () => {
    expect(Object.keys(api).sort()).toMatchInlineSnapshot(`
      [
        "ZicktMessenger",
        "ZicktProvider",
        "useZickt",
      ]
    `);
  });

  it('ZicktProvider is a function component', () => {
    expect(typeof api.ZicktProvider).toBe('function');
  });

  it('ZicktMessenger is a function component', () => {
    expect(typeof api.ZicktMessenger).toBe('function');
  });

  it('useZickt is a function', () => {
    expect(typeof api.useZickt).toBe('function');
  });
});
