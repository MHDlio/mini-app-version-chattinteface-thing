import WebApp from '@twa-dev/sdk';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface PopupParams {
  title?: string;
  message: string;
  buttons?: Array<{ type: string; text: string }>;
}

export const telegram = {
  ready: typeof window !== 'undefined' && WebApp.isInitialized,
  close: () => WebApp.close(),
  expand: () => WebApp.expand(),
  showPopup: (params: PopupParams) => 
    WebApp.showPopup(params),
  user: WebApp.initDataUnsafe?.user as TelegramUser | undefined,
  setHeaderColor: (color: string) => WebApp.setHeaderColor(color),
  setBackgroundColor: (color: string) => WebApp.setBackgroundColor(color),
};

export const isTelegramWebApp = typeof window !== 'undefined' && window.Telegram?.WebApp;