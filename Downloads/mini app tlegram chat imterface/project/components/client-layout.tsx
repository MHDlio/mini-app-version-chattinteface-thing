'use client';

import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/hooks/use-language';
import { NextFont } from 'next/dist/compiled/@next/font';
import { MiniAppProvider } from '@/components/telegram/mini-app-provider';
import { MiniAppLayout } from '@/components/telegram/mini-app-layout';
import { useEffect, useState } from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
  inter: NextFont;
}

export function ClientLayout({ children, inter }: ClientLayoutProps) {
  const { currentLanguage, isRTL } = useLanguage();
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  useEffect(() => {
    setIsTelegramWebApp(!!window.Telegram?.WebApp);
  }, []);

  const content = (
    <>
      {!isTelegramWebApp && (
        <header className="fixed top-0 right-0 p-4 z-50">
          <LanguageSwitcher />
        </header>
      )}
      {children}
    </>
  );

  return (
    <html lang={currentLanguage} dir={isRTL ? 'rtl' : 'ltr'}>
      <body 
        className={`${inter.className} antialiased`}
        style={{
          margin: 0,
          padding: 0,
          height: '100vh',
          backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
          color: 'var(--tg-theme-text-color, #000000)',
        }}
      >
        {isTelegramWebApp ? (
          <MiniAppProvider>
            <MiniAppLayout>
              {content}
            </MiniAppLayout>
          </MiniAppProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}