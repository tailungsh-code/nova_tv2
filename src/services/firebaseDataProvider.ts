import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import defaultCategories from '@/src/data/categories.json';
import defaultSettings from '@/src/data/settings.json';
import { Category, Channel, ChannelFormInput } from '@/src/types/channel';
import { FirebaseRuntimeConfig, PlatformSettings } from '@/src/types/settings';
import { isDemoPlaceholderUrl } from '@/src/utils/m3u';
import { safeLocalGet, safeLocalRemove, safeLocalSet } from '@/src/utils/storage';
import { AdminSession, ChannelDataProvider } from './dataProvider';

const RUNTIME_CONFIG_KEY = 'nova_tv_firebase_runtime_config';

export function getEnvFirebaseConfig(): FirebaseRuntimeConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !appId) return null;

  return {
    apiKey,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId,
  };
}

export function getStoredRuntimeFirebaseConfig(): FirebaseRuntimeConfig | null {
  const stored = safeLocalGet<FirebaseRuntimeConfig>(RUNTIME_CONFIG_KEY);
  if (stored && stored.apiKey && stored.projectId && stored.appId) {
    return stored;
  }
  return null;
}

export function saveRuntimeFirebaseConfig(config: FirebaseRuntimeConfig | null): void {
  if (!config) {
    safeLocalRemove(RUNTIME_CONFIG_KEY);
    return;
  }
  safeLocalSet(RUNTIME_CONFIG_KEY, config);
}

export function getActiveFirebaseConfig(): FirebaseRuntimeConfig | null {
  return getEnvFirebaseConfig() ?? getStoredRuntimeFirebaseConfig();
}

export function isFirebaseConfigured(): boolean {
  return getActiveFirebaseConfig() !== null;
}

export class FirebaseDataProvider implements ChannelDataProvider {
  readonly mode = 'firebase' as const;
  private app: FirebaseApp;
  private db: Firestore;
  private auth: Auth;

  constructor(config: FirebaseRuntimeConfig) {
    const existing = getApps().find((a) => a.name === 'nova-tv-firebase');
    this.app = existing ?? initializeApp(config, 'nova-tv-firebase');
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
  }

  private mapUserToSession(user: User | null): AdminSession {
    return {
      authenticated: Boolean(user),
      mode: 'firebase',
      email: user?.email ?? null,
      uid: user?.uid ?? null,
    };
  }

  async getChannels(): Promise<Channel[]> {
    const q = query(collection(this.db, 'channels'), orderBy('sortOrder', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      ...(d.data() as Omit<Channel, 'id'>),
      id: d.id,
    }));
  }

  async getCategories(): Promise<Category[]> {
    const q = query(collection(this.db, 'categories'), orderBy('sortOrder', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return defaultCategories as Category[];
    }
    return snapshot.docs.map((d) => ({
      ...(d.data() as Omit<Category, 'id'>),
      id: d.id,
    }));
  }

  async getPlatformSettings(): Promise<PlatformSettings> {
    return {
      ...(defaultSettings as PlatformSettings),
      dataSourceMode: 'firebase',
    };
  }

  async addChannel(input: ChannelFormInput): Promise<Channel> {
    const now = new Date().toISOString();
    const id = `ch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const payload: Channel = {
      ...input,
      id,
      isDemo: input.isDemo ?? isDemoPlaceholderUrl(input.streamUrl),
      isLive: input.isLive ?? true,
      popularity: input.popularity ?? 75,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(this.db, 'channels', id), payload);
    return payload;
  }

  async updateChannel(id: string, patch: Partial<ChannelFormInput>): Promise<Channel> {
    const ref = doc(this.db, 'channels', id);
    const updatedFields = {
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(ref, updatedFields);
    const all = await this.getChannels();
    const match = all.find((c) => c.id === id);
    if (!match) {
      throw new Error('Updated channel could not be retrieved from Firestore.');
    }
    return match;
  }

  async deleteChannel(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'channels', id));
  }

  async toggleChannelActive(id: string, isActive: boolean): Promise<Channel> {
    return this.updateChannel(id, { isActive });
  }

  async bulkImportChannels(inputs: ChannelFormInput[]): Promise<Channel[]> {
    const batch = writeBatch(this.db);
    const now = new Date().toISOString();
    const created: Channel[] = inputs.map((input, idx) => {
      const id = `ch-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
      const item: Channel = {
        ...input,
        id,
        isDemo: input.isDemo ?? isDemoPlaceholderUrl(input.streamUrl),
        isLive: input.isLive ?? true,
        popularity: input.popularity ?? 70,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(doc(this.db, 'channels', id), item);
      return item;
    });
    await batch.commit();
    return created;
  }

  async getAdminSession(): Promise<AdminSession> {
    return this.mapUserToSession(this.auth.currentUser);
  }

  async signInAdmin(email: string, password: string): Promise<AdminSession> {
    const cred = await signInWithEmailAndPassword(this.auth, email.trim(), password);
    return this.mapUserToSession(cred.user);
  }

  async signOutAdmin(): Promise<void> {
    await signOut(this.auth);
  }

  onAuthChange(cb: (session: AdminSession) => void): () => void {
    return onAuthStateChanged(this.auth, (user) => {
      cb(this.mapUserToSession(user));
    });
  }
}
