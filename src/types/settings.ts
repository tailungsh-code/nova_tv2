export type AppLanguage = 'en' | 'ar' | 'fr';
export type AppTheme = 'dark' | 'light';
export type AspectRatioMode = 'fit' | 'fill' | 'original';
export type QualityPreference = 'auto' | 'high' | 'medium' | 'low';
export type DataSourceMode = 'local-demo' | 'firebase';

export interface FirebaseRuntimeConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export interface PlatformSettings {
  appName: string;
  appVersion: string;
  defaultLanguage: AppLanguage;
  defaultTheme: AppTheme;
  dataSourceMode: DataSourceMode;
  contactEmail: string;
  supportUrl: string;
}

export interface UserPreferences {
  language: AppLanguage;
  theme: AppTheme;
  defaultAspectRatio: AspectRatioMode;
  defaultVolume: number;
  autoplay: boolean;
  preferredQuality: QualityPreference;
  rememberLastChannel: boolean;
  lastChannelId: string | null;
  lastCategory: string;
  favorites: string[];
  searchHistory: string[];
  watchHistory: {
    channelId: string;
    watchedAt: string;
    lastPositionSec?: number;
  }[];
}
