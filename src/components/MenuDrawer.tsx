import React from 'react';
import { 
  X, 
  Home, 
  Youtube, 
  Instagram, 
  Info, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  Settings, 
  ChevronRight,
  Send,
  Lock,
  LogOut
} from 'lucide-react';
import { SiteSettings } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome: () => void;
  onOpenStaticPage: (page: 'about' | 'contact' | 'privacy' | 'disclaimer') => void;
  onOpenAdmin: () => void;
  settings: SiteSettings;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onGoHome,
  onOpenStaticPage,
  onOpenAdmin,
  settings,
  isAdminLoggedIn,
  onAdminLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-80 max-w-[85vw] bg-white dark:bg-[#0B1120] h-full flex flex-col shadow-2xl z-10 overflow-y-auto border-r border-slate-200 dark:border-blue-900/40 transition-colors animate-in slide-in-from-left duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 dark:border-blue-900/30 flex items-center justify-between bg-slate-50/70 dark:bg-[#0E1626]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-blue-500/20">
              Z
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight logo-3d">
                Zeno<span className="text-blue-500">.com</span>
              </span>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 -mt-1">
                Official Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="p-4 space-y-1">
          <button
            onClick={() => {
              onGoHome();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-md shadow-blue-500/25 transition-all"
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4 text-white" />
              <span>All Feed</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        </div>

        {/* Social Links Section (links set by user in Settings) */}
        <div className="p-4 mx-4 my-2 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-[#111827] dark:to-[#0F172A] border border-slate-200/80 dark:border-blue-900/30 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Social Channels
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {settings.youtubeUrl ? (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 active:translate-y-0.5 transition-all"
              >
                <Youtube className="w-4 h-4 fill-white" />
                <span>YouTube</span>
              </a>
            ) : (
              <button
                onClick={() => {
                  onOpenAdmin();
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold border border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 transition-all"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>+ Set Link</span>
              </button>
            )}

            {settings.instagramUrl ? (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-pink-500/20 active:translate-y-0.5 transition-all"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </a>
            ) : (
              <button
                onClick={() => {
                  onOpenAdmin();
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold border border-dashed border-slate-300 dark:border-slate-700 hover:border-pink-500 transition-all"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>+ Set Link</span>
              </button>
            )}
          </div>

          {settings.telegramUrl ? (
            <a
              href={settings.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:translate-y-0.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Channel</span>
            </a>
          ) : (
            <button
              onClick={() => {
                onOpenAdmin();
                onClose();
              }}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold border border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>+ Set Telegram Link</span>
            </button>
          )}
        </div>

        {/* Informational Pages */}
        <div className="p-4 space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Information
          </p>
          <button
            onClick={() => {
              onOpenStaticPage('about');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Info className="w-4 h-4 text-blue-500" />
            <span>About Zeno.com</span>
          </button>
          <button
            onClick={() => {
              onOpenStaticPage('contact');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Mail className="w-4 h-4 text-emerald-500" />
            <span>Contact Us</span>
          </button>
          <button
            onClick={() => {
              onOpenStaticPage('privacy');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => {
              onOpenStaticPage('disclaimer');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Disclaimer</span>
          </button>
        </div>

        {/* Footer in Drawer with Admin Button & Logout */}
        <div className="mt-auto p-4 border-t border-slate-100 dark:border-blue-900/30 bg-slate-50/70 dark:bg-[#0E1626]">
          {isAdminLoggedIn ? (
            <div className="space-y-2">
              <button
                onClick={() => {
                  onOpenAdmin();
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin Panel (Logged In)</span>
              </button>
              <button
                onClick={() => {
                  onAdminLogout();
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout Admin</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAdmin();
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-blue-400 dark:border-blue-700/60 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-300 hover:bg-blue-100/50 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          )}

          <p className="mt-3 text-center text-[10px] text-slate-400 font-medium">
            © 2026 Zeno.com. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
};
