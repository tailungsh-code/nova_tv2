import React from 'react';
import {
  Grid,
  Heart,
  Home,
  Radio,
  Search,
  Settings,
  Wrench,
} from 'lucide-react';
import { OfflineIndicator } from '@/src/components/OfflineIndicator';
import { PWAInstallButton } from '@/src/components/PWAInstallButton';
import { useApp } from '@/src/context/AppContext';

export type NavSection =
  | 'home'
  | 'live'
  | 'categories'
  | 'favorites'
  | 'search'
  | 'settings'
  | 'admin'
  | 'watch'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'contact';

interface MainLayoutProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  activeSection,
  onNavigate,
  children,
}) => {
  const { t, dataSourceMode } = useApp();

  const navItems: {
    id: NavSection;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'home', label: t.nav.home, shortLabel: t.nav.home, icon: Home },
    { id: 'live', label: t.nav.liveTv, shortLabel: t.nav.liveTv, icon: Radio },
    {
      id: 'categories',
      label: t.nav.categories,
      shortLabel: t.nav.categories,
      icon: Grid,
    },
    {
      id: 'favorites',
      label: t.nav.favorites,
      shortLabel: t.nav.favorites,
      icon: Heart,
    },
    { id: 'search', label: t.nav.search, shortLabel: t.nav.search, icon: Search },
    {
      id: 'settings',
      label: t.nav.settings,
      shortLabel: t.nav.settings,
      icon: Settings,
    },
  ];

  const isPlayerView = activeSection === 'watch';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F6F8FC] dark:bg-[#080B14] text-slate-900 dark:text-white">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:start-0 z-30 bg-white dark:bg-[#0B101D] border-e border-slate-200 dark:border-white/[0.07] px-4 py-5 justify-between">
        <div className="space-y-7">
          {/* Brand Wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 px-2 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] rounded-xl"
          >
            <img
              src="./icon.svg"
              alt="NOVA TV"
              className="h-8 w-8 rounded-lg shrink-0"
            />
            <span className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              NOVA <span className="text-[#00D4FF]">TV</span>
            </span>
          </button>

          {/* Primary Navigation */}
          <nav className="space-y-1" aria-label="Primary Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#6C5CE7] text-white shadow-md shadow-[#6C5CE7]/25'
                      : 'text-slate-600 dark:text-[#A7B0C0] hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Links: Channel Admin + Data Status + PWA Install */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/[0.07]">
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            aria-current={activeSection === 'admin' ? 'page' : undefined}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeSection === 'admin'
                ? 'bg-[#6C5CE7]/15 text-[#6C5CE7] dark:text-[#00D4FF] border border-[#6C5CE7]/30'
                : 'text-slate-600 dark:text-[#A7B0C0] hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.nav.admin}</span>
          </button>

          <PWAInstallButton compact />

          <p className="px-2 text-[11px] text-slate-500 dark:text-[#A7B0C0]">
            {dataSourceMode === 'firebase'
              ? t.common.cloudSyncBadge
              : t.common.localDemoBadge}
          </p>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col lg:ps-60 min-w-0">
        {/* Compact Mobile Top Header (Hidden during fullscreen player view to maximize canvas) */}
        {!isPlayerView && (
          <header className="lg:hidden sticky top-0 z-30 h-12 pt-safe bg-white/90 dark:bg-[#080B14]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.07] px-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <img src="./icon.svg" alt="NOVA TV" className="h-6 w-6 rounded-md" />
              <span className="font-display text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                NOVA <span className="text-[#00D4FF]">TV</span>
              </span>
            </button>

            <div className="flex items-center gap-1">
              <PWAInstallButton compact />
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                aria-label={t.nav.admin}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-[#A7B0C0] hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <Wrench className="w-4 h-4" />
              </button>
            </div>
          </header>
        )}

        {/* Page Viewport */}
        <main className="flex-1 pb-20 lg:pb-10 min-w-0">{children}</main>

        {/* Quiet Footer on Desktop */}
        <footer className="hidden lg:flex items-center justify-between gap-4 px-8 py-5 border-t border-slate-200 dark:border-white/[0.06] text-xs text-slate-500 dark:text-[#A7B0C0]">
          <span>NOVA TV · Free-to-Air Streaming Platform</span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t.settings.aboutNova}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('privacy')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t.settings.privacyPolicy}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('terms')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t.settings.termsOfUse}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t.settings.contactUs}
            </button>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar (6 core sections, compact 56px height) */}
      {!isPlayerView && (
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-14 pb-safe bg-white/95 dark:bg-[#0B101D]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/[0.08] grid grid-cols-6 items-center"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                  isActive
                    ? 'text-[#6C5CE7] dark:text-[#00D4FF]'
                    : 'text-slate-500 dark:text-[#A7B0C0]'
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="text-[10px] font-medium leading-none truncate max-w-full">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      <OfflineIndicator />
    </div>
  );
};
