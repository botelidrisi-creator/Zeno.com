import React, { useState, useRef } from 'react';
import { 
  X, 
  Lock, 
  Settings, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Check, 
  Youtube, 
  Instagram, 
  Send, 
  Upload, 
  Download,
  LogOut,
  ShieldCheck,
  FileJson,
  FileText,
  Globe,
  AlertCircle,
  RefreshCw,
  Mail,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { Post, SiteSettings } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { testFirebaseConnection } from '../utils/database';
import { PRIMARY_ADMIN_EMAIL, firebaseConfig } from '../utils/firebase';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onAddPost: (newPost: Post, actionType?: 'draft' | 'published') => Promise<{ success: boolean; message: string } | void> | void;
  onDeletePost: (id: string) => Promise<void> | void;
  onEditPost: (post: Post) => void;
  onPublishDraft?: (post: Post) => Promise<void> | void;
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => void;
  isAdmin?: boolean;
  isAdminLoggedIn?: boolean;
  adminEmail?: string | null;
  onAdminLoginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onAdminLoginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  onAdminRegisterWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onAdminLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  posts,
  onAddPost,
  onDeletePost,
  onEditPost,
  onPublishDraft,
  settings,
  onSaveSettings,
  isAdmin,
  isAdminLoggedIn,
  adminEmail,
  onAdminLoginWithEmail,
  onAdminLoginWithGoogle,
  onAdminRegisterWithEmail,
  onAdminLogout,
}) => {
  const isUserAdmin = Boolean(isAdmin ?? isAdminLoggedIn);
  const [activeTab, setActiveTab] = useState<'add' | 'settings' | 'manage'>('add');

  // Firebase Admin Login form state
  const [emailInput, setEmailInput] = useState(PRIMARY_ADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  // Add post state
  const [title, setTitle] = useState('');
  const [appLink, setAppLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [appCode, setAppCode] = useState('');
  const [snippet, setSnippet] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeletingPostId, setIsDeletingPostId] = useState<string | null>(null);
  const [panelDeleteError, setPanelDeleteError] = useState<{ id: string; error: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // Settings state
  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || '');
  const [telegramUrl, setTelegramUrl] = useState(settings.telegramUrl || '');
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [testingFirebase, setTestingFirebase] = useState(false);
  const [firebaseTestResult, setFirebaseTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  // Handle Firebase Email/Password Login
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthNotice('');

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Please enter both admin email and password.');
      return;
    }

    setIsAuthenticating(true);
    try {
      if (isRegisterMode) {
        const res = await onAdminRegisterWithEmail(emailInput.trim(), passwordInput.trim());
        if (!res.success) {
          setAuthError(res.error || 'Failed to create admin credentials in Firebase.');
        } else {
          setAuthNotice('Admin account created and authenticated successfully!');
          setPasswordInput('');
        }
      } else {
        const res = await onAdminLoginWithEmail(emailInput.trim(), passwordInput.trim());
        if (!res.success) {
          setAuthError(res.error || 'Incorrect email or password.');
        } else {
          setPasswordInput('');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Firebase Google Sign-In
  const handleGoogleAuthSubmit = async () => {
    setAuthError('');
    setAuthNotice('');
    setIsAuthenticating(true);
    try {
      const res = await onAdminLoginWithGoogle();
      if (!res.success) {
        setAuthError(res.error || 'Google Authentication failed.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google Authentication failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 800, 0.72);
      setImageUrl(compressed);
      setImagePreview(compressed);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (actionType: 'draft' | 'published') => {
    setErrorMessage('');
    if (!title.trim() || !appLink.trim() || (!imageUrl && !imagePreview)) {
      setErrorMessage('Please fill in Title, App Link, and upload/provide a photo.');
      return;
    }

    setIsSubmitting(true);
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
      status: actionType,
    };

    try {
      const result = await onAddPost(newPost, actionType);
      const isDraft = actionType === 'draft';
      const defaultSuccessMsg = isDraft
        ? 'Draft saved to Firebase Firestore! It remains private until you publish.'
        : 'App published to Firebase Firestore! Visible to all public visitors.';

      setSuccessMessage(result && typeof result === 'object' && result.message ? result.message : defaultSuccessMsg);

      // Reset form
      setTitle('');
      setAppLink('');
      setImageUrl('');
      setImagePreview('');
      setAppCode('');
      setSnippet('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => setSuccessMessage(''), 4500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save post to Firebase Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestFirebase = async () => {
    setTestingFirebase(true);
    setFirebaseTestResult(null);
    try {
      const result = await testFirebaseConnection();
      setFirebaseTestResult(result);
    } catch (err: any) {
      setFirebaseTestResult({
        success: false,
        message: err.message || 'Error testing Firebase connection.',
      });
    } finally {
      setTestingFirebase(false);
    }
  };

  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      youtubeUrl: youtubeUrl.trim(),
      instagramUrl: instagramUrl.trim(),
      telegramUrl: telegramUrl.trim(),
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
    });
    setSuccessMessage('Settings updated successfully in Cloud Firestore!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleExportBackup = () => {
    try {
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        site: 'Zeno.com',
        posts,
        settings,
      };
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zeno-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccessMessage('Database backup JSON exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('Failed to export backup');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.posts)) {
          for (const post of parsed.posts) {
            await onAddPost(post, post.status || 'published');
          }
        }
        if (parsed.settings && typeof parsed.settings === 'object') {
          onSaveSettings({ ...settings, ...parsed.settings });
        }
        setSuccessMessage('Backup restored successfully into Cloud Firestore!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } catch {
        setErrorMessage('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const publishedCount = posts.filter(p => p.status !== 'draft').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0E1626] rounded-3xl shadow-2xl border border-slate-200 dark:border-blue-900/40 z-10 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-blue-900/30 flex items-center justify-between bg-slate-50 dark:bg-[#111C2E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Zeno.com Admin Panel</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Firebase Protected
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isUserAdmin 
                  ? `Authorized as ${adminEmail || PRIMARY_ADMIN_EMAIL}`
                  : 'Secure Firebase Authentication & Cloud Firestore'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUserAdmin && (
              <button
                onClick={onAdminLogout}
                title="Log out from Admin"
                className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Section: Protected by Firebase Auth */}
        {!isUserAdmin ? (
          /* REAL FIREBASE ADMIN LOGIN SCREEN */
          <div className="p-6 sm:p-8 overflow-y-auto space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto border border-blue-500/20">
              <KeyRound className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Admin Authentication
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Sign in with your authorized administrator account to manage apps, save drafts, and publish reviews.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold border border-blue-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorized Admin: {PRIMARY_ADMIN_EMAIL}</span>
              </div>
            </div>

            {/* Error & Notice messages */}
            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{authNotice}</span>
              </div>
            )}

            {/* Google 1-Click Login Option */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleGoogleAuthSubmit}
                disabled={isAuthenticating}
                className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-blue-900/60 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1a2333] text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isAuthenticating ? 'Authenticating with Google...' : 'Sign In with Authorized Google Account'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="h-px bg-slate-200 dark:bg-blue-900/40 flex-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">or Email & Password</span>
              <div className="h-px bg-slate-200 dark:bg-blue-900/40 flex-1" />
            </div>

            {/* Email and Password Form */}
            <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="animeanime9683@gmail.com"
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={isRegisterMode ? 'Create new password (min 6 chars)' : 'Enter admin password'}
                    className="w-full h-11 pl-9 pr-10 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="btn-3d-blue w-full py-3 rounded-xl text-white font-extrabold text-xs tracking-wider cursor-pointer disabled:opacity-50 mt-1"
              >
                {isAuthenticating 
                  ? 'VERIFYING CREDENTIALS...' 
                  : isRegisterMode 
                  ? 'CREATE & LOGIN ADMIN ACCOUNT' 
                  : 'LOGIN TO ADMIN DASHBOARD'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setAuthError('');
                  }}
                  className="text-[11px] text-blue-500 hover:underline font-semibold"
                >
                  {isRegisterMode 
                    ? 'Already have an admin password? Sign in' 
                    : 'First time? Create password for this admin account'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD VIEW */
          <>
            {/* Tabs Bar */}
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
                <span>Add App Form</span>
              </button>

              <button
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all ${
                  activeTab === 'manage'
                    ? 'bg-white dark:bg-[#0E1626] text-blue-600 dark:text-blue-400 border-t-2 border-blue-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <span>Manage Apps ({posts.length})</span>
                {draftCount > 0 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-500 font-bold px-1.5 py-0.2 rounded-full">
                    {draftCount} drafts
                  </span>
                )}
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
                <span>Firebase & Settings</span>
              </button>

              <div className="ml-auto flex items-center pr-1">
                <button
                  onClick={onAdminLogout}
                  title="Logout"
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 py-1 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Notifications */}
            {successMessage && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Tab content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* TAB 1: ADD NEW APP (WITH "SAVE AS DRAFT" AND "PUBLISH APP" BUTTONS) */}
              {activeTab === 'add' && (
                <div className="space-y-3.5 text-xs">
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
                      App Thumbnail Image *
                    </label>
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo from Phone</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <span className="text-[11px] text-slate-400">or paste image link below</span>
                    </div>

                    <input
                      type="url"
                      value={imageUrl.startsWith('data:') ? '' : imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/... or paste image URL"
                      className="w-full h-9 px-3 mt-2 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white text-[11px] focus:outline-none focus:border-blue-500"
                    />

                    {imagePreview && (
                      <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-blue-500/30">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Promotional / AdFly / App Download Link *
                    </label>
                    <input
                      type="url"
                      required
                      value={appLink}
                      onChange={(e) => setAppLink(e.target.value)}
                      placeholder="https://adfly... or https://play.google.com/..."
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Referral / Redeem Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={appCode}
                        onChange={(e) => setAppCode(e.target.value)}
                        placeholder="e.g. ZENO2025"
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Description / Review Guide *
                    </label>
                    <textarea
                      rows={3}
                      value={snippet}
                      onChange={(e) => setSnippet(e.target.value)}
                      placeholder="Write brief review, earning proof, signup instructions, or redeem guidelines..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* ACTION BUTTONS: 1. SAVE AS DRAFT, 2. PUBLISH APP */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleCreatePost('draft')}
                      className="w-full py-3 px-4 rounded-xl border-2 border-amber-500/60 hover:border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{isSubmitting ? 'SAVING DRAFT...' : 'SAVE AS DRAFT'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleCreatePost('published')}
                      className="btn-3d-blue w-full py-3 px-4 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{isSubmitting ? 'PUBLISHING...' : 'PUBLISH APP'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    Drafts remain confidential in Firebase Firestore. Published apps become live for all public visitors immediately.
                  </p>
                </div>
              )}

              {/* TAB 2: MANAGE APPS (EDIT APP & DELETE APP BUTTONS) */}
              {activeTab === 'manage' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200 dark:border-blue-900/40">
                    <span>App Database ({posts.length})</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">{publishedCount} Published</span>
                      <span>•</span>
                      <span className="text-amber-500">{draftCount} Drafts</span>
                    </div>
                  </div>

                  {posts.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <p className="font-semibold text-sm">No apps saved yet.</p>
                      <p className="text-xs mt-1">Use the "Add App Form" to add your first app or draft.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                      {posts.map((post) => (
                        <div key={post.id} className="space-y-1">
                          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#111C2E] border border-slate-200 dark:border-blue-900/40 flex items-center gap-3 transition-colors hover:border-blue-500/50">
                          <img
                            src={post.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-200 dark:bg-slate-800"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {post.title}
                              </h4>
                              {post.status === 'draft' ? (
                                <span className="text-[9px] bg-amber-500/20 text-amber-500 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold shrink-0">
                                  DRAFT
                                </span>
                              ) : (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold shrink-0">
                                  LIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {post.appLink}
                            </p>
                          </div>

                          {/* ACTION BUTTONS: 3. EDIT APP, 4. DELETE APP */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {post.status === 'draft' && onPublishDraft && (
                              <button
                                onClick={() => {
                                  onPublishDraft(post);
                                }}
                                title="Publish Draft Now"
                                className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" />
                                <span>Publish</span>
                              </button>
                            )}

                            <button
                              onClick={() => onEditPost(post)}
                              title="Edit App"
                              className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {deletingPostId === post.id ? (
                              <div className="flex items-center gap-1 bg-red-950/60 p-1 rounded-lg border border-red-500/40 animate-in fade-in">
                                <button
                                  onClick={async () => {
                                    setIsDeletingPostId(post.id);
                                    setPanelDeleteError(null);
                                    try {
                                      await onDeletePost(post.id);
                                      setDeletingPostId(null);
                                    } catch (err: any) {
                                      const code = err?.code || err?.name || '';
                                      const msg = err?.message || String(err);
                                      console.error(`Delete failed in AdminPanel:`, { code, message: msg, err });
                                      setPanelDeleteError({
                                        id: post.id,
                                        error: code ? `[${code}] ${msg}` : msg,
                                      });
                                    } finally {
                                      setIsDeletingPostId(null);
                                    }
                                  }}
                                  disabled={isDeletingPostId === post.id}
                                  title="Confirm Delete"
                                  className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer disabled:opacity-50"
                                >
                                  {isDeletingPostId === post.id ? 'Deleting...' : 'Confirm'}
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingPostId(null);
                                    setPanelDeleteError(null);
                                  }}
                                  disabled={isDeletingPostId === post.id}
                                  title="Cancel"
                                  className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setDeletingPostId(post.id);
                                  setPanelDeleteError(null);
                                }}
                                title="Delete App"
                                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline delete error message for this post in AdminPanel */}
                        {panelDeleteError?.id === post.id && (
                          <div className="bg-red-500/15 border border-red-500/40 text-red-400 text-[11px] p-2 rounded-xl flex items-center justify-between gap-2 mt-1">
                            <span className="font-mono break-all">{panelDeleteError.error}</span>
                            <button
                              onClick={() => setPanelDeleteError(null)}
                              className="text-red-300 hover:text-white font-bold text-xs px-1"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FIREBASE & SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-4 text-xs">
                  {/* Firebase Firestore Connection Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111C2E] border border-blue-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                          🔥
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            Firebase Firestore Connection
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            Shared cloud database syncing across all mobile & desktop visitors
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Active
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#0A0F1D] border border-slate-200 dark:border-blue-900/40 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Project ID:</span>
                        <span className="font-bold">{firebaseConfig.projectId || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Database ID:</span>
                        <span className="font-bold truncate max-w-[220px]">{(firebaseConfig as any).firestoreDatabaseId || '(default)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Auth Domain:</span>
                        <span className="font-bold truncate max-w-[220px]">{firebaseConfig.authDomain || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Security:</span>
                        <span className="text-emerald-500 font-bold">firestore.rules deployed</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestFirebase}
                        disabled={testingFirebase}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${testingFirebase ? 'animate-spin' : ''}`} />
                        <span>{testingFirebase ? 'Testing Connection...' : 'Test Cloud Firestore'}</span>
                      </button>
                    </div>

                    {firebaseTestResult && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                          firebaseTestResult.success
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                            : 'bg-red-500/10 border border-red-500/30 text-red-500'
                        }`}
                      >
                        {firebaseTestResult.success ? (
                          <Check className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{firebaseTestResult.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Social Links Form */}
                  <form onSubmit={handleSaveAllSettings} className="space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white pt-1">
                      Social & Channel Links
                    </h4>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-500" />
                        <span>YouTube Channel URL</span>
                      </label>
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://youtube.com/@zenocom"
                        className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-pink-500" />
                        <span>Instagram Profile URL</span>
                      </label>
                      <input
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/zenocom"
                        className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-sky-500" />
                        <span>Telegram Channel URL</span>
                      </label>
                      <input
                        type="url"
                        value={telegramUrl}
                        onChange={(e) => setTelegramUrl(e.target.value)}
                        placeholder="https://t.me/zenocom"
                        className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-3d-blue w-full py-2.5 rounded-xl text-white font-extrabold text-xs tracking-wider cursor-pointer"
                    >
                      SAVE SETTINGS TO CLOUD FIRESTORE
                    </button>
                  </form>

                  {/* Backup & Restore Card */}
                  <div className="pt-2 border-t border-slate-200 dark:border-blue-900/40">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                      <FileJson className="w-3.5 h-3.5 text-blue-500" />
                      <span>Data Backup & Safe Migration</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Export a full JSON snapshot of your published and draft apps before migrating or redeploying.
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleExportBackup}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Backup JSON</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => backupFileInputRef.current?.click()}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Restore from JSON</span>
                      </button>
                      <input
                        ref={backupFileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
