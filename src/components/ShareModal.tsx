import React, { useState } from 'react';
import { Check, Copy, Share2, X } from 'lucide-react';
import { Channel } from '@/src/types/channel';
import { ChannelLogo } from './ChannelLogo';

interface ShareModalProps {
  channel: Channel | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ channel, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!channel) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}#/watch/${channel.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback selection copy
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${channel.name} — NOVA TV`,
          text: `Watch ${channel.name} (${channel.category}) on NOVA TV`,
          url: shareUrl,
        });
      } catch {
        // Cancelled by user
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <ChannelLogo src={channel.logoUrl} name={channel.name} size="md" />
            <div className="min-w-0">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white truncate">
                {channel.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#A7B0C0] truncate">
                {channel.category} · {channel.country}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5">
          <label className="block text-xs font-medium text-slate-600 dark:text-[#A7B0C0] mb-1.5">
            Direct Channel Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 min-w-0 rounded-xl bg-slate-100 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2.5 text-xs font-mono text-slate-800 dark:text-slate-200"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[42px] px-4 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="mt-4 w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via Device</span>
          </button>
        )}
      </div>
    </div>
  );
};
