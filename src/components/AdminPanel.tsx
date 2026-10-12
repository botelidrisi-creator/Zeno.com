import React, { useState, useRef } from 'react';
import { 
  X, 
  Lock, 
  Key, 
  Settings, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Check, 
  Youtube, 
  Instagram, 
  Send, 
  Upload, 
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Post, SiteSettings } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onAddPost: (newPost: Post) => void;
  onDeletePost: (id: string) => void;
  onEditPost: (post: Post) => void;
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => void;
  isAdminLoggedIn: boolean;
  onAdminLogin: (password: string) => boolean;
  onAdminLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  posts,
  onAddPost,
  onDeletePost,
  onEditPost,
  settings,
  onSaveSettings,
  isAdminLoggedIn,
  onAdminLogin,
  onAdminLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'settings' | 'manage'>('add');

  // Login form state
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Add post state
  const [title, setTitle] = useState('');
  const [appLink, setAppLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [appCode, setAppCode] = useState('');
  const [snippet, setSnippet] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings state
  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || '');
  const [telegramUrl, setTelegramUrl] = useState(settings.telegramUrl || '');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAdminLogin(passwordInput);
    if (success) {
      setLoginError('');
      setPasswordInput('');
    } else {
      setLoginError('Incorrect password. Default is "admin".');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageUrl(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !appLink.trim() || (!imageUrl && !imagePreview)) {
      alert('Please fill in Title, App Link, and upload/provide a photo.');
      return;
    }

    const today = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date());

    const newPost: Post = {
      id: `zeno-post-${Date.now()}`,
      title: title.trim(),
      author: 'by Zeno.com',
      date: today,
      imageUrl: imageUrl.trim() || imagePreview,
      appLink: appLink.trim(),
      appCode: appCode.trim() || undefined,
      snippet: snippet.trim() || 'Official app review and download guide on Zeno.com.',
      views: 1,
    };

    onAddPost(newPost);
    setSuccessMessage('App published to All feed and stored in database!');
    setTimeout(() => setSuccessMessage(''), 3000);

    // Reset fields
    setTitle('');
    setAppLink('');
    setImageUrl('');
    setImagePreview('');
    setAppCode('');
    setSnippet('');
  };

  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      youtubeUrl: youtubeUrl.trim(),
      instagramUrl: instagramUrl.trim(),
      telegramUrl: telegramUrl.trim(),
    });
    setSuccessMessage('Social links updated everywhere on Zeno.com!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#0E1626] rounded-3xl shadow-2xl border border-slate-200 dark:border-blue-900/40 z-10 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-blue-900/30 flex items-center justify-between bg-slate-50 dark:bg-[#111C2E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 text-sm">
              Z
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Zeno.com Admin Panel
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAdminLoggedIn ? 'Logged in as Admin' : 'Authentication required'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Not logged in: Show Password Login Prompt */}
        {!isAdminLoggedIn ? (
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto border border-blue-500/30">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Admin Access
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Enter your admin password to add new apps, edit posts, and configure links.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="max-w-xs mx-auto space-y-3 pt-2">
              <input
                type="password"
                required
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password (default: admin)"
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white text-center font-bold tracking-wider focus:outline-none focus:border-blue-500 text-sm"
              />

              {loginError && (
                <p className="text-xs font-bold text-red-500">{loginError}</p>
              )}

              <button
                type="submit"
                className="btn-3d-blue w-full py-3 rounded-xl text-white font-extrabold text-xs tracking-wider"
              >
                UNLOCK ADMIN PANEL
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Admin View */
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-blue-900/40 bg-slate-100/60 dark:bg-[#0B1120] px-3 pt-2 gap-2">
              <button
                onClick={() => setActiveTab('add')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
                  activeTab === 'add'
                    ? 'bg-white dark:bg-[#0E1626] text-blue-600 dark:text-blue-400 border-t-2 border-blue-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add New App</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-white dark:bg-[#0E1626] text-blue-600 dark:text-blue-400 border-t-2 border-blue-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Links & Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
                  activeTab === 'manage'
                    ? 'bg-white dark:bg-[#0E1626] text-blue-600 dark:text-blue-400 border-t-2 border-blue-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <span>Posts ({posts.length})</span>
              </button>

              <div className="ml-auto flex items-center pr-1">
                <button
                  onClick={onAdminLogout}
                  title="Logout"
                  className="text-[11px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 py-1 px-2 rounded-lg"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Notification */}
            {successMessage && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Tab content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* TAB: ADD NEW APP */}
              {activeTab === 'add' && (
                <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      App Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Free UPI Earning App - Instant ₹200 Daily"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      App Link * (Target Download URL)
                    </label>
                    <input
                      type="url"
                      required
                      value={appLink}
                      onChange={(e) => setAppLink(e.target.value)}
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Photo Upload *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-3d-white px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-500" />
                        <span>Upload from Device</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="Or paste an image URL"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {imagePreview && (
                      <div className="mt-2 relative aspect-[16/9] max-h-44 w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Referral / Redeem Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={appCode}
                      onChange={(e) => setAppCode(e.target.value)}
                      placeholder="e.g. ZENO500 or GIFT-CODE"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Short Description
                    </label>
                    <textarea
                      rows={2}
                      value={snippet}
                      onChange={(e) => setSnippet(e.target.value)}
                      placeholder="Brief notes about the app and benefits..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="btn-3d-blue w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 tracking-wide shadow-md cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>SAVE APP (APPEARS IN ALL FEED)</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveAllSettings} className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
                    <p className="font-bold flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-blue-400" />
                      Social Links Setup
                    </p>
                    <p className="text-[11px] mt-1 text-slate-400">
                      Set your YouTube, Instagram, and Telegram links once. They update everywhere across the header drawer, post pages, and footer.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span>YouTube Channel Link</span>
                    </label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@yourchannel"
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span>Instagram Profile Link</span>
                    </label>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-sky-400" />
                      <span>Telegram Channel Link</span>
                    </label>
                    <input
                      type="url"
                      value={telegramUrl}
                      onChange={(e) => setTelegramUrl(e.target.value)}
                      placeholder="https://t.me/yourchannel"
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-3d-blue w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>SAVE LINKS GLOBALLY</span>
                  </button>
                </form>
              )}

              {/* TAB: MANAGE POSTS */}
              {activeTab === 'manage' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Total {posts.length} posts published on Zeno.com.
                  </p>

                  {posts.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No posts published yet. Use "Add New App" above to add your first post!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {posts.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 rounded-xl border border-slate-200 dark:border-blue-900/30 bg-slate-50 dark:bg-[#111827] flex items-center justify-between gap-3 text-xs"
                        >
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white truncate">
                              {p.title}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              {p.appCode ? `Code: ${p.appCode} • ` : ''}{p.date}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => onEditPost(p)}
                              title="Edit post"
                              className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this post?')) {
                                  onDeletePost(p.id);
                                }
                              }}
                              title="Delete post"
                              className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 text-red-600 dark:text-red-300 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
