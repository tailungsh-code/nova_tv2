export interface Channel {
  id: string;
  name: string;
  logoUrl: string;
  thumbnailUrl?: string;
  streamUrl: string;
  alternativeStreamUrl?: string;
  epgUrl?: string;
  category: string;
  country: string;
  language: string;
  description: string;
  featured: boolean;
  isActive: boolean;
  sortOrder: number;
  isDemo?: boolean;
  isLive?: boolean;
  popularity?: number;
  createdAt: string;
  updatedAt: string;
}

export type ChannelFormInput = Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>;

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface WatchHistoryEntry {
  channelId: string;
  watchedAt: string;
  durationWatchedSec: number;
  lastPositionSec?: number;
}
