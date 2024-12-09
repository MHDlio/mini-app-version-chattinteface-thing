import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Menu, X, Settings, LogOut } from 'lucide-react';
import { useTheme } from '../../hooks/useThemeToggle';
import SettingsModal from './SettingsModal';
import { getNavigationItems, type NavigationItem } from './NavigationIcons';
import { useAuth } from '../../hooks/useAuth';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigationItems = getNavigationItems(t);

  useEffect(() => {
    // Simulate loading user settings
    const loadUserSettings = async () => {
      try {
        setIsLoading(true);
        // Fetch user settings from backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (err) {
        setError(t('errors.loadingSettings'));
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [t]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-destructive">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={i18n.dir()}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <button
              className="mr-2 px-2 text-muted-foreground hover:text-foreground lg:hidden"
              onClick={toggleSidebar}
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? t('navigation.closeSidebar') : t('navigation.openSidebar')}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <a href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl gradient-primary bg-clip-text text-transparent">
                {t('app.title')}
              </span>
            </a>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-2 py-2 rounded-md hover:bg-accent"
              aria-label={theme === 'dark' ? t('settings.theme.light') : t('settings.theme.dark')}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2 py-2 rounded-md hover:bg-accent"
              aria-label={t('settings.title')}
            >
              <Settings size={20} />
            </button>
            {user && (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent">
                  <img
                    src={user.profilePicture || '/default-avatar.png'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden md:inline-block">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 py-1 bg-background border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-2 text-sm hover:bg-accent"
                  >
                    <LogOut size={16} className="mr-2" />
                    {t('auth.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:w-64 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
      >
        <div className="h-14 flex items-center justify-center border-b">
          <span className="font-semibold">{t('navigation.title')}</span>
        </div>
        <nav className="space-y-1 p-4">
          {navigationItems.map((item: NavigationItem) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center p-2 rounded-md hover:bg-accent group relative"
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
              {item.badge && (
                <span className="absolute right-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 container py-6 lg:ml-64">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          {children}
        </div>
      </main>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
          role="presentation"
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};

export default AppLayout;
