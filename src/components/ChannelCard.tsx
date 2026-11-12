import React, { useState } from 'react';
import { Heart, Play, Radio } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { Channel } from '@/src/types/channel';
import { ChannelLogo } from './ChannelLogo';

interface ChannelCardProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
  compact?: boolean;
}

export const ChannelCard: React.FC<ChannelCardProps> = React.memo(
  ({ channel, onPlay, compact = false }) => {
    const { preferences, toggleFavorite, t } = useApp();
    const [thumbFailed, setThumbFailed] = useState(false);
    const isFav = preferences.favorites.includes(channel.id);

    const handleFavClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFavorite(channel.id);
    };

    return (
      <article
        onClick={() => onPlay(channel)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPlay(channel);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`${t.common.watchNow}: ${channel.name}`}
        className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#101827] border border-slate-200/90 dark:border-white/[0.08] hover:border-[#6C5CE7]/60 dark:hover:border-[#00D4FF]/45 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] ${
          compact ? 'w-[240px] sm:w-[268px] shrink-0' : 'w-full'
        }`}
      >
        {/* 16:9 Media Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#080B14]">
          {channel.thumbnailUrl && !thumbFailed ? (
            <img
              src={channel.thumbnailUrl}
              alt={channel.name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setThumbFailed(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0D1324] via-[#101827] to-[#1A1438] flex items-center justify-center">
              <Radio className="w-8 h-8 text-[#00D4FF]/60" />
            </div>
          )}

          {/* Measured contrast scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B14]/90 via-[#080B14]/25 to-transparent" />

          {/* Top Row: Live Broadcast Indicator & Favorite Button */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-2">
            {channel.isLive !== false ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FF365D] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-live-dot" />
                {t.common.live}
              </span>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={handleFavClick}
              aria-label={isFav ? t.common.favorited : t.common.favorite}
              aria-pressed={isFav}
              className="min-h-[40px] min-w-[40px] -m-1 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/75 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFav ? 'fill-[#FF365D] text-[#FF365D]' : 'text-white/90'
                }`}
              />
            </button>
          </div>

          {/* Hover Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="h-11 w-11 rounded-full bg-[#6C5CE7]/90 backdrop-blur-md flex items-center justify-center text-white shadow-lg shadow-[#6C5CE7]/30">
              <Play className="w-5 h-5 fill-current ms-0.5" />
            </div>
          </div>

          {/* Demo Label if non-operational placeholder */}
          {channel.isDemo && (
            <div className="absolute bottom-2 end-2.5 text-[11px] font-medium text-white/80 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
              {t.common.demoPlaceholder}
            </div>
          )}
        </div>

        {/* Card Footer: Logo + Title + Unboxed Metadata */}
        <div className="flex items-center gap-3 p-3.5">
          <ChannelLogo src={channel.logoUrl} name={channel.name} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[15px] font-semibold text-slate-900 dark:text-white truncate leading-snug">
              {channel.name}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#A7B0C0] truncate">
              <span className="truncate">{channel.category}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{channel.country}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }
);

ChannelCard.displayName = 'ChannelCard';
