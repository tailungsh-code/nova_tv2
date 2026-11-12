import { DataSourceMode } from '@/src/types/settings';
import { safeLocalGet, safeLocalSet } from '@/src/utils/storage';
import { ChannelDataProvider } from './dataProvider';
import {
  FirebaseDataProvider,
  getActiveFirebaseConfig,
  isFirebaseConfigured,
} from './firebaseDataProvider';
import { LocalDataProvider } from './localDataProvider';

const DATA_SOURCE_PREF_KEY = 'nova_tv_preferred_data_source';

const localProvider = new LocalDataProvider();
let firebaseProvider: FirebaseDataProvider | null = null;

export function getPreferredDataSourceMode(): DataSourceMode {
  const saved = safeLocalGet<DataSourceMode>(DATA_SOURCE_PREF_KEY);
  if (saved === 'firebase' && isFirebaseConfigured()) {
    return 'firebase';
  }
  if (saved === 'local-demo') {
    return 'local-demo';
  }
  return isFirebaseConfigured() ? 'firebase' : 'local-demo';
}

export function setPreferredDataSourceMode(mode: DataSourceMode): void {
  safeLocalSet(DATA_SOURCE_PREF_KEY, mode);
  if (mode === 'local-demo') {
    firebaseProvider = null;
  }
}

export function getDataProvider(): ChannelDataProvider {
  const mode = getPreferredDataSourceMode();
  if (mode === 'firebase') {
    const config = getActiveFirebaseConfig();
    if (config) {
      if (!firebaseProvider) {
        firebaseProvider = new FirebaseDataProvider(config);
      }
      return firebaseProvider;
    }
  }
  return localProvider;
}

export function refreshDataProvider(): ChannelDataProvider {
  firebaseProvider = null;
  return getDataProvider();
}
