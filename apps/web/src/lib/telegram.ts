export type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  initData: string;
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
  HapticFeedback?: { impactOccurred: (style: string) => void };
  MainButton?: {
    setText: (t: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
};

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function getTelegram(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp;
}

export function initTelegram() {
  const tg = getTelegram();
  tg?.ready();
  tg?.expand();
  return tg;
}

export function getInitData(): string {
  return getTelegram()?.initData || "";
}
