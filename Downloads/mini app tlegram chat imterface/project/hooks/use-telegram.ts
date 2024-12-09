import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<typeof window.Telegram.WebApp | null>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const app = window.Telegram.WebApp;
      app.ready();
      setWebApp(app);
      setIsReady(true);

      // Sync theme with Telegram
      setTheme(app.colorScheme);

      // Apply Telegram theme colors
      document.documentElement.style.setProperty('--tg-theme-bg-color', app.backgroundColor);
      document.documentElement.style.setProperty('--tg-theme-text-color', app.themeParams.text_color);
      document.documentElement.style.setProperty('--tg-theme-hint-color', app.themeParams.hint_color);
      document.documentElement.style.setProperty('--tg-theme-link-color', app.themeParams.link_color);
      document.documentElement.style.setProperty('--tg-theme-button-color', app.themeParams.button_color);
      document.documentElement.style.setProperty('--tg-theme-button-text-color', app.themeParams.button_text_color);
    }
  }, [setTheme]);

  const showConfirm = async (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!webApp) {
        resolve(window.confirm(message));
        return;
      }
      webApp.showConfirm(message, (confirmed) => resolve(confirmed));
    });
  };

  const showAlert = async (message: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!webApp) {
        window.alert(message);
        resolve();
        return;
      }
      webApp.showAlert(message, () => resolve());
    });
  };

  const shareData = async (data: any) => {
    if (!webApp) {
      // Fallback for non-Telegram environment
      if (navigator.share) {
        try {
          await navigator.share(data);
          return true;
        } catch (err) {
          return false;
        }
      }
      return false;
    }

    try {
      webApp.sendData(JSON.stringify(data));
      return true;
    } catch (err) {
      return false;
    }
  };

  const hapticFeedback = {
    success: () => webApp?.HapticFeedback?.notificationOccurred('success'),
    error: () => webApp?.HapticFeedback?.notificationOccurred('error'),
    warning: () => webApp?.HapticFeedback?.notificationOccurred('warning'),
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => 
      webApp?.HapticFeedback?.impactOccurred(style),
    selection: () => webApp?.HapticFeedback?.selectionChanged(),
  };

  const mainButton = {
    show: (text: string) => {
      if (webApp?.MainButton) {
        webApp.MainButton.text = text;
        webApp.MainButton.show();
      }
    },
    hide: () => webApp?.MainButton?.hide(),
    showProgress: () => webApp?.MainButton?.showProgress(false),
    hideProgress: () => webApp?.MainButton?.hideProgress(),
    onClick: (callback: () => void) => webApp?.MainButton?.onClick(callback),
    offClick: (callback: () => void) => webApp?.MainButton?.offClick(callback),
  };

  return {
    isReady,
    webApp,
    showConfirm,
    showAlert,
    shareData,
    hapticFeedback,
    mainButton,
    platform: webApp?.platform || 'web',
    colorScheme: webApp?.colorScheme || 'light',
  };
}
