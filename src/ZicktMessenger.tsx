import { ZicktProvider } from './ZicktProvider';
import type { ZicktMessengerProps } from './types';

/**
 * Drop-in messenger component for simple usage without hooks.
 *
 * Renders nothing visually — the messenger widget is injected into the page
 * by the SDK loaded from the CDN.
 *
 * For hook access (show/hide, etc.), use ZicktProvider + useZickt instead.
 */
export function ZicktMessenger(props: ZicktMessengerProps): React.JSX.Element {
  return (
    <ZicktProvider {...props}>
      <></>
    </ZicktProvider>
  );
}
