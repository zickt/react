# @zickt/react

[![npm version](https://img.shields.io/npm/v/@zickt/react.svg)](https://www.npmjs.com/package/@zickt/react)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@zickt/react)](https://bundlephobia.com/package/@zickt/react)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/types-included-blue.svg)](https://www.npmjs.com/package/@zickt/react)
[![npm provenance](https://img.shields.io/badge/provenance-verified-brightgreen.svg)](https://docs.npmjs.com/generating-provenance-statements)
[![100% Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](#quality)

Official React SDK for [Zickt](https://zickt.com) — add a [customer messaging widget](https://zickt.com) to your React app in one line.

[Zickt](https://zickt.com) is a modern customer communication platform for support, sales, and engagement. This package provides React components and hooks for embedding the [Zickt live chat widget](https://zickt.com) into any React application.

## Install

```bash
npm install @zickt/react
```

## Quick Start

```tsx
import { ZicktMessenger } from '@zickt/react';

function App() {
  return (
    <>
      <YourApp />
      <ZicktMessenger channelKey="your-channel-key" />
    </>
  );
}
```

That's it. The messenger widget loads from Zickt's CDN and appears on your page. Get your channel key from the [Zickt dashboard](https://zickt.com).

## With Hooks

Use `ZicktProvider` and `useZickt` when you need programmatic control — showing/hiding the messenger or reading state.

```tsx
import { ZicktProvider, useZickt } from '@zickt/react';

function App() {
  return (
    <ZicktProvider channelKey="your-channel-key" user={{ email: 'user@example.com', name: 'Jane' }}>
      <Dashboard />
    </ZicktProvider>
  );
}

function Dashboard() {
  const { show, hide, isReady } = useZickt();

  return (
    <div>
      <button onClick={() => show()}>Open Chat</button>
      <button onClick={() => hide()}>Close Chat</button>
    </div>
  );
}
```

## API

### `<ZicktMessenger />`

Drop-in component. Renders nothing visually — the messenger widget is injected by the SDK.

| Prop                     | Type                      | Description                                               |
| ------------------------ | ------------------------- | --------------------------------------------------------- |
| `channelKey`             | `string`                  | **Required.** Your [Zickt](https://zickt.com) channel key |
| `user`                   | `ZicktUser`               | Identify the current user                                 |
| `company`                | `ZicktCompany`            | Associate a company                                       |
| `appearance`             | `ZicktAppearance`         | Position and theme                                        |
| `hideDefaultLauncher`    | `boolean`                 | Hide the default chat button                              |
| `customLauncherSelector` | `string`                  | CSS selector for a custom launcher element                |
| `onReady`                | `() => void`              | Called when the messenger is fully loaded                 |
| `onShow`                 | `() => void`              | Called when the messenger opens                           |
| `onHide`                 | `() => void`              | Called when the messenger closes                          |
| `onUnreadCountChanged`   | `(count: number) => void` | Called when unread count changes                          |

### `<ZicktProvider />`

Wraps your app and provides context to `useZickt`. Accepts all the same props as `ZicktMessenger` plus `children`.

```tsx
<ZicktProvider channelKey="your-channel-key" user={{ email: 'user@example.com' }}>
  {children}
</ZicktProvider>
```

### `useZickt()`

Hook for programmatic control. Must be used inside a `ZicktProvider`.

```tsx
const {
  isReady, // boolean — true when messenger has loaded
  show, // () => void — open the messenger
  hide, // () => void — close the messenger
  showNewMessage, // (message?: string) => void — open with a pre-filled message
  update, // (config: Partial<ZicktConfig>) => void — update config at runtime
  getVisitorId, // () => string | undefined — get the current visitor ID
  shutdown, // () => void — shut down the messenger
} = useZickt();
```

## Types

All types are exported for use in your application:

```tsx
import type {
  ZicktConfig,
  ZicktUser,
  ZicktCompany,
  ZicktAppearance,
  ZicktCallbacks,
  ZicktContextValue,
  ZicktProviderProps,
  ZicktMessengerProps,
} from '@zickt/react';
```

### `ZicktUser`

```typescript
interface ZicktUser {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  [key: string]: unknown; // custom attributes
}
```

### `ZicktAppearance`

```typescript
interface ZicktAppearance {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
}
```

## Resources

- [Documentation](https://zickt.com/docs/channels/messenger/react) — full React SDK reference and guides
- [Zickt website](https://zickt.com) — create a free account and get your channel key

## Requirements

- React 18 or 19
- A [Zickt](https://zickt.com) account and channel key

## Quality

This package enforces strict quality gates on every release:

- **100% test coverage** — statements, branches, functions, lines (48 tests)
- **Bundle size limit** — under 3 kB minified + brotli
- **Strict TypeScript** — no `any`, explicit return types, strict boolean expressions
- **28 ESLint rules** — all as error, including type-aware async/condition correctness
- **Type validation** — [publint](https://publint.dev), [attw](https://arethetypeswrong.github.io), [tsd](https://github.com/tsdjs/tsd)
- **npm provenance** — cryptographically signed builds linked to source

## License

[MIT](./LICENSE)
