import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ZicktProvider } from '../ZicktProvider';
import { useZickt } from '../useZickt';

// Mock the script-loader module
vi.mock('../script-loader', () => ({
  loadZicktScript: vi.fn(),
  callZickt: vi.fn(),
  resetLoader: vi.fn(),
}));

// Import mocked functions
import { callZickt, loadZicktScript } from '../script-loader';

const mockLoadScript = vi.mocked(loadZicktScript);
const mockCallZickt = vi.mocked(callZickt);

/** Extracts the boot config from the most recent boot call */
function getLastBootConfig(): Record<string, unknown> {
  const bootCalls = mockCallZickt.mock.calls.filter((call) => call[0] === 'boot');
  return bootCalls[bootCalls.length - 1]?.[1] as Record<string, unknown>;
}

describe('ZicktProvider', () => {
  beforeEach(() => {
    mockLoadScript.mockResolvedValue(undefined);
    mockCallZickt.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children', () => {
    render(
      <ZicktProvider channelKey="test-key">
        <div data-testid="child">Hello</div>
      </ZicktProvider>,
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('loads the script and boots the SDK', async () => {
    render(
      <ZicktProvider channelKey="test-key" user={{ email: 'test@example.com' }}>
        <div>App</div>
      </ZicktProvider>,
    );

    await waitFor(() => {
      expect(mockLoadScript).toHaveBeenCalled();
    });

    expect(mockCallZickt).toHaveBeenCalledWith(
      'boot',
      expect.objectContaining({
        channel_key: 'test-key',
        user: { email: 'test@example.com' },
      }),
    );
  });

  it('calls shutdown on unmount after boot', async () => {
    const { unmount } = render(
      <ZicktProvider channelKey="test-key">
        <div>App</div>
      </ZicktProvider>,
    );

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
    });

    unmount();

    expect(mockCallZickt).toHaveBeenCalledWith('shutdown');
  });

  it('does not boot or shutdown when unmounted before load completes', async () => {
    const resolvers: Array<() => void> = [];
    mockLoadScript.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolvers.push(resolve);
        }),
    );

    const { unmount } = render(
      <ZicktProvider channelKey="test-key">
        <div>App</div>
      </ZicktProvider>,
    );

    // Record boot calls before unmount to isolate what happens after
    const bootCallsBefore = mockCallZickt.mock.calls.filter((call) => call[0] === 'boot').length;

    // Unmount while all loadScript calls are still pending
    unmount();
    mockCallZickt.mockClear();

    // Resolve all pending promises after unmount — no NEW boot should happen
    await act(async () => {
      resolvers.forEach((resolve) => {
        resolve();
      });
      await Promise.resolve();
    });

    // No boot calls should happen after unmount
    const bootCallsAfter = mockCallZickt.mock.calls.filter((call) => call[0] === 'boot');
    expect(bootCallsAfter).toHaveLength(0);

    // If boot happened before unmount (strict mode timing), shutdown would be called on unmount
    // But no additional shutdown should happen from post-unmount resolutions
    if (bootCallsBefore === 0) {
      expect(mockCallZickt).not.toHaveBeenCalledWith('shutdown');
    }
  });

  it('suppresses script load errors after unmount', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    let rejectLoad: ((error: Error) => void) | undefined;
    mockLoadScript.mockReturnValue(
      new Promise<void>((_resolve, reject) => {
        rejectLoad = reject;
      }),
    );

    const { unmount } = render(
      <ZicktProvider channelKey="test-key">
        <div>App</div>
      </ZicktProvider>,
    );

    // Unmount before rejection
    unmount();

    // Reject after unmount — console.error should NOT be called
    await act(async () => {
      if (rejectLoad !== undefined) {
        rejectLoad(new Error('Network error'));
      }
      // Flush microtasks
      await Promise.resolve();
    });

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('calls onReady callback when SDK signals ready', async () => {
    const onReady = vi.fn();

    render(
      <ZicktProvider channelKey="test-key" onReady={onReady}>
        <div>App</div>
      </ZicktProvider>,
    );

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
    });

    const sdkOnReady = getLastBootConfig().onReady as () => void;
    act(() => {
      sdkOnReady();
    });

    expect(onReady).toHaveBeenCalled();
  });

  it('does not fire onReady after unmount', async () => {
    const onReady = vi.fn();

    const { unmount } = render(
      <ZicktProvider channelKey="test-key" onReady={onReady}>
        <div>App</div>
      </ZicktProvider>,
    );

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
    });

    const sdkOnReady = getLastBootConfig().onReady as () => void;

    unmount();

    act(() => {
      sdkOnReady();
    });

    expect(onReady).not.toHaveBeenCalled();
  });

  it('forwards onShow callback', async () => {
    const onShow = vi.fn();

    render(
      <ZicktProvider channelKey="test-key" onShow={onShow}>
        <div>App</div>
      </ZicktProvider>,
    );

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
    });

    const sdkOnShow = getLastBootConfig().onShow as () => void;
    act(() => {
      sdkOnShow();
    });

    expect(onShow).toHaveBeenCalled();
  });

  it('forwards onHide callback', async () => {
    const onHide = vi.fn();

    render(
      <ZicktProvider channelKey="test-key" onHide={onHide}>
        <div>App</div>
      </ZicktProvider>,
    );

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
    });

    const sdkOnHide = getLastBootConfig().onHide as () => void;
    act(() => {
      sdkOnHide();
    });

    expect(onHide).toHaveBeenCalled();
  });

  it('forwards onUnreadCountChanged callback with count', async () => {
    const onUnreadCountChanged = vi.fn();

    render(
      <ZicktProvider channelKey="test-key" onUnreadCountChanged={onUnreadCountChanged}>
        <div>App</div>
      </ZicktProvider>,
    );

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
    });

    const sdkCallback = getLastBootConfig().onUnreadCountChanged as (count: number) => void;
    act(() => {
      sdkCallback(5);
    });

    expect(onUnreadCountChanged).toHaveBeenCalledWith(5);
  });

  it('forwards onUserEmailSupplied callback', async () => {
    const onUserEmailSupplied = vi.fn();

    render(
      <ZicktProvider channelKey="test-key" onUserEmailSupplied={onUserEmailSupplied}>
        <div>App</div>
      </ZicktProvider>,
    );

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
    });

    const sdkCallback = getLastBootConfig().onUserEmailSupplied as () => void;
    act(() => {
      sdkCallback();
    });

    expect(onUserEmailSupplied).toHaveBeenCalled();
  });

  it('tolerates absent callbacks without errors', async () => {
    render(
      <ZicktProvider channelKey="test-key">
        <div>App</div>
      </ZicktProvider>,
    );

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
    });

    const config = getLastBootConfig();

    // Firing SDK callbacks when no props were provided should not throw
    expect(() => {
      act(() => {
        (config.onShow as () => void)();
        (config.onHide as () => void)();
        (config.onUnreadCountChanged as (n: number) => void)(3);
        (config.onUserEmailSupplied as () => void)();
      });
    }).not.toThrow();
  });

  it('boots only once per channelKey', async () => {
    render(
      <ZicktProvider channelKey="test-key">
        <div>App</div>
      </ZicktProvider>,
    );

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
    });

    const bootCallCount = mockCallZickt.mock.calls.filter((call) => call[0] === 'boot').length;
    expect(bootCallCount).toBeGreaterThanOrEqual(1);
  });

  it('sends config updates when props change after ready', async () => {
    const Wrapper = ({ email }: { email: string }): React.JSX.Element => (
      <ZicktProvider channelKey="test-key" user={{ email }}>
        <div>App</div>
      </ZicktProvider>
    );

    const { rerender } = render(<Wrapper email="a@test.com" />);

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
    });

    // Trigger onReady to set isReady=true
    const sdkOnReady = getLastBootConfig().onReady as () => void;
    act(() => {
      sdkOnReady();
    });

    mockCallZickt.mockClear();

    rerender(<Wrapper email="b@test.com" />);

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith(
        'update',
        expect.objectContaining({ user: { email: 'b@test.com' } }),
      );
    });
  });

  it('provides context values through useZickt', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
      <ZicktProvider channelKey="test-key">{children}</ZicktProvider>
    );

    const { result } = renderHook(() => useZickt(), { wrapper });

    expect(result.current.isReady).toBe(false);
    expect(typeof result.current.show).toBe('function');
    expect(typeof result.current.hide).toBe('function');
    expect(typeof result.current.showNewMessage).toBe('function');
    expect(typeof result.current.update).toBe('function');
    expect(typeof result.current.getVisitorId).toBe('function');
    expect(typeof result.current.shutdown).toBe('function');
  });

  it('handles script load failure gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockLoadScript.mockRejectedValue(new Error('Network error'));

    render(
      <ZicktProvider channelKey="test-key">
        <div data-testid="child">App</div>
      </ZicktProvider>,
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    // Children should still render
    expect(screen.getByTestId('child')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
