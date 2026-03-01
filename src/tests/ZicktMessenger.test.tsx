import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ZicktMessenger } from '../ZicktMessenger';

vi.mock('../script-loader', () => ({
  loadZicktScript: vi.fn().mockResolvedValue(undefined),
  callZickt: vi.fn(),
  resetLoader: vi.fn(),
}));

import { callZickt, loadZicktScript } from '../script-loader';

const mockLoadScript = vi.mocked(loadZicktScript);
const mockCallZickt = vi.mocked(callZickt);

describe('ZicktMessenger', () => {
  beforeEach(() => {
    mockLoadScript.mockResolvedValue(undefined);
    mockCallZickt.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without visible output', () => {
    const { container } = render(<ZicktMessenger channelKey="test-key" />);
    expect(container.textContent).toBe('');
  });

  it('loads the script and boots the SDK', async () => {
    render(<ZicktMessenger channelKey="test-key" />);

    await waitFor(() => {
      expect(mockLoadScript).toHaveBeenCalled();
    });

    expect(mockCallZickt).toHaveBeenCalledWith(
      'boot',
      expect.objectContaining({ channel_key: 'test-key' }),
    );
  });

  it('passes user and appearance config to boot', async () => {
    render(
      <ZicktMessenger
        channelKey="test-key"
        user={{ email: 'user@test.com', name: 'Test User' }}
        appearance={{ position: 'bottom-left', theme: 'dark' }}
      />,
    );

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith(
        'boot',
        expect.objectContaining({
          channel_key: 'test-key',
          user: { email: 'user@test.com', name: 'Test User' },
          appearance: { position: 'bottom-left', theme: 'dark' },
        }),
      );
    });
  });

  it('passes company config to boot', async () => {
    render(<ZicktMessenger channelKey="test-key" company={{ name: 'Acme Inc', id: 'acme-123' }} />);

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith(
        'boot',
        expect.objectContaining({
          company: { name: 'Acme Inc', id: 'acme-123' },
        }),
      );
    });
  });

  it('passes hideDefaultLauncher and customLauncherSelector', async () => {
    render(
      <ZicktMessenger
        channelKey="test-key"
        hideDefaultLauncher={true}
        customLauncherSelector="#my-button"
      />,
    );

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith(
        'boot',
        expect.objectContaining({
          hideDefaultLauncher: true,
          customLauncherSelector: '#my-button',
        }),
      );
    });
  });

  it('shuts down on unmount', async () => {
    const { unmount } = render(<ZicktMessenger channelKey="test-key" />);

    await waitFor(() => {
      expect(mockCallZickt).toHaveBeenCalledWith('boot', expect.any(Object));
    });

    unmount();

    expect(mockCallZickt).toHaveBeenCalledWith('shutdown');
  });

  it('wires up callback props', async () => {
    const onReady = vi.fn();
    const onShow = vi.fn();
    const onHide = vi.fn();

    render(
      <ZicktMessenger channelKey="test-key" onReady={onReady} onShow={onShow} onHide={onHide} />,
    );

    await waitFor(() => {
      const bootCall = mockCallZickt.mock.calls.find((call) => call[0] === 'boot');
      expect(bootCall).toBeDefined();
      const config = bootCall?.[1] as Record<string, unknown>;
      expect(typeof config.onReady).toBe('function');
      expect(typeof config.onShow).toBe('function');
      expect(typeof config.onHide).toBe('function');
    });
  });
});
