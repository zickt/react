declare global {
  interface Window {
    Zickt?: (command: string, ...args: unknown[]) => unknown;
    zicktSettings?: Record<string, unknown>;
  }
}

export {};
