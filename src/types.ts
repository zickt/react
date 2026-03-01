/**
 * React SDK types for Zickt.
 *
 * These types are intentionally defined independently from `@zickt/messenger-sdk`.
 * The React package ships as a standalone npm package (`@zickt/react`) that must
 * not depend on monorepo siblings. The key differences from the SDK types:
 *
 * - `channelKey` (camelCase) instead of `channel_key` (snake_case) — React convention
 * - Callbacks are a separate `ZicktCallbacks` interface, not inline on the config
 * - Only a curated subset of commands is exposed (see `ReactCommand` in script-loader.ts)
 *
 * Contract tests in `tests/sdk-contract.types.ts` (compile-time) and
 * `tests/sdk-contract.test.ts` (runtime) verify bidirectional type compatibility
 * with `@zickt/messenger-sdk`. If either package's types drift, those tests fail.
 */

import type { CSSColor, CSSFontFamily, CSSLength, CSSZIndex } from './css';

export interface ZicktUser {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface ZicktCompany {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

/** Payload for `identify()` — associates known user/company data with the visitor */
export interface ZicktIdentifyPayload {
  // Core identity
  id?: string;
  email?: string;
  phone?: string;
  // Contact fields
  name?: string;
  avatar?: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  signedUpAt?: string;
  // Custom attributes
  custom?: Record<string, string | number | boolean | null>;
  // Company
  company?: {
    id?: string;
    name?: string;
    domain?: string;
    industry?: string;
    size?: string;
    plan?: string;
    monthlySpend?: number;
    custom?: Record<string, string | number | boolean | null>;
  };
  // Security — JWT from your backend
  identityToken?: string;
}

export interface ZicktAppearance {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  // Tier 1 — Brand Cohesion
  /** Primary brand color (e.g., '#0066CC', 'rgb(0, 102, 204)') */
  primaryColor?: CSSColor;
  /** Font family for all messenger text (e.g., '"Inter", sans-serif') */
  fontFamily?: CSSFontFamily;
  /** Border radius for launcher, chat window, and message bubbles (e.g., '16px', '1rem') */
  borderRadius?: CSSLength;
  /** Background color of agent message bubbles */
  agentBubbleColor?: CSSColor;
  /** Background color of visitor message bubbles (defaults to primaryColor) */
  customerBubbleColor?: CSSColor;
  /** URL to your company logo, displayed in the messenger header */
  logoUrl?: string;
  // Tier 2 — Polish
  /** Chat window width (e.g., '380px', '24rem') */
  chatWindowWidth?: CSSLength;
  /** Chat window height (e.g., '640px', '40rem') */
  chatWindowHeight?: CSSLength;
  /** CSS z-index for the messenger (default: 2147483647) */
  zIndex?: CSSZIndex;
  /** URL to a custom launcher icon image */
  customLauncherIcon?: string;
  /** Header background color */
  headerBackgroundColor?: CSSColor;
  /** Expand messenger to fullscreen on mobile devices */
  mobileFullscreen?: boolean;
}

export interface ZicktConfig {
  channelKey: string;
  user?: ZicktUser;
  company?: ZicktCompany;
  appearance?: ZicktAppearance;
  customLauncherSelector?: string;
  hideDefaultLauncher?: boolean;
}

export interface ZicktCallbacks {
  onReady?: () => void;
  onShow?: () => void;
  onHide?: () => void;
  onUnreadCountChanged?: (count: number) => void;
  onUserEmailSupplied?: () => void;
}

export interface ZicktContextValue {
  isReady: boolean;
  show: () => void;
  hide: () => void;
  showNewMessage: (message?: string) => void;
  update: (config: Partial<ZicktConfig>) => void;
  identify: (payload: ZicktIdentifyPayload) => void;
  logout: () => void;
  getVisitorId: () => string | undefined;
  shutdown: () => void;
}

export interface ZicktProviderProps extends ZicktConfig, ZicktCallbacks {
  children: React.ReactNode;
}

export type ZicktMessengerProps = ZicktConfig & ZicktCallbacks;
