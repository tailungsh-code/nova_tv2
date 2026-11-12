import React, { useEffect, useMemo, useState } from 'react';
import { History, Search, X } from 'lucide-react';
import { ChannelCard } from '@/src/components/ChannelCard';
import { EmptyState } from '@/src/components/EmptyState';
import { useApp } from '@/src/context/AppContext';
import { useDebounce } from '@/src/hooks/useDebounce';
import { Channel } from '@/src/types/channel';

interface SearchPageProps {
  onPlayChannel: (channel: Channel) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onPlayChannel }) => {
  const { activeChannels, preferences, addSearchHistory, clearSearchHistory, t } =
    useApp();

  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 200);

  useEffect(() => {
    if (debounced.trim().length >= 2) {
      addSearchHistory(debounced.trim());
    }
  }, [debounced, addSearchHistory]);

  const results = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return activeChannels;
    return activeChannels.filter(
      (ch) =>
        ch.name.toLowerCase().includes(q) ||
        ch.category.toLowerCase().includes(q) ||
        ch.country.toLowerCase().includes(q) ||
        ch.language.toLowerCase().includes(q) ||
        ch.description.toLowerCase().includes(q)
    );
  }, [activeChannels, debounced]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.browse.searchTitle}
        </h1>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute start-4 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.browse.searchPlaceholder}
          className="w-full rounded-2xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 ps-12 pe-12 py-3.5 text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label={t.common.clear}
            className="absolute end-3 top-1/2 -translate-y-1/2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recent Searches */}
      {preferences.searchHistory.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-[#A7B0C0] inline-flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              {t.browse.recentSearches}
            </span>
            <button
              type="button"
              onClick={clearSearchHistory}
              className="text-xs text-[#6C5CE7] dark:text-[#00D4FF] hover:underline"
            >
              {t.common.clear}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {preferences.searchHistory.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-[#A7B0C0] hover:border-[#6C5CE7] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t.browse.noResultsTitle}
          description={t.browse.noResultsDesc}
          actionLabel={t.common.clear}
          onAction={() => setQuery('')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {results.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} onPlay={onPlayChannel} />
          ))}
        </div>
      )}
    </div>
  );
};
