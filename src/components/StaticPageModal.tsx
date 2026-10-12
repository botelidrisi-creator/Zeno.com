import React from 'react';
import { X, ShieldCheck, Mail, Info, AlertTriangle } from 'lucide-react';
import { SiteSettings } from '../types';

interface StaticPageModalProps {
  page: 'about' | 'contact' | 'privacy' | 'disclaimer' | null;
  onClose: () => void;
  settings: SiteSettings;
}

export const StaticPageModal: React.FC<StaticPageModalProps> = ({
  page,
  onClose,
  settings,
}) => {
  if (!page) return null;

  const contentMap = {
    about: {
      title: 'About Zeno.com',
      icon: <Info className="w-5 h-5 text-blue-500" />,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Welcome to <strong>Zeno.com</strong>, your mobile-first resource dedicated to online earning application reviews, redeem codes, job vacancies, and health tips.
          </p>
          <p>
            At <strong>Zeno.com</strong>, we share helpful guides, direct application download links, and referral bonuses.
          </p>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
            <strong>Key Features:</strong>
            <ul className="list-disc ml-4 mt-1 space-y-1">
              <li>Direct app download links and referral codes.</li>
              <li>Bilingual reporting in both English and Hindi.</li>
              <li>Fast, lightweight mobile browsing experience.</li>
            </ul>
          </div>
        </div>
      ),
    },
    contact: {
      title: 'Contact Us',
      icon: <Mail className="w-5 h-5 text-emerald-500" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Have questions, feedback, or an inquiry for <strong>Zeno.com</strong>? Reach out to us:
          </p>
          <div className="space-y-2.5">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Contact Email</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">contact@zeno.com</span>
            </div>
            {(settings.youtubeUrl || settings.instagramUrl || settings.telegramUrl) && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Official Channels</span>
                <div className="flex gap-4 mt-1 text-blue-500 font-bold">
                  {settings.youtubeUrl && (
                    <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer">YouTube ↗</a>
                  )}
                  {settings.instagramUrl && (
                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram ↗</a>
                  )}
                  {settings.telegramUrl && (
                    <a href={settings.telegramUrl} target="_blank" rel="noopener noreferrer">Telegram ↗</a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      icon: <ShieldCheck className="w-5 h-5 text-purple-500" />,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            At <strong>Zeno.com</strong>, the privacy of our visitors is very important to us.
          </p>
          <h4 className="font-bold text-slate-900 dark:text-white">Information Handling</h4>
          <p>
            <strong>Zeno.com</strong> does not collect personal sensitive information. User preferences like theme mode and language are saved locally on your device for a smooth experience.
          </p>
        </div>
      ),
    },
    disclaimer: {
      title: 'Disclaimer',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            All information on <strong>Zeno.com</strong> is published for informational and educational purposes.
          </p>
          <p>
            Third-party applications and offers may change their terms or rewards at any time. Please review terms on their respective platforms before downloading or registering.
          </p>
        </div>
      ),
    },
  };

  const current = contentMap[page];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1626] rounded-3xl shadow-2xl border border-slate-200 dark:border-blue-900/40 z-10 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-blue-900/30 flex items-center justify-between bg-slate-50 dark:bg-[#111C2E]">
          <div className="flex items-center gap-2.5">
            {current.icon}
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {current.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {current.content}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-blue-900/30 bg-slate-50 dark:bg-[#111C2E] flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400">
            Zeno.com
          </span>
          <button
            onClick={onClose}
            className="btn-3d-blue px-4 py-1.5 rounded-xl text-white font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
