import React from 'react';

export const SkeletonCard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white dark:bg-[#101827] border border-slate-200/80 dark:border-white/[0.06] animate-pulse ${
        compact ? 'w-[240px] sm:w-[268px] shrink-0' : 'w-full'
      }`}
    >
      <div className="aspect-video w-full bg-slate-200 dark:bg-white/[0.06]" />
      <div className="flex items-center gap-3 p-3.5">
        <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-white/[0.08] shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/[0.08]" />
          <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
};

export const HeroSkeleton: React.FC = () => (
  <div className="w-full h-[360px] sm:h-[420px] rounded-3xl bg-slate-200 dark:bg-[#101827] border border-slate-200 dark:border-white/[0.06] animate-pulse" />
);
