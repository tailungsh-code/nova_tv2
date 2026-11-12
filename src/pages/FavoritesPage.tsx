import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { ChannelCard } from '@/src/components/ChannelCard';
import { EmptyState } from '@/src/components/EmptyState';
import { useApp } from '@/src/context/AppContext';
import { Channel } from '@/src/types/channel';

interface FavoritesPageProps {
  onPlayChannel: (channel: Channel) => void;
  onExploreLive: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  onPlayChannel,
  onExploreLive,
}) => {
  const { activeChannels, preferences, t } = useApp();

  const favoriteChannels = useMemo(
    () => activeChannels.filter((ch) => preferences.favorites.includes(ch.id)),
    [activeChannels, preferences.favorites]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.browse.favoritesTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B0C0]">
            {t.browse.favoritesSubtitle}
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500 dark:text-[#A7B0C0] tabular-nums">
          {favoriteChannels.length} {t.common.channelsCount}
        </span>
      </div>

      {favoriteChannels.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t.browse.favoritesEmptyTitle}
          description={t.browse.favoritesEmptyDesc}
          actionLabel={t.browse.exploreChannels}
          onAction={onExploreLive}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favoriteChannels.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} onPlay={onPlayChannel} />
          ))}
        </div>
      )}
    </div>
  );
};
