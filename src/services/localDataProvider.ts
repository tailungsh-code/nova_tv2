import defaultCategories from '@/src/data/categories.json';
import defaultChannels from '@/src/data/channels.json';
import defaultSettings from '@/src/data/settings.json';
import { Category, Channel, ChannelFormInput } from '@/src/types/channel';
import { PlatformSettings } from '@/src/types/settings';
import { isDemoPlaceholderUrl } from '@/src/utils/m3u';
import { idbDelete, idbGet, idbSet } from '@/src/utils/storage';
import { AdminSession, ChannelDataProvider } from './dataProvider';

const CHANNELS_KEY = 'nova_tv_local_channels_v1';
const CATEGORIES_KEY = 'nova_tv_local_categories_v1';
const DEMO_ADMIN_SESSION_KEY = 'nova_tv_demo_admin_unlocked';

export class LocalDataProvider implements ChannelDataProvider {
  readonly mode = 'local-demo' as const;
  private listeners = new Set<(session: AdminSession) => void>();
  private unlocked = false;

  constructor() {
    try {
      this.unlocked = window.sessionStorage.getItem(DEMO_ADMIN_SESSION_KEY) === 'true';
    } catch {
      this.unlocked = false;
    }
  }

  private createSession(): AdminSession {
    return {
      authenticated: this.unlocked,
      mode: 'local-demo',
      email: this.unlocked ? 'local-demo@browser-storage' : null,
      uid: this.unlocked ? 'local-demo-user' : null,
    };
  }

  private notifyAuth(): void {
    const session = this.createSession();
    this.listeners.forEach((cb) => cb(session));
  }

  async getChannels(): Promise<Channel[]> {
    const cached = await idbGet<Channel[]>(CHANNELS_KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return [...cached].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    // Attempt reading external static JSON if hosted and modified externally
    try {
      const res = await fetch('./data/channels.json', { cache: 'no-store' });
      if (res.ok) {
        const external = (await res.json()) as Channel[];
        if (Array.isArray(external) && external.length > 0) {
          await idbSet(CHANNELS_KEY, external);
          return [...external].sort((a, b) => a.sortOrder - b.sortOrder);
        }
      }
    } catch {
      // Offline or bundled fallback
    }

    const seeded = defaultChannels as Channel[];
    await idbSet(CHANNELS_KEY, seeded);
    return [...seeded].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getCategories(): Promise<Category[]> {
    const cached = await idbGet<Category[]>(CATEGORIES_KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return [...cached].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    const seeded = defaultCategories as Category[];
    await idbSet(CATEGORIES_KEY, seeded);
    return [...seeded].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getPlatformSettings(): Promise<PlatformSettings> {
    return {
      ...(defaultSettings as PlatformSettings),
      dataSourceMode: 'local-demo',
    };
  }

  async addChannel(input: ChannelFormInput): Promise<Channel> {
    const channels = await this.getChannels();
    const now = new Date().toISOString();
    const created: Channel = {
      ...input,
      id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isDemo: input.isDemo ?? isDemoPlaceholderUrl(input.streamUrl),
      isLive: input.isLive ?? true,
      popularity: input.popularity ?? 75,
      createdAt: now,
      updatedAt: now,
    };
    const next = [...channels, created].sort((a, b) => a.sortOrder - b.sortOrder);
    await idbSet(CHANNELS_KEY, next);
    return created;
  }

  async updateChannel(id: string, patch: Partial<ChannelFormInput>): Promise<Channel> {
    const channels = await this.getChannels();
    const idx = channels.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error('Channel not found in local storage.');
    }
    const existing = channels[idx];
    const nextStream = patch.streamUrl ?? existing.streamUrl;
    const updated: Channel = {
      ...existing,
      ...patch,
      isDemo: patch.isDemo ?? isDemoPlaceholderUrl(nextStream),
      updatedAt: new Date().toISOString(),
    };
    const next = [...channels];
    next[idx] = updated;
    next.sort((a, b) => a.sortOrder - b.sortOrder);
    await idbSet(CHANNELS_KEY, next);
    return updated;
  }

  async deleteChannel(id: string): Promise<void> {
    const channels = await this.getChannels();
    const next = channels.filter((c) => c.id !== id);
    await idbSet(CHANNELS_KEY, next);
  }

  async toggleChannelActive(id: string, isActive: boolean): Promise<Channel> {
    return this.updateChannel(id, { isActive });
  }

  async bulkImportChannels(inputs: ChannelFormInput[]): Promise<Channel[]> {
    const existing = await this.getChannels();
    const now = new Date().toISOString();
    const created: Channel[] = inputs.map((input, idx) => ({
      ...input,
      id: `ch-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      isDemo: input.isDemo ?? isDemoPlaceholderUrl(input.streamUrl),
      isLive: input.isLive ?? true,
      popularity: input.popularity ?? 70,
      createdAt: now,
      updatedAt: now,
    }));
    const next = [...existing, ...created].sort((a, b) => a.sortOrder - b.sortOrder);
    await idbSet(CHANNELS_KEY, next);
    return created;
  }

  async resetToDefaults(): Promise<void> {
    await idbDelete(CHANNELS_KEY);
    await idbDelete(CATEGORIES_KEY);
    await idbSet(CHANNELS_KEY, defaultChannels as Channel[]);
    await idbSet(CATEGORIES_KEY, defaultCategories as Category[]);
  }

  async getAdminSession(): Promise<AdminSession> {
    return this.createSession();
  }

  // Local Demo Mode has no remote auth server; this explicitly opens the browser sandbox without fake passwords
  async signInAdmin(_email: string, _password: string): Promise<AdminSession> {
    this.unlocked = true;
    try {
      window.sessionStorage.setItem(DEMO_ADMIN_SESSION_KEY, 'true');
    } catch {
      // Ignore
    }
    this.notifyAuth();
    return this.createSession();
  }

  async signOutAdmin(): Promise<void> {
    this.unlocked = false;
    try {
      window.sessionStorage.removeItem(DEMO_ADMIN_SESSION_KEY);
    } catch {
      // Ignore
    }
    this.notifyAuth();
  }

  onAuthChange(cb: (session: AdminSession) => void): () => void {
    this.listeners.add(cb);
    cb(this.createSession());
    return () => {
      this.listeners.delete(cb);
    };
  }
}
