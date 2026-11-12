import React, { useMemo, useState } from 'react';
import { Heart, Search } from 'lucide-react';
import { ChannelCard } from '@/src/components/ChannelCard';
import { EmptyState } from '@/src/components/EmptyState';
import { SkeletonCard } from '@/src/components/SkeletonCard';
import { useApp } from '@/src/context/AppContext';
import { useDebounce } from '@/src/hooks/useDebounce';
import { Channel } from '@/src/types/channel';

interface LiveTVPageProps {
  initialCategory?: string;
  onPlayChannel: (channel: Channel) => void;
}

type SortOption = 'order' | 'alpha' | 'recent' | 'popular';

export const LiveTVPage: React.FC<LiveTVPageProps> = ({
  initialCategory,
  onPlayChannel,
}) => {
  const { activeChannels, categories, preferences, updatePreferences, loading, t } =
    useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || preferences.lastCategory || 'All'
  );
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const debouncedQuery = useDebounce(searchInput, 200);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    updatePreferences({ lastCategory: slug });
  };

  const filteredChannels = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const list = activeChannels.filter((ch) => {
      if (selectedCategory !== 'All' && ch.category !== selectedCategory) {
        return false;
      }
      if (onlyFavorites && !preferences.favorites.includes(ch.id)) {
        return false;
      }
      if (!q) return true;
      return (
        ch.name.toLowerCase().includes(q) ||
        ch.category.toLowerCase().includes(q) ||
        ch.country.toLowerCase().includes(q) ||
        ch.language.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'alpha') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'recent') {
      return [...list].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (sortBy === 'popular') {
      return [...list].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    }
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [activeChannels, selectedCategory, onlyFavorites, preferences.favorites, debouncedQuery, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.browse.liveTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B0C0]">
            {t.browse.liveSubtitle}
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-[#A7B0C0] tabular-nums">
          {filteredChannels.length} {t.common.channelsCount}
        </span>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t.browse.searchPlaceholder}
            className="w-full rounded-xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 ps-10 pe-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Sort channels"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="min-h-[42px] rounded-xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
          >
            <option value="order">{t.browse.sortOrder}</option>
            <option value="alpha">{t.browse.sortAlpha}</option>
            <option value="recent">{t.browse.sortRecent}</option>
            <option value="popular">{t.browse.sortPopular}</option>
          </select>

          <button
            type="button"
            onClick={() => setOnlyFavorites((v) => !v)}
            aria-pressed={onlyFavorites}
            className={`min-h-[42px] px-3.5 rounded-xl border text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              onlyFavorites
                ? 'bg-[#FF365D]/15 border-[#FF365D]/40 text-[#FF365D]'
                : 'bg-white dark:bg-[#101827] border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#A7B0C0]'
            }`}
          >
            <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-current' : ''}`} />
            <span>{t.browse.onlyFavorites}</span>
          </button>
        </div>
      </div>

      {/* Category Interactive Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => handleCategorySelect('All')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
            selectedCategory === 'All'
              ? 'bg-[#6C5CE7] text-white'
              : 'bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.common.all}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategorySelect(cat.slug)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === cat.slug
                ? 'bg-[#6C5CE7] text-white'
                : 'bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredChannels.length === 0 ? (
        <EmptyState
          title={t.browse.noResultsTitle}
          description={t.browse.noResultsDesc}
          actionLabel={t.common.clear}
          onAction={() => {
            setSearchInput('');
            setSelectedCategory('All');
            setOnlyFavorites(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredChannels.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} onPlay={onPlayChannel} />
          ))}
        </div>
      )}
    </div>
  );
};
