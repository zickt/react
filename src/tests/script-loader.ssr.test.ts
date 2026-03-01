/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import { callZickt, loadZicktScript } from '../script-loader';

describe('script-loader (SSR)', () => {
  it('resolves immediately when window is undefined', async () => {
    await expect(loadZicktScript()).resolves.toBeUndefined();
  });

  it('callZickt returns undefined when window is undefined', () => {
    expect(callZickt('show')).toBeUndefined();
  });
});
