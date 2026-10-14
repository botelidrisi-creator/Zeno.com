import React from 'react';
import { Youtube, Instagram, Send } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  onOpenStaticPage: (page: 'about' | 'contact' | 'privacy' | 'disclaimer') => void;
  onOpenAdmin: () => void;
  isAdmin?: boolean;
  isAdminLoggedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenStaticPage,
  onOpenAdmin,
  isAdmin,
  isAdminLoggedIn,
}) => {
  const isUserAdmin = Boolean(isAdmin ?? isAdminLoggedIn);
  return (
    <footer className="mt-12 bg-white dark:bg-[#0B1120] border-t border-slate-200 dark:border-blue-900/40 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-blue-500/20">
              Z
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight logo-3d">
                Zeno<span className="text-blue-500">.com</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
                Online Earning Reviews, Gift Cards & Job Updates
              </p>
            </div>
          </div>

          {/* Social Icons (YouTube, Instagram, Telegram set by user) */}
          <div className="flex items-center gap-2">
            {settings.youtubeUrl ? (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors border border-red-200 dark:border-red-900/60 shadow-xs"
              >
                <Youtube className="w-4 h-4 fill-current" />
              </a>
            ) : isUserAdmin ? (
              <button
                onClick={onOpenAdmin}
                title="Configure YouTube Link"
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Youtube className="w-4 h-4" />
              </button>
            ) : null}

            {settings.instagramUrl ? (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-9 h-9 rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center transition-colors border border-pink-200 dark:border-pink-900/60 shadow-xs"
              >
                <Instagram className="w-4 h-4" />
              </a>
            ) : isUserAdmin ? (
              <button
                onClick={onOpenAdmin}
                title="Configure Instagram Link"
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-pink-500 flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Instagram className="w-4 h-4" />
              </button>
            ) : null}

            {settings.telegramUrl ? (
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram"
                className="w-9 h-9 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center transition-colors border border-sky-200 dark:border-sky-900/60 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </a>
            ) : isUserAdmin ? (
              <button
                onClick={onOpenAdmin}
                title="Configure Telegram Link"
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-sky-400 flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Footer Nav Links */}
        <div className="py-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <button
            onClick={() => onOpenStaticPage('about')}
            className="hover:text-blue-500 transition-colors"
          >
            About
          </button>
          <button
            onClick={() => onOpenStaticPage('contact')}
            className="hover:text-blue-500 transition-colors"
          >
            Contact Us
          </button>
          <button
            onClick={() => onOpenStaticPage('privacy')}
            className="hover:text-blue-500 transition-colors"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => onOpenStaticPage('disclaimer')}
            className="hover:text-blue-500 transition-colors"
          >
            Disclaimer
          </button>
          {isUserAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-blue-500 font-bold hover:underline transition-colors cursor-pointer"
            >
              Admin Panel
            </button>
          )}
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-slate-100 dark:border-blue-900/30 text-center space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            © 2026 <strong>Zeno.com</strong>. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-500">
            Contact: <a href="mailto:animeanime9683@gmail.com" className="text-blue-500 hover:underline font-mono">animeanime9683@gmail.com</a>
          </p>
        </div>

      </div>
    </footer>
  );
};
