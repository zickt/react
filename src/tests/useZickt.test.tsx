import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useZickt } from '../useZickt';
import { ZicktProvider } from '../ZicktProvider';

vi.mock('../script-loader', () => ({
  loadZicktScript: vi.fn().mockResolvedValue(undefined),
  callZickt: vi.fn(),
  resetLoader: vi.fn(),
}));

import { callZickt } from '../script-loader';

const mockCallZickt = vi.mocked(callZickt);

function createWrapper(): ({ children }: { children: React.ReactNode }) => React.JSX.Element {
  return ({ children }: { children: React.ReactNode }): React.JSX.Element => (
    <ZicktProvider channelKey="test-key">{children}</ZicktProvider>
  );
}

describe('useZickt', () => {
  beforeEach(() => {
    mockCallZickt.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when used outside ZicktProvider', () => {
    expect(() => {
      renderHook(() => useZickt());
    }).toThrow('useZickt must be used within a <ZicktProvider>');
  });

  it('returns context value inside ZicktProvider', () => {
    const { result } = renderHook(() => useZickt(), { wrapper: createWrapper() });

    expect(result.current.isReady).toBe(false);
    expect(typeof result.current.show).toBe('function');
    expect(typeof result.current.hide).toBe('function');
    expect(typeof result.current.showNewMessage).toBe('function');
    expect(typeof result.current.update).toBe('function');
    expect(typeof result.current.identify).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.getVisitorId).toBe('function');
    expect(typeof result.current.shutdown).toBe('function');
  });

  it('show() calls callZickt with "show"', () => {
    const { result } = renderHook(() => useZickt(), { wrapper: createWrapper() });

    act(() => {
      result.current.show();
    });

    expect(mockCallZickt).toHaveBeenCalledWith('show');
  });

  it('hide() calls callZickt with "hide"', () => {
    const { result } = renderHook(() => useZickt(), { wrapper: createWrapper() });

    act(() => {
      result.current.hide();
    });

    expect(mockCallZickt).toHaveBeenCalledWith('hide');
  });

  it('showNewMessage() calls callZickt with optional message', () => {
    const { result } = renderHook(() => useZickt(), { wrapper: createWrapper() });

    act(() => {
      result.current.showNewMessage('Hello!');
    });

    expect(mockCallZickt).toHaveBeenCalledWith('showNewMessage', 'Hello!');
  });

  it('getVisitorId() returns value from callZickt', () => {
    mockCallZickt.mockReturnValueOnce('visitor-123');

    const { result } = renderHook(() => useZickt(), { wrapper: createWrapper() });

    let visitorId: string | undefined;
    act(() => {
      visitorId = result.current.getVisitorId();
    });

    expect(visitorId).toBe('visitor-123');
  });

  it('shutdown() calls callZickt with "shutdown"', () => {
    const { result } = renderHook(() => useZickt(), { wrapper: createWrapper() });

    act(() => {
      result.current.shutdown();
    });

    expect(mockCallZickt).toHaveBeenCalledWith('shutdown');
  });

  it('identify() calls callZickt with payload', () => {
    const { result } = renderHook(() => useZickt(), { wrapper: createWrapper() });

    act(() => {
      result.current.identify({
        id: 'cus_123',
        email: 'jane@acme.com',
        name: 'Jane Smith',
        company: { id: 'comp_456', name: 'Acme Corp' },
      });
    });

    expect(mockCallZickt).toHaveBeenCalledWith('identify', {
      id: 'cus_123',
      email: 'jane@acme.com',
      name: 'Jane Smith',
      company: { id: 'comp_456', name: 'Acme Corp' },
    });
  });

  it('logout() calls callZickt with "logout"', () => {
    const { result } = renderHook(() => useZickt(), { wrapper: createWrapper() });

    act(() => {
      result.current.logout();
    });

    expect(mockCallZickt).toHaveBeenCalledWith('logout');
  });

  describe('update()', () => {
    async function setupReadyHook(): Promise<
      ReturnType<typeof renderHook<ReturnType<typeof useZickt>, unknown>>
    > {
      const hook = renderHook(() => useZickt(), { wrapper: createWrapper() });

      // Wait for boot, then trigger onReady
      await waitFor(() => {
        expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
      });

      const bootCalls = mockCallZickt.mock.calls.filter((call) => call[0] === 'boot');
      const bootConfig = bootCalls[bootCalls.length - 1]?.[1] as Record<string, unknown>;
      const sdkOnReady = bootConfig.onReady as () => void;
      act(() => {
        sdkOnReady();
      });

      mockCallZickt.mockClear();
      return hook;
    }

    it('forwards user config to callZickt', async () => {
      const { result } = await setupReadyHook();

      act(() => {
        result.current.update({ user: { email: 'new@test.com' } });
      });

      expect(mockCallZickt).toHaveBeenCalledWith('update', { user: { email: 'new@test.com' } });
    });

    it('forwards company, appearance, customLauncherSelector, and hideDefaultLauncher', async () => {
      const { result } = await setupReadyHook();

      act(() => {
        result.current.update({
          company: { name: 'Acme' },
          appearance: { theme: 'dark' },
          customLauncherSelector: '#launcher',
          hideDefaultLauncher: true,
        });
      });

      expect(mockCallZickt).toHaveBeenCalledWith('update', {
        company: { name: 'Acme' },
        appearance: { theme: 'dark' },
        customLauncherSelector: '#launcher',
        hideDefaultLauncher: true,
      });
    });

    it('omits undefined properties from the update payload', async () => {
      const { result } = await setupReadyHook();

      act(() => {
        result.current.update({ user: { email: 'x@y.com' } });
      });

      const updateCall = mockCallZickt.mock.calls.find((call) => call[0] === 'update');
      const payload = updateCall?.[1] as Record<string, unknown>;
      expect(payload).toEqual({ user: { email: 'x@y.com' } });
      expect('company' in payload).toBe(false);
      expect('appearance' in payload).toBe(false);
      expect('customLauncherSelector' in payload).toBe(false);
      expect('hideDefaultLauncher' in payload).toBe(false);
    });

    it('forwards hideDefaultLauncher=false correctly', async () => {
      const { result } = await setupReadyHook();

      act(() => {
        result.current.update({ hideDefaultLauncher: false });
      });

      expect(mockCallZickt).toHaveBeenCalledWith('update', { hideDefaultLauncher: false });
    });
  });
});
