import { Inbox, Search, Settings, LucideIcon, Link, Globe } from 'lucide-react';

// Define route configuration type
export interface RouteConfig {
  title: string;
  path: string;
  icon: LucideIcon;
  component: React.ComponentType;
}

// Import page components
import ReplaceLink from '../pages/ReplaceLink';
import RequestForward from '../pages/RequestForward';
import SearchPage from '../pages/Search';
import SettingsPage from '../pages/Settings';

// Define routes configuration
export const routes: RouteConfig[] = [
  {
    title: '替换链接',
    path: '/replace-link',
    icon: Link,
    component: ReplaceLink,
  },
  {
    title: '代理',
    path: '/proxy',
    icon: Globe,
    component: RequestForward,
  },

  {
    title: 'Search',
    path: '/search',
    icon: Search,
    component: SearchPage,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
    component: SettingsPage,
  },
];
