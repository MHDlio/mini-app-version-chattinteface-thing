import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Settings,
  Users,
  History,
  HelpCircle,
  type Icon as LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactElement;
  badge?: number;
}

export const DashboardIcon = () => <LayoutDashboard size={20} />;
export const FormsIcon = () => <FileText size={20} />;
export const UploadsIcon = () => <Upload size={20} />;
export const SettingsIcon = () => <Settings size={20} />;
export const UsersIcon = () => <Users size={20} />;
export const HistoryIcon = () => <History size={20} />;
export const HelpIcon = () => <HelpCircle size={20} />;

export const getNavigationItems = (t: (key: string) => string): NavigationItem[] => [
  {
    label: t('navigation.dashboard'),
    href: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: t('navigation.forms'),
    href: '/forms',
    icon: <FormsIcon />,
  },
  {
    label: t('navigation.uploads'),
    href: '/uploads',
    icon: <UploadsIcon />,
    badge: 3, // Example: Show number of pending uploads
  },
  {
    label: t('navigation.users'),
    href: '/users',
    icon: <UsersIcon />,
  },
  {
    label: t('navigation.history'),
    href: '/history',
    icon: <HistoryIcon />,
  },
  {
    label: t('navigation.help'),
    href: '/help',
    icon: <HelpIcon />,
  },
];
