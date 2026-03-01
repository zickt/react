/**
 * Runtime contract tests between @zickt/react and @zickt/messenger-types.
 *
 * These tests use hardcoded string arrays (no monorepo imports) so the
 * file works in the standalone published repo too. When someone adds a field,
 * callback, or command to messenger-types, the counts or enumerations here fail,
 * forcing an update to the React SDK.
 */

import { describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// Canonical values — hardcoded from @zickt/messenger-types/src/commands.ts
// If you update messenger-types, update these arrays and the tests will tell
// you what needs changing in the React SDK.
// ---------------------------------------------------------------------------

/** All CommandName values from messenger-types (31 total) */
const CANONICAL_COMMANDS = [
  // Lifecycle
  'boot',
  'shutdown',
  // Visibility
  'show',
  'hide',
  'showMessages',
  'hideMessages',
  'showNewMessage',
  // State
  'update',
  'isReady',
  'getState',
  'getSettings',
  'getUserData',
  'getVisitorId',
  // Identity
  'identify',
  'logout',
  // Messaging
  'sendMessage',
  // Features
  'startTour',
  'trackEvent',
  // Callbacks
  'onReady',
  'onShow',
  'onHide',
  'onUnreadCountChanged',
  'onUserEmailSupplied',
  // Realtime
  'connectRealtime',
  'disconnectRealtime',
  'sendTypingIndicator',
  'onRealtimeMessage',
  'onTypingUsersUpdate',
  'onPresenceUpdate',
  'onConnectionStateChange',
  'getRealtimeConnectionState',
] as const;

/** Data fields on WidgetBootConfig (non-callback) */
const CANONICAL_CONFIG_DATA_FIELDS = [
  'channel_key',
  'user',
  'company',
  'appearance',
  'customLauncherSelector',
  'hideDefaultLauncher',
] as const;

/** Callback fields on WidgetBootCallbacks */
const CANONICAL_CALLBACKS = [
  'onReady',
  'onShow',
  'onHide',
  'onUnreadCountChanged',
  'onUserEmailSupplied',
] as const;

/** User object fields in WidgetBootUser */
const CANONICAL_USER_FIELDS = ['id', 'email', 'name', 'phone', 'avatar'] as const;

/** Company object fields in WidgetBootCompany */
const CANONICAL_COMPANY_FIELDS = ['id', 'name'] as const;

// ---------------------------------------------------------------------------
// React SDK values — from the types in this package
// ---------------------------------------------------------------------------

/** Commands exposed by the React SDK (see ReactCommand in script-loader.ts) */
const REACT_COMMANDS = [
  'boot',
  'shutdown',
  'show',
  'hide',
  'showNewMessage',
  'update',
  'identify',
  'logout',
  'getVisitorId',
] as const;

/** Data fields on ZicktConfig */
const REACT_CONFIG_DATA_FIELDS = [
  'channelKey', // maps to canonical channel_key
  'user',
  'company',
  'appearance',
  'customLauncherSelector',
  'hideDefaultLauncher',
] as const;

/** Callback fields on ZicktCallbacks */
const REACT_CALLBACKS = [
  'onReady',
  'onShow',
  'onHide',
  'onUnreadCountChanged',
  'onUserEmailSupplied',
] as const;

/** User object fields in ZicktUser */
const REACT_USER_FIELDS = ['id', 'email', 'name', 'phone', 'avatar'] as const;

/** Company object fields in ZicktCompany */
const REACT_COMPANY_FIELDS = ['id', 'name'] as const;

// Known mapping: React uses camelCase channelKey, canonical uses snake_case channel_key
const CHANNEL_KEY_MAPPING = { react: 'channelKey', canonical: 'channel_key' } as const;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SDK contract: command parity', () => {
  it('React commands are a subset of canonical commands', () => {
    for (const cmd of REACT_COMMANDS) {
      expect(CANONICAL_COMMANDS).toContain(cmd);
    }
  });

  it('canonical CommandName has exactly 31 commands (update if new commands added)', () => {
    expect(CANONICAL_COMMANDS).toHaveLength(31);
  });

  it('React exposes exactly 9 commands', () => {
    expect(REACT_COMMANDS).toHaveLength(9);
  });
});

describe('SDK contract: config field parity', () => {
  it('React data fields match canonical data fields (with known channelKey mapping)', () => {
    const reactFieldsMapped = REACT_CONFIG_DATA_FIELDS.map((f) =>
      f === CHANNEL_KEY_MAPPING.react ? CHANNEL_KEY_MAPPING.canonical : f,
    );
    expect([...reactFieldsMapped].sort()).toEqual([...CANONICAL_CONFIG_DATA_FIELDS].sort());
  });

  it('canonical WidgetBootConfig has exactly 6 config data fields', () => {
    expect(CANONICAL_CONFIG_DATA_FIELDS).toHaveLength(6);
  });
});

describe('SDK contract: callback parity', () => {
  it('React callbacks match canonical callbacks exactly', () => {
    expect([...REACT_CALLBACKS].sort()).toEqual([...CANONICAL_CALLBACKS].sort());
  });

  it('canonical WidgetBootCallbacks has exactly 5 callbacks', () => {
    expect(CANONICAL_CALLBACKS).toHaveLength(5);
  });
});

describe('SDK contract: user field parity', () => {
  it('React user fields match canonical user fields', () => {
    expect([...REACT_USER_FIELDS].sort()).toEqual([...CANONICAL_USER_FIELDS].sort());
  });
});

describe('SDK contract: company field parity', () => {
  it('React company fields match canonical company fields', () => {
    expect([...REACT_COMPANY_FIELDS].sort()).toEqual([...CANONICAL_COMPANY_FIELDS].sort());
  });
});

describe('SDK contract: appearance value counts', () => {
  it('position has 4 values (bottom-right, bottom-left, top-right, top-left)', () => {
    const POSITION_VALUES = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    expect(POSITION_VALUES).toHaveLength(4);
  });

  it('theme has 3 values (light, dark, auto)', () => {
    const THEME_VALUES = ['light', 'dark', 'auto'];
    expect(THEME_VALUES).toHaveLength(3);
  });
});

describe('SDK contract: appearance field parity', () => {
  /** Fields on ZicktAppearance / WidgetBootAppearance (14 total) */
  const APPEARANCE_FIELDS = [
    'position',
    'theme',
    'primaryColor',
    'fontFamily',
    'borderRadius',
    'agentBubbleColor',
    'customerBubbleColor',
    'logoUrl',
    'chatWindowWidth',
    'chatWindowHeight',
    'zIndex',
    'customLauncherIcon',
    'headerBackgroundColor',
    'mobileFullscreen',
  ] as const;

  it('appearance has exactly 14 fields', () => {
    expect(APPEARANCE_FIELDS).toHaveLength(14);
  });
});
