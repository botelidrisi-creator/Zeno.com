import React, { useState } from 'react';
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
  LogOut,
  Edit2,
  Check
} from 'lucide-react';
import { SiteSettings } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome: () => void;
  onOpenStaticPage: (page: 'about' | 'contact' | 'privacy' | 'disclaimer') => void;
  onOpenAdmin: () => void;
  settings: SiteSettings;
  isAdmin?: boolean;
  isAdminLoggedIn?: boolean;
  onAdminLogout: () => void;
  onSaveSettings?: (settings: SiteSettings) => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onGoHome,
  onOpenStaticPage,
  onOpenAdmin,
  settings,
  isAdmin,
  isAdminLoggedIn,
  onAdminLogout,
  onSaveSettings,
}) => {
  const isAdminActive = Boolean(isAdmin ?? isAdminLoggedIn);
  // State for setting platform link popup (unconditional hook call at top)
  const [settingPlatform, setSettingPlatform] = useState<'youtube' | 'instagram' | 'telegram' | null>(null);
  const [linkInput, setLinkInput] = useState('');

  if (!isOpen) return null;

  const handleOpenSetLink = (platform: 'youtube' | 'instagram' | 'telegram', e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setSettingPlatform(platform);
    if (platform === 'youtube') setLinkInput(settings.youtubeUrl || '');
    if (platform === 'instagram') setLinkInput(settings.instagramUrl || '');
    if (platform === 'telegram') setLinkInput(settings.telegramUrl || '');
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingPlatform) return;

    const trimmed = linkInput.trim();
    const updatedSettings: SiteSettings = {
      ...settings,
      ...(settingPlatform === 'youtube' && { youtubeUrl: trimmed }),
      ...(settingPlatform === 'instagram' && { instagramUrl: trimmed }),
      ...(settingPlatform === 'telegram' && { telegramUrl: trimmed }),
    };

    onSaveSettings?.(updatedSettings);
    setSettingPlatform(null);
  };

  const showYouTube = Boolean(settings.youtubeUrl) || isAdminActive;
  const showInstagram = Boolean(settings.instagramUrl) || isAdminActive;
  const showTelegram = Boolean(settings.telegramUrl) || isAdminActive;
  const hasVisibleSocial = showYouTube || showInstagram || showTelegram;

  const topRowHasBoth = showYouTube && showInstagram;

  return (
    <>
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
            <div className="flex items-center gap-2.5">
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

          {/* Social Links Section */}
          {hasVisibleSocial && (
            <div className="p-4 mx-4 my-2 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-[#111827] dark:to-[#0F172A] border border-slate-200/80 dark:border-blue-900/30 shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                Social Channels
              </p>
              
              <div className={topRowHasBoth ? "grid grid-cols-2 gap-2.5" : "flex flex-col gap-2.5"}>
                
                {/* YouTube Button */}
                {settings.youtubeUrl ? (
                  <div className="relative group">
                    <a
                      href={settings.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 active:translate-y-0.5 transition-all"
                    >
                      <Youtube className="w-4 h-4 fill-white" />
                      <span>YouTube</span>
                    </a>
                    {isAdminActive && (
                      <button
                        onClick={(e) => handleOpenSetLink('youtube', e)}
                        title="Edit YouTube link"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center shadow-md active:scale-90"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  isAdminActive && (
                    <button
                      onClick={(e) => handleOpenSetLink('youtube', e)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold border border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 transition-all cursor-pointer"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-500" />
                      <span>+ Set Link</span>
                    </button>
                  )
                )}

                {/* Instagram Button */}
                {settings.instagramUrl ? (
                  <div className="relative group">
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-pink-500/20 active:translate-y-0.5 transition-all"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Instagram</span>
                    </a>
                    {isAdminActive && (
                      <button
                        onClick={(e) => handleOpenSetLink('instagram', e)}
                        title="Edit Instagram link"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center shadow-md active:scale-90"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  isAdminActive && (
                    <button
                      onClick={(e) => handleOpenSetLink('instagram', e)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold border border-dashed border-slate-300 dark:border-slate-700 hover:border-pink-500 transition-all cursor-pointer"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-500" />
                      <span>+ Set Link</span>
                    </button>
                  )
                )}

              </div>

              {/* Telegram Channel Button */}
              {settings.telegramUrl ? (
                <div className="relative group mt-2.5">
                  <a
                    href={settings.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:translate-y-0.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram Channel</span>
                  </a>
                  {isAdminActive && (
                    <button
                      onClick={(e) => handleOpenSetLink('telegram', e)}
                      title="Edit Telegram link"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center shadow-md active:scale-90"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ) : (
                isAdminActive && (
                  <button
                    onClick={(e) => handleOpenSetLink('telegram', e)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold border border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span>+ Set Telegram Link</span>
                  </button>
                )
              )}

            </div>
          )}

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
            {isAdminActive ? (
              <div className="space-y-2 mb-3">
                <button
                  onClick={() => {
                    onOpenAdmin();
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    onAdminLogout();
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Admin Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAdmin();
                  onClose();
                }}
                className="w-full py-2 px-3 mb-2 rounded-xl text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Login</span>
              </button>
            )}

            <p className="text-center text-[10px] text-slate-400 font-medium">
              © 2026 Zeno.com. All rights reserved.
            </p>
          </div>

        </div>
      </div>

      {/* Small Popup Modal to Set/Paste Link (only when admin taps + Set Link) */}
      {settingPlatform && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setSettingPlatform(null)}
          />

          <div className="relative w-full max-w-sm bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-blue-900/50 rounded-2xl p-5 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-blue-900/30">
              <div className="flex items-center gap-2">
                {settingPlatform === 'youtube' && <Youtube className="w-5 h-5 text-red-500 fill-current" />}
                {settingPlatform === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                {settingPlatform === 'telegram' && <Send className="w-5 h-5 text-sky-400" />}
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
                  Set {settingPlatform === 'youtube' ? 'YouTube' : settingPlatform === 'instagram' ? 'Instagram' : 'Telegram'} Link
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSettingPlatform(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Paste your {settingPlatform === 'youtube' ? 'YouTube' : settingPlatform === 'instagram' ? 'Instagram' : 'Telegram'} URL:
                </label>
                <input
                  type="url"
                  autoFocus
                  required
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder={
                    settingPlatform === 'youtube'
                      ? 'https://youtube.com/@yourchannel'
                      : settingPlatform === 'instagram'
                      ? 'https://instagram.com/yourprofile'
                      : 'https://t.me/yourchannel'
                  }
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSettingPlatform(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-3d-blue py-2.5 rounded-xl text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
