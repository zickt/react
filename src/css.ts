/**
 * CSS type aliases for the React SDK.
 *
 * These mirror the same aliases in `@zickt/messenger-types/css` but are defined
 * independently so the published `@zickt/react` package has no monorepo dependency.
 */

/** CSS color value (e.g., '#FF0000', 'rgb(255,0,0)', 'hsl(0 100% 50%)', 'red') */
export type CSSColor = string;

/** CSS length value — must include units (e.g., '16px', '1rem', '50%', 'calc(100% - 20px)') */
export type CSSLength = string;

/** CSS font-family value (e.g., '"Inter", sans-serif') */
export type CSSFontFamily = string;

/** CSS z-index value */
export type CSSZIndex = number;
