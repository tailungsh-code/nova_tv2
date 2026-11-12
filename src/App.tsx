import React, { useCallback, useEffect, useState } from 'react';
import { AdminPage } from '@/src/admin/AdminPage';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { ShareModal } from '@/src/components/ShareModal';
import { SplashScreen } from '@/src/components/SplashScreen';
import { AppProvider } from '@/src/context/AppContext';
import { MainLayout, NavSection } from '@/src/layouts/MainLayout';
import { CategoriesPage } from '@/src/pages/CategoriesPage';
import { FavoritesPage } from '@/src/pages/FavoritesPage';
import { HomePage } from '@/src/pages/HomePage';
import { InfoPageType, InfoPages } from '@/src/pages/InfoPages';
import { LiveTVPage } from '@/src/pages/LiveTVPage';
import { SearchPage } from '@/src/pages/SearchPage';
import { SettingsPage } from '@/src/pages/SettingsPage';
import { PlayerPage } from '@/src/player/PlayerPage';
import { Channel } from '@/src/types/channel';

interface RouteState {
  section: NavSection;
  channelId?: string;
  category?: string;
}

function parseHashRoute(): RouteState {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) return { section: 'home' };

  const parts = hash.split('/').map(decodeURIComponent);
  const head = parts[0];

  if (head === 'watch' && parts[1]) {
    return { section: 'watch', channelId: parts[1] };
  }
  if (head === 'categories') {
    return { section: 'categories', category: parts[1] || 'All' };
  }
  if (
    head === 'live' ||
    head === 'favorites' ||
    head === 'search' ||
    head === 'settings' ||
    head === 'admin' ||
    head === 'about' ||
    head === 'privacy' ||
    head === 'terms' ||
    head === 'contact'
  ) {
    return { section: head };
  }
  return { section: 'home' };
}

function writeHashRoute(route: RouteState): void {
  let target = '#/';
  if (route.section === 'watch' && route.channelId) {
    target = `#/watch/${encodeURIComponent(route.channelId)}`;
  } else if (route.section === 'categories' && route.category && route.category !== 'All') {
    target = `#/categories/${encodeURIComponent(route.category)}`;
  } else if (route.section !== 'home') {
    target = `#/${route.section}`;
  }
  if (window.location.hash !== target) {
    window.location.hash = target;
  }
}

const AppRouter: React.FC = () => {
  const [route, setRoute] = useState<RouteState>(() => parseHashRoute());
  const [shareTarget, setShareTarget] = useState<Channel | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHashRoute());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((section: NavSection, extra?: Partial<RouteState>) => {
    const next: RouteState = { section, ...extra };
    writeHashRoute(next);
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handlePlayChannel = useCallback(
    (channel: Channel) => {
      navigate('watch', { channelId: channel.id });
    },
    [navigate]
  );

  const handleBackFromPlayer = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('home');
    }
  }, [navigate]);

  return (
    <MainLayout
      activeSection={route.section}
      onNavigate={(sec) => navigate(sec)}
    >
      {route.section === 'home' && (
        <HomePage
          onPlayChannel={handlePlayChannel}
          onNavigateCategory={(cat) => navigate('categories', { category: cat })}
          onOpenSearch={() => navigate('search')}
        />
      )}

      {route.section === 'live' && (
        <LiveTVPage
          initialCategory={route.category}
          onPlayChannel={handlePlayChannel}
        />
      )}

      {route.section === 'categories' && (
        <CategoriesPage
          selectedCategory={route.category || 'All'}
          onSelectCategory={(cat) => navigate('categories', { category: cat })}
          onPlayChannel={handlePlayChannel}
        />
      )}

      {route.section === 'favorites' && (
        <FavoritesPage
          onPlayChannel={handlePlayChannel}
          onExploreLive={() => navigate('live')}
        />
      )}

      {route.section === 'search' && (
        <SearchPage onPlayChannel={handlePlayChannel} />
      )}

      {route.section === 'settings' && (
        <SettingsPage
          onOpenAdmin={() => navigate('admin')}
          onOpenInfoPage={(page) => navigate(page)}
        />
      )}

      {route.section === 'admin' && (
        <AdminPage onOpenSettings={() => navigate('settings')} />
      )}

      {route.section === 'watch' && route.channelId && (
        <PlayerPage
          channelId={route.channelId}
          onBack={handleBackFromPlayer}
          onSelectChannel={handlePlayChannel}
          onOpenAdmin={() => navigate('admin')}
          onShare={(ch) => setShareTarget(ch)}
        />
      )}

      {(route.section === 'about' ||
        route.section === 'privacy' ||
        route.section === 'terms' ||
        route.section === 'contact') && (
        <InfoPages
          page={route.section as InfoPageType}
          onBack={() => navigate('settings')}
        />
      )}

      <ShareModal channel={shareTarget} onClose={() => setShareTarget(null)} />
    </MainLayout>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <SplashScreen />
        <AppRouter />
      </AppProvider>
    </ErrorBoundary>
  );
}
