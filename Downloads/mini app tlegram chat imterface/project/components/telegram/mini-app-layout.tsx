'use client';

import { useEffect } from 'react';
import { useMiniApp } from './mini-app-provider';
import { useLanguage } from '@/hooks/use-language';
import { useTelegram } from '@/hooks/use-telegram';

interface MiniAppLayoutProps {
  children: React.ReactNode;
}

export function MiniAppLayout({ children }: MiniAppLayoutProps) {
  const { initData, launchParams } = useMiniApp();
  const { setLanguage } = useLanguage();
  const { webApp } = useTelegram();

  useEffect(() => {
    // Set language based on user's Telegram settings
    if (initData.user?.language_code) {
      setLanguage(initData.user.language_code);
    }

    // Apply Telegram theme colors
    if (webApp) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.backgroundColor);
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', webApp.themeParams.secondary_bg_color);
      document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color);
      document.documentElement.style.setProperty('--tg-theme-hint-color', webApp.themeParams.hint_color);
      document.documentElement.style.setProperty('--tg-theme-link-color', webApp.themeParams.link_color);
      document.documentElement.style.setProperty('--tg-theme-button-color', webApp.themeParams.button_color);
      document.documentElement.style.setProperty('--tg-theme-button-text-color', webApp.themeParams.button_text_color);
    }
  }, [initData.user, setLanguage, webApp]);

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--tg-theme-bg-color)',
        color: 'var(--tg-theme-text-color)',
      }}
    >
      {children}
    </div>
  );
}
