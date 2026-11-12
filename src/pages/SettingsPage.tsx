import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Database,
  Download,
  FileJson,
  ShieldCheck,
  Trash2,
  Wrench,
} from 'lucide-react';
import { PWAInstallButton } from '@/src/components/PWAInstallButton';
import { useApp } from '@/src/context/AppContext';
import { getActiveFirebaseConfig } from '@/src/services/firebaseDataProvider';
import {
  AppLanguage,
  AppTheme,
  AspectRatioMode,
  FirebaseRuntimeConfig,
  QualityPreference,
} from '@/src/types/settings';
import { downloadTextFile, exportChannelsToM3U } from '@/src/utils/m3u';

interface SettingsPageProps {
  onOpenAdmin: () => void;
  onOpenInfoPage: (page: 'about' | 'privacy' | 'terms' | 'contact') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onOpenAdmin,
  onOpenInfoPage,
}) => {
  const {
    channels,
    preferences,
    platformSettings,
    dataSourceMode,
    firebaseReady,
    updatePreferences,
    clearUserLocalData,
    switchDataSource,
    saveFirebaseSetup,
    t,
    isRtl,
  } = useApp();

  const [clearedNotice, setClearedNotice] = useState(false);
  const [showFirebaseForm, setShowFirebaseForm] = useState(false);
  const existingConfig = getActiveFirebaseConfig();
  const [fbConfig, setFbConfig] = useState<FirebaseRuntimeConfig>({
    apiKey: existingConfig?.apiKey || '',
    authDomain: existingConfig?.authDomain || '',
    projectId: existingConfig?.projectId || '',
    storageBucket: existingConfig?.storageBucket || '',
    messagingSenderId: existingConfig?.messagingSenderId || '',
    appId: existingConfig?.appId || '',
  });
  const [fbStatusMsg, setFbStatusMsg] = useState<string | null>(null);

  const handleClearData = () => {
    clearUserLocalData();
    setClearedNotice(true);
    window.setTimeout(() => setClearedNotice(false), 3500);
  };

  const handleSaveFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbConfig.apiKey.trim() || !fbConfig.projectId.trim() || !fbConfig.appId.trim()) {
      setFbStatusMsg('API Key, Project ID, and App ID are required.');
      return;
    }
    await saveFirebaseSetup({
      ...fbConfig,
      authDomain: fbConfig.authDomain.trim() || `${fbConfig.projectId.trim()}.firebaseapp.com`,
    });
    setFbStatusMsg('Firebase configuration saved and activated.');
    setShowFirebaseForm(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.settings.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B0C0]">
            {t.settings.subtitle}
          </p>
        </div>
        <PWAInstallButton />
      </div>

      {clearedNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t.settings.clearLocalConfirm}</span>
        </div>
      )}

      {/* GENERAL */}
      <section className="rounded-2xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] divide-y divide-slate-200 dark:divide-white/[0.06]">
        <div className="p-4 sm:p-5">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            {t.settings.generalSection}
          </h2>
        </div>

        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-sm font-medium text-slate-800 dark:text-white">
            {t.settings.language}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { code: 'en', label: 'English' },
                { code: 'ar', label: 'العربية' },
                { code: 'fr', label: 'Français' },
              ] as { code: AppLanguage; label: string }[]
            ).map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => updatePreferences({ language: lang.code })}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  preferences.language === lang.code
                    ? 'bg-[#6C5CE7] text-white'
                    : 'bg-slate-100 dark:bg-[#080B14] text-slate-700 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-sm font-medium text-slate-800 dark:text-white">
            {t.settings.theme}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'dark', label: t.settings.themeDark },
                { id: 'light', label: t.settings.themeLight },
              ] as { id: AppTheme; label: string }[]
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => updatePreferences({ theme: mode.id })}
                className={`min-h-[40px] px-4 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  preferences.theme === mode.id
                    ? 'bg-[#6C5CE7] text-white'
                    : 'bg-slate-100 dark:bg-[#080B14] text-slate-700 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-800 dark:text-white">
            {t.settings.appVersion}
          </span>
          <span className="font-mono text-xs text-slate-500 dark:text-[#A7B0C0] tabular-nums">
            v{platformSettings?.appVersion || '1.0.0'}
          </span>
        </div>

        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-800 dark:text-white">
            {t.settings.clearLocalData}
          </span>
          <button
            type="button"
            onClick={handleClearData}
            className="min-h-[40px] px-3.5 rounded-xl border border-[#FF365D]/40 text-[#FF365D] hover:bg-[#FF365D]/10 text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.common.clear}</span>
          </button>
        </div>
      </section>

      {/* PLAYER */}
      <section className="rounded-2xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] divide-y divide-slate-200 dark:divide-white/[0.06]">
        <div className="p-4 sm:p-5">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            {t.settings.playerSection}
          </h2>
        </div>

        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-800 dark:text-white">
            {t.settings.defaultAspectRatio}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['fit', 'fill', 'original'] as AspectRatioMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => updatePreferences({ defaultAspectRatio: mode })}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  preferences.defaultAspectRatio === mode
                    ? 'bg-[#6C5CE7] text-white'
                    : 'bg-slate-100 dark:bg-[#080B14] text-slate-700 dark:text-[#A7B0C0]'
                }`}
              >
                {t.player[mode]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-800 dark:text-white">
            {t.settings.defaultVolume}
          </span>
          <div className="flex items-center gap-3 w-full sm:w-56">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={preferences.defaultVolume}
              onChange={(e) =>
                updatePreferences({ defaultVolume: Number(e.target.value) })
              }
              className="flex-1 accent-[#6C5CE7]"
            />
            <span className="font-mono text-xs text-slate-600 dark:text-[#A7B0C0] w-10 text-end tabular-nums">
              {Math.round(preferences.defaultVolume * 100)}%
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-800 dark:text-white">
            {t.settings.preferredQuality}
          </span>
          <select
            value={preferences.preferredQuality}
            onChange={(e) =>
              updatePreferences({
                preferredQuality: e.target.value as QualityPreference,
              })
            }
            className="rounded-xl bg-slate-100 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white"
          >
            <option value="auto">Auto</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low (Data Saver)</option>
          </select>
        </div>

        <label className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer">
          <span className="text-sm font-medium text-slate-800 dark:text-white">
            {t.settings.autoplay}
          </span>
          <input
            type="checkbox"
            checked={preferences.autoplay}
            onChange={(e) => updatePreferences({ autoplay: e.target.checked })}
            className="h-5 w-5 accent-[#6C5CE7]"
          />
        </label>

        <label className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer">
          <span className="text-sm font-medium text-slate-800 dark:text-white">
            {t.settings.rememberLastChannel}
          </span>
          <input
            type="checkbox"
            checked={preferences.rememberLastChannel}
            onChange={(e) =>
              updatePreferences({ rememberLastChannel: e.target.checked })
            }
            className="h-5 w-5 accent-[#6C5CE7]"
          />
        </label>
      </section>

      {/* ADMINISTRATION & EXTERNAL DATA */}
      <section className="rounded-2xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] divide-y divide-slate-200 dark:divide-white/[0.06]">
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            {t.settings.adminSection}
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
              dataSourceMode === 'firebase'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
            }`}
          >
            {dataSourceMode === 'firebase' ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <Database className="w-3.5 h-3.5" />
            )}
            {dataSourceMode === 'firebase'
              ? t.common.cloudSyncBadge
              : t.common.localDemoBadge}
          </span>
        </div>

        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-white">
              {t.settings.openAdminConsole}
            </p>
            <p className="text-xs text-slate-500 dark:text-[#A7B0C0] mt-0.5">
              Add, edit, test, import, or export channels externally.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="min-h-[42px] px-4 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <Wrench className="w-4 h-4" />
            <span>{t.nav.admin}</span>
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white">
                {t.settings.dataSourceStatus}
              </p>
              <p className="text-xs text-slate-500 dark:text-[#A7B0C0] mt-0.5">
                {firebaseReady
                  ? 'Firebase client config detected. Switch between Cloud Firestore and Local Demo Mode.'
                  : 'Running in Local Demo Mode (local JSON + IndexedDB). Connect Firebase below to enable remote cloud sync.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {firebaseReady && (
                <button
                  type="button"
                  onClick={() =>
                    switchDataSource(
                      dataSourceMode === 'firebase' ? 'local-demo' : 'firebase'
                    )
                  }
                  className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {dataSourceMode === 'firebase'
                    ? 'Switch to Local Demo'
                    : 'Use Firebase Cloud'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFirebaseForm((v) => !v)}
                className="min-h-[40px] px-3.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {t.settings.configureFirebase}
              </button>
            </div>
          </div>

          {fbStatusMsg && (
            <p className="text-xs text-[#00D4FF]">{fbStatusMsg}</p>
          )}

          {showFirebaseForm && (
            <form
              onSubmit={handleSaveFirebase}
              className="mt-3 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 p-4 space-y-3"
            >
              <p className="text-xs text-slate-600 dark:text-[#A7B0C0]">
                Enter your public Firebase Web App config (from Firebase Console → Project Settings). Never paste private admin service accounts here.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="apiKey *"
                  value={fbConfig.apiKey}
                  onChange={(e) =>
                    setFbConfig({ ...fbConfig, apiKey: e.target.value })
                  }
                  className="rounded-lg bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="projectId *"
                  value={fbConfig.projectId}
                  onChange={(e) =>
                    setFbConfig({ ...fbConfig, projectId: e.target.value })
                  }
                  className="rounded-lg bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="authDomain (optional)"
                  value={fbConfig.authDomain}
                  onChange={(e) =>
                    setFbConfig({ ...fbConfig, authDomain: e.target.value })
                  }
                  className="rounded-lg bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="appId *"
                  value={fbConfig.appId}
                  onChange={(e) =>
                    setFbConfig({ ...fbConfig, appId: e.target.value })
                  }
                  className="rounded-lg bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {firebaseReady && (
                  <button
                    type="button"
                    onClick={async () => {
                      await saveFirebaseSetup(null);
                      setFbStatusMsg('Disconnected runtime Firebase config.');
                      setShowFirebaseForm(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#FF365D] hover:bg-[#FF365D]/10"
                  >
                    Disconnect
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#6C5CE7] text-white text-xs font-semibold"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-800 dark:text-white">
            Catalog Backup & Export
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  'channels.json',
                  JSON.stringify(channels, null, 2),
                  'application/json'
                )
              }
              className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-white inline-flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <FileJson className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  'nova-tv-playlist.m3u',
                  exportChannelsToM3U(channels),
                  'audio/x-mpegurl'
                )
              }
              className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-white inline-flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <Download className="w-4 h-4" />
              <span>Export M3U</span>
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT & LEGAL */}
      <section className="rounded-2xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] divide-y divide-slate-200 dark:divide-white/[0.06]">
        <div className="p-4 sm:p-5">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            {t.settings.aboutSection}
          </h2>
        </div>
        {(
          [
            { id: 'about', label: t.settings.aboutNova },
            { id: 'privacy', label: t.settings.privacyPolicy },
            { id: 'terms', label: t.settings.termsOfUse },
            { id: 'contact', label: t.settings.contactUs },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpenInfoPage(item.id)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-start text-sm font-medium text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <span>{item.label}</span>
            <ChevronRight
              className={`w-4 h-4 text-slate-400 ${isRtl ? 'rotate-180' : ''}`}
            />
          </button>
        ))}
      </section>
    </div>
  );
};
