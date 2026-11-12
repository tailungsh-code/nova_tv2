import React from 'react';
import { ArrowLeft, Mail, ShieldCheck, Tv } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';

export type InfoPageType = 'about' | 'privacy' | 'terms' | 'contact';

interface InfoPagesProps {
  page: InfoPageType;
  onBack: () => void;
}

export const InfoPages: React.FC<InfoPagesProps> = ({ page, onBack }) => {
  const { platformSettings, t, isRtl } = useApp();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-[#A7B0C0] hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        <span>{t.player.back}</span>
      </button>

      <article className="rounded-3xl bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 space-y-4">
        {page === 'about' && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#6C5CE7]/15 text-[#6C5CE7] dark:text-[#00D4FF] flex items-center justify-center">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  {t.settings.aboutNova}
                </h1>
                <p className="text-xs font-mono text-slate-500 dark:text-[#A7B0C0]">
                  Version {platformSettings?.appVersion || '1.0.0'}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-[#A7B0C0] leading-relaxed">
              NOVA TV is a lightweight, installable free-to-air television streaming platform designed for high legibility on desktop browsers, mobile phones, and Android WebView containers.
            </p>
            <p className="text-sm text-slate-700 dark:text-[#A7B0C0] leading-relaxed">
              Channel catalogs are completely decoupled from the application source code. Platform operators can manage authorized HLS and MP4 streams via JSON, IndexedDB local mode, or Firebase Firestore + Firebase Authentication.
            </p>
          </>
        )}

        {page === 'privacy' && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#6C5CE7]/15 text-[#6C5CE7] dark:text-[#00D4FF] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {t.settings.privacyPolicy}
              </h1>
            </div>
            <p className="text-sm text-slate-700 dark:text-[#A7B0C0] leading-relaxed">
              NOVA TV stores user preferences—including favorite channels, watch history, search history, theme, and language selection—strictly in local browser storage (LocalStorage and IndexedDB) on your device.
            </p>
            <p className="text-sm text-slate-700 dark:text-[#A7B0C0] leading-relaxed">
              When optional Firebase integration is enabled by the platform owner, channel catalog records and administrator authentication sessions are handled directly through Firebase services over HTTPS. You can clear all local user preferences anytime from Settings.
            </p>
          </>
        )}

        {page === 'terms' && (
          <>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {t.settings.termsOfUse}
            </h1>
            <p className="text-sm text-slate-700 dark:text-[#A7B0C0] leading-relaxed">
              NOVA TV is built exclusively for streaming legally licensed, public-access, or broadcaster-authorized free-to-air television feeds.
            </p>
            <p className="text-sm text-slate-700 dark:text-[#A7B0C0] leading-relaxed">
              Default catalog items shipped with the starter build are clearly marked demonstration placeholders and are not operational television broadcasts. Platform operators are solely responsible for verifying broadcast permissions and stream distribution rights for any channels they publish.
            </p>
          </>
        )}

        {page === 'contact' && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#6C5CE7]/15 text-[#6C5CE7] dark:text-[#00D4FF] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {t.settings.contactUs}
              </h1>
            </div>
            <p className="text-sm text-slate-700 dark:text-[#A7B0C0] leading-relaxed">
              For broadcaster stream submissions, licensing inquiries, or technical support regarding your NOVA TV deployment, reach out to the platform maintainer:
            </p>
            <div className="rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-white/10 p-4 text-sm space-y-1.5">
              <p className="font-medium text-slate-900 dark:text-white">
                Email:{' '}
                <span className="font-mono text-[#6C5CE7] dark:text-[#00D4FF]">
                  {platformSettings?.contactEmail || 'broadcast-support@novatv-example.org'}
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-[#A7B0C0]">
                Configure this contact address externally in <code className="font-mono">settings.json</code>.
              </p>
            </div>
          </>
        )}
      </article>
    </div>
  );
};
