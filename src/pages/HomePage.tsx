import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Play, Sparkles } from 'lucide-react';
import { ChannelCard } from '@/src/components/ChannelCard';
import { ChannelLogo } from '@/src/components/ChannelLogo';
import { EmptyState } from '@/src/components/EmptyState';
import { HeroSkeleton, SkeletonCard } from '@/src/components/SkeletonCard';
import { useApp } from '@/src/context/AppContext';
import { Channel } from '@/src/types/channel';

interface HomePageProps {
  onPlayChannel: (channel: Channel) => void;
  onNavigateCategory: (category: string) => void;
  onOpenSearch: () => void;
}

const ChannelRow: React.FC<{
  title: string;
  channels: Channel[];
  onPlay: (ch: Channel) => void;
  onViewAll?: () => void;
  viewAllLabel?: string;
}> = ({ title, channels, onPlay, onViewAll, viewAllLabel }) => {
  if (channels.length === 0) return null;

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {onViewAll && viewAllLabel && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs sm:text-sm font-medium text-[#6C5CE7] dark:text-[#00D4FF] hover:underline whitespace-nowrap shrink-0"
          >
            {viewAllLabel}
          </button>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {channels.map((ch) => (
          <ChannelCard key={ch.id} channel={ch} onPlay={onPlay} compact />
        ))}
      </div>
    </section>
  );
};

export const HomePage: React.FC<HomePageProps> = ({
  onPlayChannel,
  onNavigateCategory,
  onOpenSearch,
}) => {
  const { activeChannels, categories, preferences, toggleFavorite, loading, t, isRtl } =
    useApp();

  const featuredList = useMemo(() => {
    const featured = activeChannels.filter((c) => c.featured);
    return featured.length > 0 ? featured : activeChannels.slice(0, 3);
  }, [activeChannels]);

  const [heroIndex, setHeroIndex] = useState(0);
  const currentHero = featuredList[heroIndex % Math.max(1, featuredList.length)] ?? null;

  const continueWatching = useMemo(() => {
    const map = new Map(activeChannels.map((c) => [c.id, c]));
    return preferences.watchHistory
      .map((entry) => map.get(entry.channelId))
      .filter((c): c is Channel => Boolean(c));
  }, [activeChannels, preferences.watchHistory]);

  const recentlyAdded = useMemo(
    () =>
      [...activeChannels]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 8),
    [activeChannels]
  );

  const popularChannels = useMemo(
    () =>
      [...activeChannels]
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .slice(0, 8),
    [activeChannels]
  );

  const favoriteChannels = useMemo(
    () => activeChannels.filter((c) => preferences.favorites.includes(c.id)),
    [activeChannels, preferences.favorites]
  );

  const recommendedChannels = useMemo(() => {
    const favCategories = new Set(favoriteChannels.map((c) => c.category));
    const matches = activeChannels.filter(
      (c) => favCategories.has(c.category) && !preferences.favorites.includes(c.id)
    );
    return (matches.length >= 3 ? matches : activeChannels).slice(0, 8);
  }, [activeChannels, favoriteChannels, preferences.favorites]);

  const categoryRows = useMemo(() => {
    return categories
      .map((cat) => ({
        category: cat,
        items: activeChannels.filter((ch) => ch.category === cat.slug),
      }))
      .filter((row) => row.items.length > 0)
      .slice(0, 4);
  }, [categories, activeChannels]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">
        <HeroSkeleton />
        <div className="flex gap-4 overflow-hidden">
          <SkeletonCard compact />
          <SkeletonCard compact />
          <SkeletonCard compact />
          <SkeletonCard compact />
        </div>
      </div>
    );
  }

  if (activeChannels.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <EmptyState
          title={t.browse.noResultsTitle}
          description="No active channels are currently published. Add or activate channels in Channel Admin."
          actionLabel={t.nav.search}
          onAction={onOpenSearch}
        />
      </div>
    );
  }

  const isHeroFav = currentHero
    ? preferences.favorites.includes(currentHero.id)
    : false;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 sm:py-6 space-y-9">
      {/* Cinematic Featured Channel Hero Banner */}
      {currentHero && (
        <section className="relative overflow-hidden rounded-3xl bg-[#0B101D] border border-slate-200/30 dark:border-white/10 shadow-2xl min-h-[340px] sm:min-h-[420px] flex items-end">
          <img
            src={currentHero.thumbnailUrl || './images/hero_featured_cinema.jpg'}
            alt={currentHero.name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B14] via-[#080B14]/70 to-[#080B14]/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080B14]/90 via-[#080B14]/45 to-transparent rtl:bg-gradient-to-l" />

          <div className="relative z-10 w-full p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-3">
                <ChannelLogo src={currentHero.logoUrl} name={currentHero.name} size="lg" />
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#00D4FF]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.home.featuredKicker}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#A7B0C0]">
                    <span>{currentHero.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentHero.country}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentHero.language}</span>
                  </div>
                </div>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance">
                {currentHero.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-200/90 max-w-xl line-clamp-2 leading-relaxed">
                {currentHero.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onPlayChannel(currentHero)}
                  className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-sm font-semibold inline-flex items-center gap-2 shadow-lg shadow-[#6C5CE7]/30 transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.common.watchNow}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(currentHero.id)}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isHeroFav ? 'fill-[#FF365D] text-[#FF365D]' : ''
                    }`}
                  />
                  <span>{isHeroFav ? t.common.favorited : t.common.favorite}</span>
                </button>
              </div>
            </div>

            {/* Hero Carousel Controls */}
            {featuredList.length > 1 && (
              <div className="flex items-center gap-2 self-start md:self-end">
                <button
                  type="button"
                  onClick={() =>
                    setHeroIndex(
                      (i) => (i - 1 + featuredList.length) % featuredList.length
                    )
                  }
                  aria-label="Previous featured channel"
                  className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-black/50 hover:bg-black/75 border border-white/15 text-white transition-colors"
                >
                  <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
                <div className="flex items-center gap-1.5 px-2">
                  {featuredList.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setHeroIndex(idx)}
                      aria-label={`Select featured channel ${item.name}`}
                      className={`h-2 rounded-full transition-all ${
                        idx === heroIndex % featuredList.length
                          ? 'w-6 bg-[#00D4FF]'
                          : 'w-2 bg-white/35 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setHeroIndex((i) => (i + 1) % featuredList.length)}
                  aria-label="Next featured channel"
                  className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-black/50 hover:bg-black/75 border border-white/15 text-white transition-colors"
                >
                  <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Continue Watching */}
      <ChannelRow
        title={t.home.continueWatching}
        channels={continueWatching}
        onPlay={onPlayChannel}
      />

      {/* Favorite Channels */}
      <ChannelRow
        title={t.home.favoriteChannels}
        channels={favoriteChannels}
        onPlay={onPlayChannel}
      />

      {/* Popular Channels */}
      <ChannelRow
        title={t.home.popularChannels}
        channels={popularChannels}
        onPlay={onPlayChannel}
        onViewAll={() => onNavigateCategory('All')}
        viewAllLabel={t.home.viewAll}
      />

      {/* Recently Added */}
      <ChannelRow
        title={t.home.recentlyAdded}
        channels={recentlyAdded}
        onPlay={onPlayChannel}
      />

      {/* Recommended */}
      <ChannelRow
        title={t.home.recommendedChannels}
        channels={recommendedChannels}
        onPlay={onPlayChannel}
      />

      {/* Dynamic Category Carousels */}
      {categoryRows.map(({ category, items }) => (
        <ChannelRow
          key={category.id}
          title={category.name}
          channels={items}
          onPlay={onPlayChannel}
          onViewAll={() => onNavigateCategory(category.slug)}
          viewAllLabel={t.home.viewAll}
        />
      ))}
    </div>
  );
};
