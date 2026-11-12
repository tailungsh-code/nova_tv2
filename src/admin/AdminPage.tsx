import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  Edit3,
  FileJson,
  Lock,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { ChannelLogo } from '@/src/components/ChannelLogo';
import { EmptyState } from '@/src/components/EmptyState';
import { useApp } from '@/src/context/AppContext';
import { Channel, ChannelFormInput } from '@/src/types/channel';
import { downloadTextFile, exportChannelsToM3U } from '@/src/utils/m3u';
import { testStreamUrl } from '@/src/utils/streamTester';
import { ChannelFormModal } from './ChannelFormModal';
import { M3UImportModal } from './M3UImportModal';

interface AdminPageProps {
  onOpenSettings: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onOpenSettings }) => {
  const {
    channels,
    categories,
    dataSourceMode,
    adminSession,
    signInAdmin,
    signOutAdmin,
    addChannel,
    updateChannel,
    deleteChannel,
    toggleChannelActive,
    bulkImportChannels,
    resetDemoCatalog,
    t,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);

  const showToast = (type: 'ok' | 'err', text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 4000);
  };

  const filteredChannels = useMemo(() => {
    const q = search.trim().toLowerCase();
    return channels.filter((ch) => {
      if (categoryFilter !== 'All' && ch.category !== categoryFilter) return false;
      if (statusFilter === 'active' && !ch.isActive) return false;
      if (statusFilter === 'inactive' && ch.isActive) return false;
      if (!q) return true;
      return (
        ch.name.toLowerCase().includes(q) ||
        ch.category.toLowerCase().includes(q) ||
        ch.country.toLowerCase().includes(q) ||
        ch.language.toLowerCase().includes(q)
      );
    });
  }, [channels, search, categoryFilter, statusFilter]);

  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInAdmin(email, password);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Authentication failed. Verify credentials.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEnterLocalDemo = async () => {
    setAuthLoading(true);
    try {
      await signInAdmin('', '');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFormSubmit = async (input: ChannelFormInput, editingId?: string) => {
    if (editingId) {
      await updateChannel(editingId, input);
      showToast('ok', `Updated "${input.name}" successfully.`);
    } else {
      await addChannel(input);
      showToast('ok', `Added "${input.name}" to catalog.`);
    }
  };

  const handleQuickTest = async (ch: Channel) => {
    setTestingChannelId(ch.id);
    const res = await testStreamUrl(ch.streamUrl);
    setTestingChannelId(null);
    showToast(res.status === 'reachable' ? 'ok' : 'err', `${ch.name}: ${res.message}`);
  };

  const handleExportJson = () => {
    downloadTextFile(
      'channels.json',
      JSON.stringify(channels, null, 2),
      'application/json'
    );
    showToast('ok', 'Exported channels.json');
  };

  const handleExportM3u = () => {
    downloadTextFile(
      'nova-tv-playlist.m3u',
      exportChannelsToM3U(channels),
      'audio/x-mpegurl'
    );
    showToast('ok', 'Exported nova-tv-playlist.m3u');
  };

  // Authentication Gate
  if (!adminSession.authenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
        <div className="rounded-3xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-12 w-12 rounded-2xl bg-[#6C5CE7]/15 border border-[#6C5CE7]/30 flex items-center justify-center text-[#6C5CE7] dark:text-[#00D4FF]">
              {dataSourceMode === 'firebase' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Database className="w-6 h-6" />
              )}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {dataSourceMode === 'firebase'
                  ? t.admin.firebaseSignInTitle
                  : t.admin.localModeNoticeTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#A7B0C0]">
                {dataSourceMode === 'firebase'
                  ? t.common.cloudSyncBadge
                  : t.common.localDemoBadge}
              </p>
            </div>
          </div>

          {dataSourceMode === 'firebase' ? (
            <form onSubmit={handleFirebaseLogin} className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-[#A7B0C0]">
                {t.admin.firebaseSignInBody}
              </p>

              {authError && (
                <div className="flex items-start gap-2 rounded-xl bg-[#FF365D]/10 border border-[#FF365D]/30 p-3 text-xs text-[#FF365D]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A7B0C0] mb-1">
                  {t.admin.email}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A7B0C0] mb-1">
                  {t.admin.password}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full min-h-[44px] rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-sm font-semibold transition-colors"
              >
                {authLoading ? t.common.loading : t.admin.signIn}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-[#A7B0C0] leading-relaxed">
                {t.admin.localModeNoticeBody}
              </p>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3.5 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Static browser builds cannot secure administrator passwords in JavaScript.
                  Use Local Demo Mode to edit, test, and export <code className="font-mono">channels.json</code>, or connect Firebase Authentication in Settings for remote production security.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleEnterLocalDemo}
                  disabled={authLoading}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-sm font-semibold transition-colors"
                >
                  {t.admin.enterDemoAdmin}
                </button>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-[#A7B0C0] hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {t.settings.configureFirebase}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Mode Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {t.admin.title}
            </h1>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-md border ${
                dataSourceMode === 'firebase'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
              }`}
            >
              {dataSourceMode === 'firebase'
                ? t.common.cloudSyncBadge
                : t.common.localDemoBadge}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B0C0]">
            {t.admin.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingChannel(null);
              setFormOpen(true);
            }}
            className="min-h-[42px] px-4 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.admin.addChannel}</span>
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="min-h-[42px] px-3.5 rounded-xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium text-slate-800 dark:text-white inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Upload className="w-4 h-4 text-[#00D4FF]" />
            <span>{t.admin.importM3u}</span>
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="min-h-[42px] px-3.5 rounded-xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium text-slate-800 dark:text-white inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <FileJson className="w-4 h-4" />
            <span>{t.admin.exportJson}</span>
          </button>
          <button
            type="button"
            onClick={handleExportM3u}
            className="min-h-[42px] px-3.5 rounded-xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium text-slate-800 dark:text-white inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{t.admin.exportM3u}</span>
          </button>
          {dataSourceMode === 'local-demo' && (
            <button
              type="button"
              onClick={async () => {
                await resetDemoCatalog();
                showToast('ok', 'Restored default demonstration channels.');
              }}
              className="min-h-[42px] px-3.5 rounded-xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium text-slate-700 dark:text-[#A7B0C0] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.admin.resetDefaults}</span>
            </button>
          )}
          <button
            type="button"
            onClick={signOutAdmin}
            className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-medium text-slate-700 dark:text-[#A7B0C0] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.admin.signOut}</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toast && (
        <div
          role="status"
          className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs sm:text-sm border ${
            toast.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-[#FF365D]/10 border-[#FF365D]/30 text-[#FF365D]'
          }`}
        >
          {toast.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.admin.searchPlaceholder}
            className="w-full rounded-xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 ps-10 pe-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
          }
          className="rounded-xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">{t.admin.active}</option>
          <option value="inactive">{t.admin.inactive}</option>
        </select>
      </div>

      {/* Channels List / Table */}
      {filteredChannels.length === 0 ? (
        <EmptyState
          title={t.browse.noResultsTitle}
          description="Add a new channel or clear your active search filters."
          actionLabel={t.admin.addChannel}
          onAction={() => {
            setEditingChannel(null);
            setFormOpen(true);
          }}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08]">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] text-[11px] font-semibold text-slate-500 dark:text-[#A7B0C0]">
                <th className="py-3 px-4 text-start">#</th>
                <th className="py-3 px-4 text-start">Channel</th>
                <th className="py-3 px-4 text-start hidden md:table-cell">Category</th>
                <th className="py-3 px-4 text-start hidden lg:table-cell">Country / Lang</th>
                <th className="py-3 px-4 text-start">Status</th>
                <th className="py-3 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-sm">
              {filteredChannels.map((ch) => (
                <tr
                  key={ch.id}
                  className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-[#A7B0C0] tabular-nums">
                    {ch.sortOrder}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <ChannelLogo src={ch.logoUrl} name={ch.name} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                            {ch.name}
                          </span>
                          {ch.featured && (
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-[#A7B0C0] truncate max-w-[240px]">
                          {ch.streamUrl}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <select
                      aria-label={`Change category for ${ch.name}`}
                      value={ch.category}
                      onChange={async (e) => {
                        await updateChannel(ch.id, { category: e.target.value });
                        showToast('ok', `Moved "${ch.name}" to ${e.target.value}.`);
                      }}
                      className="rounded-lg bg-slate-100 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-xs text-slate-600 dark:text-[#A7B0C0]">
                    {ch.country} · {ch.language}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={async () => {
                        await toggleChannelActive(ch.id, !ch.isActive);
                        showToast(
                          'ok',
                          `${ch.name} ${!ch.isActive ? 'activated' : 'deactivated'}.`
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        ch.isActive
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-[#A7B0C0]'
                      }`}
                    >
                      {ch.isActive ? t.admin.active : t.admin.inactive}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickTest(ch)}
                        disabled={testingChannelId === ch.id}
                        title={t.admin.testStream}
                        aria-label={`Test stream for ${ch.name}`}
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-[#00D4FF]"
                      >
                        <Activity
                          className={`w-4 h-4 ${
                            testingChannelId === ch.id ? 'animate-pulse' : ''
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingChannel(ch);
                          setFormOpen(true);
                        }}
                        title={t.common.edit}
                        aria-label={`Edit ${ch.name}`}
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {confirmDeleteId === ch.id ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteChannel(ch.id);
                            setConfirmDeleteId(null);
                            showToast('ok', `Deleted "${ch.name}".`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FF365D] text-white text-xs font-semibold"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(ch.id)}
                          title={t.common.delete}
                          aria-label={`Delete ${ch.name}`}
                          className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg hover:bg-[#FF365D]/10 text-slate-500 hover:text-[#FF365D]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ChannelFormModal
        open={formOpen}
        editingChannel={editingChannel}
        categories={categories}
        defaultSortOrder={channels.length + 1}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <M3UImportModal
        open={importOpen}
        startingOrder={channels.length + 1}
        onClose={() => setImportOpen(false)}
        onImport={async (inputs) => {
          const added = await bulkImportChannels(inputs);
          showToast('ok', `Imported ${added.length} channels from M3U playlist.`);
        }}
      />
    </div>
  );
};
