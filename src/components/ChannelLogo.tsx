import React, { useState } from 'react';
import { Tv } from 'lucide-react';

interface ChannelLogoProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ChannelLogo: React.FC<ChannelLogoProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  const dims =
    size === 'sm'
      ? 'h-9 w-9 rounded-lg text-xs'
      : size === 'lg'
        ? 'h-14 w-14 rounded-2xl text-base'
        : 'h-11 w-11 rounded-xl text-sm';

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  if (!src || failed) {
    return (
      <div
        className={`${dims} shrink-0 flex items-center justify-center bg-gradient-to-br from-[#6C5CE7]/25 to-[#00D4FF]/20 border border-slate-200 dark:border-white/10 font-display font-bold text-slate-900 dark:text-white ${className}`}
        aria-label={name}
      >
        {initials || <Tv className="w-4 h-4 text-[#00D4FF]" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${dims} shrink-0 object-cover bg-[#0B101D] border border-slate-200 dark:border-white/10 ${className}`}
    />
  );
};
