'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface MiniAppContext {
  initData: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date?: number;
    hash?: string;
  };
  launchParams: {
    startParam?: string;
    source?: 'profile' | 'keyboard' | 'inline' | 'menu' | 'inline_mode' | 'attachment';
  };
}

const MiniAppContext = createContext<MiniAppContext>({
  initData: {},
  launchParams: {},
});

export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [context, setContext] = useState<MiniAppContext>({
    initData: {},
    launchParams: {},
  });

  useEffect(() => {
    // Parse Telegram Web App init data
    const initDataRaw = searchParams.get('tgWebAppData');
    const startParam = searchParams.get('tgWebAppStartParam');
    const source = searchParams.get('source');

    if (initDataRaw) {
      try {
        const decodedData = decodeURIComponent(initDataRaw);
        const parsedData = Object.fromEntries(
          decodedData.split('&').map(item => item.split('='))
        );

        // Parse user data if present
        let user;
        if (parsedData.user) {
          user = JSON.parse(decodeURIComponent(parsedData.user));
        }

        setContext({
          initData: {
            query_id: parsedData.query_id,
            user,
            auth_date: Number(parsedData.auth_date),
            hash: parsedData.hash,
          },
          launchParams: {
            startParam,
            source: source as MiniAppContext['launchParams']['source'],
          },
        });
      } catch (error) {
        console.error('Failed to parse Telegram Web App init data:', error);
      }
    }

    // Initialize Telegram Mini App
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      // Expand to maximum height
      webApp.expand();

      // Enable closing confirmation if needed
      webApp.enableClosingConfirmation();

      // Set viewport height
      webApp.requestViewport({
        height: window.innerHeight,
      });

      // Ready to show
      webApp.ready();
    }
  }, [searchParams]);

  return (
    <MiniAppContext.Provider value={context}>
      {children}
    </MiniAppContext.Provider>
  );
}

export const useMiniApp = () => useContext(MiniAppContext);
