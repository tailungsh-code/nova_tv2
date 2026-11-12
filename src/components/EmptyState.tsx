import React from 'react';
import { LucideIcon, Tv } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Tv,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-3xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/[0.07]">
      <div className="h-14 w-14 rounded-2xl bg-[#6C5CE7]/15 border border-[#6C5CE7]/25 flex items-center justify-center text-[#6C5CE7] dark:text-[#00D4FF] mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
