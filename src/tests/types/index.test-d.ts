import { expectAssignable, expectError, expectNotAssignable, expectType } from 'tsd';

import type {
  ZicktAppearance,
  ZicktCallbacks,
  ZicktConfig,
  ZicktContextValue,
  ZicktMessengerProps,
  ZicktProviderProps,
  ZicktUser,
} from '../../types';

// ---------------------------------------------------------------------------
// ZicktContextValue
// ---------------------------------------------------------------------------
declare const ctx: ZicktContextValue;
expectType<boolean>(ctx.isReady);
expectType<() => void>(ctx.show);
expectType<() => void>(ctx.hide);
expectType<(message?: string) => void>(ctx.showNewMessage);
expectType<() => string | undefined>(ctx.getVisitorId);
expectType<() => void>(ctx.shutdown);

// ---------------------------------------------------------------------------
// ZicktConfig
// ---------------------------------------------------------------------------
// channelKey is required
expectError<ZicktConfig>({});
expectAssignable<ZicktConfig>({ channelKey: 'abc' });

// ---------------------------------------------------------------------------
// ZicktMessengerProps — requires channelKey
// ---------------------------------------------------------------------------
expectError<ZicktMessengerProps>({});

// ---------------------------------------------------------------------------
// ZicktProviderProps — requires channelKey and children
// ---------------------------------------------------------------------------
expectError<ZicktProviderProps>({});
expectError<ZicktProviderProps>({ channelKey: 'abc' }); // missing children

// ---------------------------------------------------------------------------
// ZicktAppearance
// ---------------------------------------------------------------------------
expectError<ZicktAppearance>({ position: 'center' });
expectAssignable<ZicktAppearance>({ position: 'bottom-right', theme: 'dark' });
expectAssignable<ZicktAppearance>({}); // all fields optional

// Tier 1 — Brand Cohesion
expectAssignable<ZicktAppearance>({ primaryColor: '#0066CC' });
expectAssignable<ZicktAppearance>({ fontFamily: '"Inter", sans-serif' });
expectAssignable<ZicktAppearance>({ borderRadius: '16px' });
expectAssignable<ZicktAppearance>({ agentBubbleColor: '#F3F4F6' });
expectAssignable<ZicktAppearance>({ customerBubbleColor: 'rgb(0, 102, 204)' });
expectAssignable<ZicktAppearance>({ logoUrl: 'https://example.com/logo.png' });

// Tier 2 — Polish
expectAssignable<ZicktAppearance>({ chatWindowWidth: '400px' });
expectAssignable<ZicktAppearance>({ chatWindowHeight: '700px' });
expectAssignable<ZicktAppearance>({ zIndex: 999999 });
expectAssignable<ZicktAppearance>({ customLauncherIcon: 'https://example.com/icon.svg' });
expectAssignable<ZicktAppearance>({ headerBackgroundColor: '#1a1a2e' });
expectAssignable<ZicktAppearance>({ mobileFullscreen: true });

// CSSLength must be a string with units, not a bare number
expectError<ZicktAppearance>({ borderRadius: 16 });
expectError<ZicktAppearance>({ chatWindowWidth: 400 });
expectError<ZicktAppearance>({ chatWindowHeight: 700 });

// zIndex must be a number, not a string
expectError<ZicktAppearance>({ zIndex: '999' });

// ---------------------------------------------------------------------------
// ZicktUser — supports custom attributes via index signature
// ---------------------------------------------------------------------------
expectAssignable<ZicktUser>({ email: 'a@b.com', customField: 123 });
expectNotAssignable<ZicktUser>({ email: 42 }); // email must be string

// ---------------------------------------------------------------------------
// ZicktCallbacks — all callbacks are optional
// ---------------------------------------------------------------------------
expectAssignable<ZicktCallbacks>({});
expectAssignable<ZicktCallbacks>({ onReady: () => undefined });
expectError<ZicktCallbacks>({ onReady: 'not-a-function' });
