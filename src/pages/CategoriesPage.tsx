import React, { useMemo } from 'react';
import { ArrowRight, Tv } from 'lucide-react';
import { ChannelCard } from '@/src/components/ChannelCard';
import { EmptyState } from '@/src/components/EmptyState';
import { useApp } from '@/src/context/AppContext';
import { Channel } from '@/src/types/channel';

interface CategoriesPageProps {
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onPlayChannel: (channel: Channel) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  selectedCategory,
  onSelectCategory,
  onPlayChannel,
}) => {
  const { activeChannels, categories, updatePreferences, t, isRtl } = useApp();

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activeChannels.forEach((ch) => {
      counts.set(ch.category, (counts.get(ch.category) ?? 0) + 1);
    });
    return counts;
  }, [activeChannels]);

  const filtered = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'All') return activeChannels;
    return activeChannels.filter((c) => c.category === selectedCategory);
  }, [activeChannels, selectedCategory]);

  const handleChoose = (slug: string) => {
    onSelectCategory(slug);
    updatePreferences({ lastCategory: slug });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.browse.categoriesTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B0C0]">
          {t.browse.categoriesSubtitle}
        </p>
      </div>

      {/* Category Directory Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => handleChoose('All')}
          className={`text-start p-4 rounded-2xl border transition-all ${
            selectedCategory === 'All'
              ? 'bg-[#6C5CE7] border-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20'
              : 'bg-white dark:bg-[#101827] border-slate-200 dark:border-white/[0.08] hover:border-[#6C5CE7]/50 text-slate-900 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-display font-bold text-sm sm:text-base">
              {t.common.all}
            </span>
            <span className="font-mono text-xs tabular-nums opacity-80">
              {activeChannels.length}
            </span>
          </div>
          <p
            className={`mt-1 text-xs line-clamp-1 ${
              selectedCategory === 'All'
                ? 'text-white/80'
                : 'text-slate-500 dark:text-[#A7B0C0]'
            }`}
          >
            All active broadcast channels
          </p>
        </button>

        {categories.map((cat) => {
          const count = categoryCounts.get(cat.slug) ?? 0;
          const active = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleChoose(cat.slug)}
              className={`text-start p-4 rounded-2xl border transition-all ${
                active
                  ? 'bg-[#6C5CE7] border-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20'
                  : 'bg-white dark:bg-[#101827] border-slate-200 dark:border-white/[0.08] hover:border-[#6C5CE7]/50 text-slate-900 dark:text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-bold text-sm sm:text-base truncate">
                  {cat.name}
                </span>
                <span className="font-mono text-xs tabular-nums opacity-80">
                  {count}
                </span>
              </div>
              <p
                className={`mt-1 text-xs line-clamp-1 ${
                  active
                    ? 'text-white/80'
                    : 'text-slate-500 dark:text-[#A7B0C0]'
                }`}
              >
                {cat.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Channels in Selected Category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{selectedCategory === 'All' ? t.common.all : selectedCategory}</span>
            <ArrowRight className={`w-4 h-4 text-[#00D4FF] ${isRtl ? 'rotate-180' : ''}`} />
            <span className="text-sm font-mono text-slate-500 dark:text-[#A7B0C0] tabular-nums">
              {filtered.length}
            </span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Tv}
            title={t.browse.noResultsTitle}
            description="No active channels belong to this category yet."
            actionLabel={t.common.all}
            onAction={() => handleChoose('All')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} onPlay={onPlayChannel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
