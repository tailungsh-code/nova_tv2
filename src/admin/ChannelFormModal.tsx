import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { ChannelLogo } from '@/src/components/ChannelLogo';
import { Category, Channel, ChannelFormInput } from '@/src/types/channel';
import { isDemoPlaceholderUrl, isValidStreamUrl } from '@/src/utils/m3u';
import { StreamTestResult, testStreamUrl } from '@/src/utils/streamTester';

interface ChannelFormModalProps {
  open: boolean;
  editingChannel: Channel | null;
  categories: Category[];
  defaultSortOrder: number;
  onClose: () => void;
  onSubmit: (input: ChannelFormInput, editingId?: string) => Promise<void>;
}

const EMPTY_FORM: ChannelFormInput = {
  name: '',
  logoUrl: './logos/meridian-global.svg',
  thumbnailUrl: './images/hero_featured_cinema.jpg',
  streamUrl: '',
  alternativeStreamUrl: '',
  epgUrl: '',
  category: 'News',
  country: 'International',
  language: 'English',
  description: '',
  featured: false,
  isActive: true,
  sortOrder: 1,
  isDemo: false,
  isLive: true,
  popularity: 75,
};

export const ChannelFormModal: React.FC<ChannelFormModalProps> = ({
  open,
  editingChannel,
  categories,
  defaultSortOrder,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<ChannelFormInput>(EMPTY_FORM);
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<StreamTestResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setTestResult(null);
    setUseCustomCategory(false);
    setCustomCategory('');

    if (editingChannel) {
      setForm({
        name: editingChannel.name,
        logoUrl: editingChannel.logoUrl,
        thumbnailUrl: editingChannel.thumbnailUrl || './images/hero_featured_cinema.jpg',
        streamUrl: editingChannel.streamUrl,
        alternativeStreamUrl: editingChannel.alternativeStreamUrl || '',
        epgUrl: editingChannel.epgUrl || '',
        category: editingChannel.category,
        country: editingChannel.country,
        language: editingChannel.language,
        description: editingChannel.description,
        featured: editingChannel.featured,
        isActive: editingChannel.isActive,
        sortOrder: editingChannel.sortOrder,
        isDemo: editingChannel.isDemo,
        isLive: editingChannel.isLive ?? true,
        popularity: editingChannel.popularity ?? 75,
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        sortOrder: defaultSortOrder,
      });
    }
  }, [open, editingChannel, defaultSortOrder]);

  if (!open) return null;

  const handleTestStream = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testStreamUrl(form.streamUrl);
    setTestResult(res);
    setTesting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalCategory = useCustomCategory
      ? customCategory.trim()
      : form.category.trim();

    if (!form.name.trim()) {
      setFormError('Channel name is required.');
      return;
    }
    if (!isValidStreamUrl(form.streamUrl)) {
      setFormError('Streaming URL must be a valid http:// or https:// URL.');
      return;
    }
    if (form.alternativeStreamUrl && !isValidStreamUrl(form.alternativeStreamUrl)) {
      setFormError('Alternative stream URL must be a valid http:// or https:// URL.');
      return;
    }
    if (form.epgUrl && !isValidStreamUrl(form.epgUrl)) {
      setFormError('EPG URL must be a valid http:// or https:// URL.');
      return;
    }
    if (!finalCategory) {
      setFormError('Please select or enter a category.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(
        {
          ...form,
          name: form.name.trim(),
          streamUrl: form.streamUrl.trim(),
          alternativeStreamUrl: form.alternativeStreamUrl?.trim() || '',
          epgUrl: form.epgUrl?.trim() || '',
          category: finalCategory,
          country: form.country.trim() || 'International',
          language: form.language.trim() || 'English',
          description: form.description.trim() || `${form.name.trim()} (${finalCategory})`,
          isDemo: isDemoPlaceholderUrl(form.streamUrl),
        },
        editingChannel?.id
      );
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to save channel changes.'
      );
    } finally {
      setSubmitting(false);
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
            {editingChannel ? 'Edit Channel' : 'Add New Channel'}
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {formError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-[#FF365D]/10 border border-[#FF365D]/30 p-3 text-xs text-[#FF365D]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Logo Preview + Name */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-2 flex justify-center">
              <ChannelLogo
                src={form.logoUrl}
                name={form.name || 'NV'}
                size="lg"
              />
            </div>
            <div className="sm:col-span-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A7B0C0] mb-1">
                  Channel Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Horizon Documentary"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A7B0C0] mb-1">
                  Channel Logo URL
                </label>
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://... or ./logos/nova-world.svg"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                />
              </div>
            </div>
          </div>

          {/* Primary Stream URL + Tester */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A7B0C0] mb-1">
              Streaming URL (HLS .m3u8 or MP4) *
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                required
                value={form.streamUrl}
                onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
                placeholder="https://your-authorized-cdn.example/stream/playlist.m3u8"
                className="flex-1 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
              <button
                type="button"
                onClick={handleTestStream}
                disabled={testing || !form.streamUrl.trim()}
                className="min-h-[42px] px-4 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 disabled:opacity-50 text-xs font-semibold text-slate-900 dark:text-white inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
              >
                {testing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4 text-[#00D4FF]" />
                )}
                <span>Test Stream URL</span>
              </button>
            </div>
            {testResult && (
              <div
                className={`mt-2 flex items-start gap-2 rounded-xl p-2.5 text-xs border ${
                  testResult.status === 'reachable'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : testResult.status === 'demo-placeholder' ||
                        testResult.status === 'cors-restricted'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                      : 'bg-[#FF365D]/10 border-[#FF365D]/30 text-[#FF365D]'
                }`}
              >
                {testResult.status === 'reachable' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Category, Country, Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700 dark:text-[#A7B0C0]">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomCategory((v) => !v)}
                  className="text-[11px] font-medium text-[#6C5CE7] dark:text-[#00D4FF] hover:underline"
                >
                  {useCustomCategory ? 'Use existing' : '+ Custom'}
                </button>
              </div>
              {useCustomCategory ? (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter new category"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
                />
              ) : (
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-[#A7B0C0] mb-1">
                Country
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-[#A7B0C0] mb-1">
                Language
              </label>
              <input
                type="text"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Optional Alternative Stream & EPG URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-[#A7B0C0] mb-1">
                Alternative Stream URL (Optional)
              </label>
              <input
                type="url"
                value={form.alternativeStreamUrl || ''}
                onChange={(e) =>
                  setForm({ ...form, alternativeStreamUrl: e.target.value })
                }
                placeholder="https://backup.example/stream.m3u8"
                className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-[#A7B0C0] mb-1">
                EPG XMLTV URL (Optional)
              </label>
              <input
                type="url"
                value={form.epgUrl || ''}
                onChange={(e) => setForm({ ...form, epgUrl: e.target.value })}
                placeholder="https://epg.example/guide.xml"
                className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-[#A7B0C0] mb-1">
              Channel Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief overview of the channel's programming..."
              className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          {/* Flags & Sort Order */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 items-center">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-[#A7B0C0] mb-1">
                Sort Order
              </label>
              <input
                type="number"
                min={1}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) || 1 })
                }
                className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-white cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 accent-[#6C5CE7] rounded"
              />
              <span>Active</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-white cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="h-4 w-4 accent-[#00D4FF] rounded"
              />
              <span>Featured</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-white cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={form.isLive !== false}
                onChange={(e) => setForm({ ...form, isLive: e.target.checked })}
                className="h-4 w-4 accent-[#FF365D] rounded"
              />
              <span>Live Stream</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-[#A7B0C0] hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] disabled:opacity-50 text-sm font-semibold text-white inline-flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingChannel ? 'Save Changes' : 'Add Channel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
