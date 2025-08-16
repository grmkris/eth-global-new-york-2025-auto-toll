export function getMessage(source: string): string {
  return `Hello from ${source}!`;
}

export function formatMessage(message: string): string {
  return `[${new Date().toISOString()}] ${message}`;
}

export const CONFIG = {
  appName: "ETH Global Monorepo",
  version: "1.0.0"
} as const;