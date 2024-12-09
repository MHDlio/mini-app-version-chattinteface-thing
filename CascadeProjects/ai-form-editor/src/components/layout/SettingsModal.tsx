import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check, Loader2 } from 'lucide-react';
import { useTheme } from '../../hooks/useThemeToggle';
import { useAuth } from '../../hooks/useAuth';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, updateUserPreferences, isLoading } = useAuth();

  // State management for settings
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [notifications, setNotifications] = useState({
    email: user?.preferences?.notifications?.email ?? true,
    inApp: user?.preferences?.notifications?.inApp ?? true,
    marketing: user?.preferences?.notifications?.marketing ?? false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when user preferences change
  useEffect(() => {
    if (user?.preferences) {
      setSelectedLanguage(user.preferences.language);
      setSelectedTheme(user.preferences.theme);
      setNotifications(user.preferences.notifications);
    }
  }, [user?.preferences]);

  const languages = [
    { code: 'en', label: 'English', dir: 'ltr' },
    { code: 'de', label: 'Deutsch', dir: 'ltr' },
    { code: 'ar', label: 'العربية', dir: 'rtl' },
  ];

  const themes = [
    { value: 'light', label: t('settings.theme.light'), icon: 'sun' },
    { value: 'dark', label: t('settings.theme.dark'), icon: 'moon' },
    { value: 'system', label: t('settings.theme.system'), icon: 'laptop' },
  ];

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Update user preferences through the auth hook
      await updateUserPreferences({
        language: selectedLanguage,
        theme: selectedTheme as 'light' | 'dark' | 'system',
        notifications,
      });

      // Apply changes
      i18n.changeLanguage(selectedLanguage);
      setTheme(selectedTheme as 'light' | 'dark' | 'system');
      document.documentElement.dir = languages.find(l => l.code === selectedLanguage)?.dir || 'ltr';
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.error.save'));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = (type: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg sm:rounded-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        aria-describedby="settings-modal-description"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 id="settings-modal-title" className="text-lg font-semibold">
              {t('settings.title')}
            </h2>
            <p id="settings-modal-description" className="text-sm text-muted-foreground">
              {t('settings.description')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="my-6 space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Language Settings */}
          <div className="space-y-2">
            <h3 className="font-medium">{t('settings.language.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('settings.language.description')}</p>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                    selectedLanguage === lang.code
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent focus:bg-accent'
                  }`}
                  aria-pressed={selectedLanguage === lang.code}
                >
                  {lang.label}
                  {selectedLanguage === lang.code && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-2">
            <h3 className="font-medium">{t('settings.theme.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('settings.theme.description')}</p>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => setSelectedTheme(themeOption.value)}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                    selectedTheme === themeOption.value
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent focus:bg-accent'
                  }`}
                  aria-pressed={selectedTheme === themeOption.value}
                >
                  {themeOption.label}
                  {selectedTheme === themeOption.value && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-2">
            <h3 className="font-medium">{t('settings.notifications.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('settings.notifications.description')}</p>
            <div className="space-y-2">
              {(Object.keys(notifications) as Array<keyof typeof notifications>).map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
                    checked={notifications[type]}
                    onChange={() => toggleNotification(type)}
                    aria-label={t(`settings.notifications.${type}`)}
                  />
                  <span className="text-sm">
                    {t(`settings.notifications.${type}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isSaving}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
