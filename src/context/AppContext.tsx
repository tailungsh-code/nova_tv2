import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TRANSLATIONS, TranslationStrings } from '@/src/i18n/translations';
import { AdminSession } from '@/src/services/dataProvider';
import {
  getDataProvider,
  getPreferredDataSourceMode,
  refreshDataProvider,
  setPreferredDataSourceMode,
} from '@/src/services/dataService';
import {
  isFirebaseConfigured,
  saveRuntimeFirebaseConfig,
} from '@/src/services/firebaseDataProvider';
import { Category, Channel, ChannelFormInput } from '@/src/types/channel';
import {
  AppLanguage,
  AppTheme,
  DataSourceMode,
  FirebaseRuntimeConfig,
  PlatformSettings,
  UserPreferences,
} from '@/src/types/settings';
import { safeLocalGet, safeLocalRemove, safeLocalSet } from '@/src/utils/storage';

const PREFS_KEY = 'nova_tv_user_preferences_v1';

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  theme: 'dark',
  defaultAspectRatio: 'fit',
  defaultVolume: 0.85,
  autoplay: true,
  preferredQuality: 'auto',
  rememberLastChannel: true,
  lastChannelId: null,
  lastCategory: 'All',
  favorites: ['ch-nova-world', 'ch-terra-cosmos'],
  searchHistory: [],
  watchHistory: [],
};

interface AppContextValue {
  channels: Channel[];
  activeChannels: Channel[];
  categories: Category[];
  platformSettings: PlatformSettings | null;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  t: TranslationStrings;
  isRtl: boolean;
  dataSourceMode: DataSourceMode;
  firebaseReady: boolean;
  adminSession: AdminSession;
  refreshCatalog: () => Promise<void>;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  toggleFavorite: (channelId: string) => void;
  recordWatch: (channelId: string, lastPositionSec?: number) => void;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  clearUserLocalData: () => void;
  switchDataSource: (mode: DataSourceMode) => Promise<void>;
  saveFirebaseSetup: (config: FirebaseRuntimeConfig | null) => Promise<void>;
  addChannel: (input: ChannelFormInput) => Promise<Channel>;
  updateChannel: (id: string, patch: Partial<ChannelFormInput>) => Promise<Channel>;
  deleteChannel: (id: string) => Promise<void>;
  toggleChannelActive: (id: string, isActive: boolean) => Promise<Channel>;
  bulkImportChannels: (inputs: ChannelFormInput[]) => Promise<Channel[]>;
  resetDemoCatalog: () => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<AdminSession>;
  signOutAdmin: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = safeLocalGet<Partial<UserPreferences>>(PREFS_KEY);
    return { ...DEFAULT_PREFERENCES, ...(saved ?? {}) };
  });

  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>(() =>
    getPreferredDataSourceMode()
  );
  const [firebaseReady, setFirebaseReady] = useState<boolean>(() => isFirebaseConfigured());
  const [adminSession, setAdminSession] = useState<AdminSession>({
    authenticated: false,
    mode: dataSourceMode,
    email: null,
    uid: null,
  });

  // Sync theme and RTL/language attributes on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.lang = preferences.language;
    root.dir = preferences.language === 'ar' ? 'rtl' : 'ltr';
  }, [preferences.theme, preferences.language]);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = getDataProvider();
      const [ch, cat, settings] = await Promise.all([
        provider.getChannels(),
        provider.getCategories(),
        provider.getPlatformSettings(),
      ]);
      setChannels(ch);
      setCategories(cat);
      setPlatformSettings(settings);
      setDataSourceMode(provider.mode);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load television channel catalog.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    const provider = getDataProvider();
    const unsub = provider.onAuthChange((session) => {
      setAdminSession(session);
    });
    return () => unsub();
  }, [dataSourceMode]);

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch };
      safeLocalSet(PREFS_KEY, next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((channelId: string) => {
    setPreferences((prev) => {
      const exists = prev.favorites.includes(channelId);
      const favorites = exists
        ? prev.favorites.filter((id) => id !== channelId)
        : [channelId, ...prev.favorites];
      const next = { ...prev, favorites };
      safeLocalSet(PREFS_KEY, next);
      return next;
    });
  }, []);

  const recordWatch = useCallback((channelId: string, lastPositionSec?: number) => {
    setPreferences((prev) => {
      const filtered = prev.watchHistory.filter((item) => item.channelId !== channelId);
      const entry = {
        channelId,
        watchedAt: new Date().toISOString(),
        lastPositionSec,
      };
      const next: UserPreferences = {
        ...prev,
        lastChannelId: prev.rememberLastChannel ? channelId : prev.lastChannelId,
        watchHistory: [entry, ...filtered].slice(0, 12),
      };
      safeLocalSet(PREFS_KEY, next);
      return next;
    });
  }, []);

  const addSearchHistory = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setPreferences((prev) => {
      const deduped = prev.searchHistory.filter(
        (q) => q.toLowerCase() !== trimmed.toLowerCase()
      );
      const next = {
        ...prev,
        searchHistory: [trimmed, ...deduped].slice(0, 8),
      };
      safeLocalSet(PREFS_KEY, next);
      return next;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    updatePreferences({ searchHistory: [] });
  }, [updatePreferences]);

  const clearUserLocalData = useCallback(() => {
    safeLocalRemove(PREFS_KEY);
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const switchDataSource = useCallback(
    async (mode: DataSourceMode) => {
      setPreferredDataSourceMode(mode);
      const provider = refreshDataProvider();
      setDataSourceMode(provider.mode);
      await loadCatalog();
    },
    [loadCatalog]
  );

  const saveFirebaseSetup = useCallback(
    async (config: FirebaseRuntimeConfig | null) => {
      saveRuntimeFirebaseConfig(config);
      const configured = isFirebaseConfigured();
      setFirebaseReady(configured);
      setPreferredDataSourceMode(configured ? 'firebase' : 'local-demo');
      const provider = refreshDataProvider();
      setDataSourceMode(provider.mode);
      await loadCatalog();
    },
    [loadCatalog]
  );

  const addChannel = useCallback(async (input: ChannelFormInput) => {
    const created = await getDataProvider().addChannel(input);
    setChannels((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
    return created;
  }, []);

  const updateChannel = useCallback(async (id: string, patch: Partial<ChannelFormInput>) => {
    const updated = await getDataProvider().updateChannel(id, patch);
    setChannels((prev) =>
      prev
        .map((c) => (c.id === id ? updated : c))
        .sort((a, b) => a.sortOrder - b.sortOrder)
    );
    return updated;
  }, []);

  const deleteChannel = useCallback(async (id: string) => {
    await getDataProvider().deleteChannel(id);
    setChannels((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleChannelActive = useCallback(async (id: string, isActive: boolean) => {
    const updated = await getDataProvider().toggleChannelActive(id, isActive);
    setChannels((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const bulkImportChannels = useCallback(
    async (inputs: ChannelFormInput[]) => {
      const created = await getDataProvider().bulkImportChannels(inputs);
      await loadCatalog();
      return created;
    },
    [loadCatalog]
  );

  const resetDemoCatalog = useCallback(async () => {
    const provider = getDataProvider();
    if (provider.resetToDefaults) {
      await provider.resetToDefaults();
      await loadCatalog();
    }
  }, [loadCatalog]);

  const signInAdmin = useCallback(async (email: string, password: string) => {
    const session = await getDataProvider().signInAdmin(email, password);
    setAdminSession(session);
    return session;
  }, []);

  const signOutAdmin = useCallback(async () => {
    await getDataProvider().signOutAdmin();
    const session = await getDataProvider().getAdminSession();
    setAdminSession(session);
  }, []);

  const activeChannels = useMemo(
    () => channels.filter((ch) => ch.isActive),
    [channels]
  );

  // Dynamically derive categories from active channels + base categories.json
  const dynamicCategories = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.slug, c));
    let nextOrder = categories.length + 1;
    channels.forEach((ch) => {
      if (ch.category && !map.has(ch.category)) {
        map.set(ch.category, {
          id: `cat-${ch.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          slug: ch.category,
          name: ch.category,
          description: `${ch.category} channels`,
          sortOrder: nextOrder++,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, channels]);

  const t = TRANSLATIONS[preferences.language] ?? TRANSLATIONS.en;
  const isRtl = preferences.language === 'ar';

  const value: AppContextValue = {
    channels,
    activeChannels,
    categories: dynamicCategories,
    platformSettings,
    preferences,
    loading,
    error,
    t,
    isRtl,
    dataSourceMode,
    firebaseReady,
    adminSession,
    refreshCatalog: loadCatalog,
    updatePreferences,
    toggleFavorite,
    recordWatch,
    addSearchHistory,
    clearSearchHistory,
    clearUserLocalData,
    switchDataSource,
    saveFirebaseSetup,
    addChannel,
    updateChannel,
    deleteChannel,
    toggleChannelActive,
    bulkImportChannels,
    resetDemoCatalog,
    signInAdmin,
    signOutAdmin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
