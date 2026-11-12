import { Category, Channel, ChannelFormInput } from '@/src/types/channel';
import { DataSourceMode, PlatformSettings } from '@/src/types/settings';

export interface AdminSession {
  authenticated: boolean;
  mode: DataSourceMode;
  email: string | null;
  uid: string | null;
}

export interface ChannelDataProvider {
  readonly mode: DataSourceMode;
  getChannels(): Promise<Channel[]>;
  getCategories(): Promise<Category[]>;
  getPlatformSettings(): Promise<PlatformSettings>;
  addChannel(input: ChannelFormInput): Promise<Channel>;
  updateChannel(id: string, patch: Partial<ChannelFormInput>): Promise<Channel>;
  deleteChannel(id: string): Promise<void>;
  toggleChannelActive(id: string, isActive: boolean): Promise<Channel>;
  bulkImportChannels(inputs: ChannelFormInput[]): Promise<Channel[]>;
  resetToDefaults?(): Promise<void>;
  getAdminSession(): Promise<AdminSession>;
  signInAdmin(email: string, password: string): Promise<AdminSession>;
  signOutAdmin(): Promise<void>;
  onAuthChange(cb: (session: AdminSession) => void): () => void;
}
