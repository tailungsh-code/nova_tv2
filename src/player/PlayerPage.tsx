import React, { useEffect, useMemo } from 'react';
import { Globe, Languages, Play, ShieldAlert, Wrench } from 'lucide-react';
import { ChannelLogo } from '@/src/components/ChannelLogo';
import { EmptyState } from '@/src/components/EmptyState';
import { useApp } from '@/src/context/AppContext';
import { Channel } from '@/src/types/channel';
import { VideoPlayer } from './VideoPlayer';

interface PlayerPageProps {
  channelId: string;
  onBack: () => void;
  onSelectChannel: (channel: Channel) => void;
  onOpenAdmin: () => void;
  onShare: (channel: Channel) => void;
}

export const PlayerPage: React.FC<PlayerPageProps> = ({
  channelId,
  onBack,
  onSelectChannel,
  onOpenAdmin,
  onShare,
}) => {
  const { channels, activeChannels, recordWatch, t } = useApp();

  const channel = useMemo(
    () => channels.find((c) => c.id === channelId) ?? activeChannels[0] ?? null,
    [channels, activeChannels, channelId]
  );

  useEffect(() => {
    if (channel) {
      recordWatch(channel.id);
    }
  }, [channel?.id, recordWatch]);

  const currentIdx = useMemo(() => {
    if (!channel) return -1;
    return activeChannels.findIndex((c) => c.id === channel.id);
  }, [activeChannels, channel]);

  const handlePrev = () => {
    if (activeChannels.length < 2 || currentIdx < 0) return;
    const prevIdx = (currentIdx - 1 + activeChannels.length) % activeChannels.length;
    onSelectChannel(activeChannels[prevIdx]);
  };

  const handleNext = () => {
    if (activeChannels.length < 2 || currentIdx < 0) return;
    const nextIdx = (currentIdx + 1) % activeChannels.length;
    onSelectChannel(activeChannels[nextIdx]);
  };

  const upNextChannels = useMemo(() => {
    if (!channel) return [];
    const sameCategory = activeChannels.filter(
      (c) => c.id !== channel.id && c.category === channel.category
    );
    const others = activeChannels.filter(
      (c) => c.id !== channel.id && c.category !== channel.category
    );
    return [...sameCategory, ...others].slice(0, 8);
  }, [activeChannels, channel]);

  if (!channel) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          title="Channel unavailable"
          description="The requested channel could not be found or has been disabled."
          actionLabel={t.browse.exploreChannels}
          onAction={onBack}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Video Player + Channel Details */}
        <div className="lg:col-span-8 space-y-5">
          <VideoPlayer
            channel={channel}
            onBack={onBack}
            onPrevChannel={activeChannels.length > 1 ? handlePrev : undefined}
            onNextChannel={activeChannels.length > 1 ? handleNext : undefined}
            onOpenAdminEdit={() => onOpenAdmin()}
            onShare={onShare}
          />

          <section className="rounded-2xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <ChannelLogo src={channel.logoUrl} name={channel.name} size="lg" />
                <div className="min-w-0">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                    {channel.name}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-[#A7B0C0]">
                    <span>{channel.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      {channel.country}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Languages className="w-3.5 h-3.5" />
                      {channel.language}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenAdmin}
                className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium text-slate-700 dark:text-[#A7B0C0] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{t.player.openChannelManager}</span>
              </button>
            </div>

            <p className="mt-4 text-sm text-slate-700 dark:text-[#A7B0C0] leading-relaxed">
              {channel.description}
            </p>

            {channel.isDemo && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 text-xs text-amber-800 dark:text-amber-200">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Demo placeholder entry. Replace the stream URL in Channel Admin with an
                  authorized free-to-air HLS (.m3u8) or MP4 stream.
                </span>
              </div>
            )}
          </section>
        </div>

        {/* Up Next / Channel Switcher */}
        <aside className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] p-4">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mb-3">
            {t.nav.liveTv}
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {upNextChannels.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChannel(ch)}
                className="w-full py-3 px-2 -mx-2 rounded-xl flex items-center gap-3 text-start hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-colors group"
              >
                <ChannelLogo src={ch.logoUrl} name={ch.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {ch.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#A7B0C0] truncate">
                    {ch.category} · {ch.language}
                  </p>
                </div>
                <Play className="w-4 h-4 text-slate-400 group-hover:text-[#00D4FF] shrink-0" />
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
