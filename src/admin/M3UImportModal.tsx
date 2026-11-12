import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, FileUp, Upload, X } from 'lucide-react';
import { ChannelFormInput } from '@/src/types/channel';
import { parsedEntriesToInputs, parseM3UPlaylist } from '@/src/utils/m3u';

interface M3UImportModalProps {
  open: boolean;
  startingOrder: number;
  onClose: () => void;
  onImport: (inputs: ChannelFormInput[]) => Promise<void>;
}

const SAMPLE_M3U = `#EXTM3U
#EXTINF:-1 tvg-logo="./logos/nova-world.svg" group-title="News" tvg-country="UK" tvg-language="English",Sample Authorized News Feed
https://example.invalid/demo/sample-news/master.m3u8`;

export const M3UImportModal: React.FC<M3UImportModalProps> = ({
  open,
  startingOrder,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => parseM3UPlaylist(rawText), [rawText]);
  const validEntries = useMemo(() => parsed.filter((e) => e.valid), [parsed]);

  if (!open) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRawText(text);
  };

  const handleConfirm = async () => {
    setError(null);
    if (validEntries.length === 0) {
      setError('No valid channel entries detected in the playlist.');
      return;
    }
    setImporting(true);
    try {
      const inputs = parsedEntriesToInputs(parsed, startingOrder);
      await onImport(inputs);
      setRawText('');
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to import M3U channels.'
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Import M3U Playlist
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-[#A7B0C0] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A7B0C0]">
            Upload an authorized <code className="font-mono">.m3u</code> or{' '}
            <code className="font-mono">.m3u8</code> playlist file or paste its contents below.
            Only import streams you are authorized to broadcast.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <label className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2 cursor-pointer transition-colors">
              <FileUp className="w-4 h-4 text-[#00D4FF]" />
              <span>Choose .m3u File</span>
              <input
                type="file"
                accept=".m3u,.m3u8,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setRawText(SAMPLE_M3U)}
              className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-[#A7B0C0] hover:bg-slate-50 dark:hover:bg-white/5"
            >
              Load Sample Format
            </button>
          </div>

          <textarea
            rows={6}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="#EXTM3U&#10;#EXTINF:-1 group-title=&quot;News&quot;,Channel Name&#10;https://..."
            className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 p-3 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
          />

          {parsed.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080B14] p-3.5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Preview ({validEntries.length} valid / {parsed.length} total)
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 dark:divide-white/[0.06] text-xs">
                {parsed.slice(0, 25).map((entry, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {entry.name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-[#A7B0C0] truncate">
                        {entry.category} · {entry.streamUrl}
                      </p>
                    </div>
                    {entry.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#FF365D] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-[#FF365D]/10 border border-[#FF365D]/30 p-3 text-xs text-[#FF365D]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-[#A7B0C0]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={importing || validEntries.length === 0}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] disabled:opacity-50 text-sm font-semibold text-white inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Import {validEntries.length} Channels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
