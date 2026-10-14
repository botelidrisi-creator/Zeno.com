import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  Calendar, 
  Share2, 
  Send, 
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Post, SiteSettings } from '../types';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
  settings: SiteSettings;
  isAdmin?: boolean;
  isAdminLoggedIn?: boolean;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (id: string) => Promise<void> | void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onBack,
  settings,
  isAdmin,
  isAdminLoggedIn,
  onEditPost,
  onDeletePost,
}) => {
  const isUserAdmin = Boolean(isAdmin ?? isAdminLoggedIn);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPage, setCopiedPage] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [post]);

  if (post.status === 'draft' && !isUserAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">This app is not published yet</h3>
        <p className="text-xs text-slate-500">Only authorized administrators can preview draft apps.</p>
        <button
          onClick={onBack}
          className="btn-3d-blue px-4 py-2 rounded-xl text-white font-bold text-xs"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  const handleCopyCode = () => {
    if (!post.appCode) return;
    navigator.clipboard.writeText(post.appCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedPage(true);
    setTimeout(() => setCopiedPage(false), 2000);
  };

  const handlePhotoClick = () => {
    if (post.appLink) {
      window.open(post.appLink, '_blank', 'noopener,noreferrer');
    }
  };

  const shareText = encodeURIComponent(`${post.title} - on Zeno.com`);
  const shareUrl = encodeURIComponent(window.location.href);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 animate-in fade-in duration-150">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-3d-white px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border border-slate-300 dark:border-blue-900/50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center gap-2">
          {isUserAdmin && (
            <>
              <button
                onClick={() => onEditPost?.(post)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              {confirmingDelete ? (
                <div className="flex items-center gap-1 bg-black/80 dark:bg-slate-900/90 p-1 rounded-xl border border-red-500/50 shadow-md animate-in fade-in">
                  <button
                    onClick={async () => {
                      setIsDeleting(true);
                      setDeleteError(null);
                      try {
                        if (onDeletePost) {
                          await onDeletePost(post.id);
                        }
                        setConfirmingDelete(false);
                        onBack();
                      } catch (err: any) {
                        const code = err?.code || err?.name || '';
                        const msg = err?.message || String(err);
                        console.error('Delete failed in PostDetail:', { code, message: msg, err });
                        setDeleteError(code ? `[${code}] ${msg}` : msg);
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    disabled={isDeleting}
                    className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>{isDeleting ? 'Deleting...' : 'Confirm'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setConfirmingDelete(false);
                      setDeleteError(null);
                    }}
                    disabled={isDeleting}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={handleCopyShare}
            title="Copy post link"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors active:scale-95 border border-slate-200 dark:border-blue-900/40"
          >
            {copiedPage ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Delete Error Banner in PostDetail */}
      {deleteError && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/50 text-red-700 dark:text-red-300 text-xs flex items-start justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Delete Failed</p>
              <p className="font-mono text-[11px] mt-0.5 break-all">{deleteError}</p>
            </div>
          </div>
          <button
            onClick={() => setDeleteError(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Post Heading info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold text-blue-500 dark:text-blue-400">
              by Zeno.com
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>{post.date}</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
          {post.title}
        </h1>
      </div>

      {/* 1. Featured Picture */}
      <div className="space-y-1.5">
        <div 
          onClick={handlePhotoClick}
          title="Tap photo to open app link directly"
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-lg"
        >
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full aspect-[16/9] object-cover group-hover:scale-101 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-xs font-bold flex items-center gap-1.5">
            <span>Open Link</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          </div>
        </div>
      </div>

      {/* 2. Code Box with Copy Button (Shows as user scrolls slightly down) */}
      {post.appCode && (
        <div className="card-glow rounded-2xl p-4 sm:p-5 border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900/40 to-slate-900/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                #
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Referral / Redeem Code
                </h2>
                <p className="text-[11px] text-slate-400">
                  Copy and enter during sign-up
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 mt-3">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={post.appCode}
                className="w-full h-12 px-4 bg-white dark:bg-[#111827] border-2 border-slate-300 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-base sm:text-lg tracking-wider focus:outline-none select-all"
              />
            </div>

            <button
              onClick={handleCopyCode}
              className="btn-3d-amber h-12 px-6 rounded-xl text-slate-950 font-black text-sm flex items-center justify-center gap-2 active:scale-98 transition-all shrink-0 cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-950" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY CODE</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. Below it, "Download App" section with a big button that opens app link */}
      <div className="card-glow rounded-2xl p-5 sm:p-6 border border-blue-500/30 text-center space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Download App
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Tap the button below to open the official app link directly.
          </p>
        </div>

        <a
          href={post.appLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-3d-blue w-full py-4 rounded-xl text-white font-black text-center flex items-center justify-center gap-2.5 text-base sm:text-lg tracking-wide shadow-xl cursor-pointer"
        >
          <Download className="w-5 h-5 stroke-[2.5]" />
          <span>DOWNLOAD APP NOW</span>
        </a>
      </div>

      {/* Post Description Text */}
      {post.snippet && (
        <div className="card-glow rounded-2xl p-5 border border-slate-200 dark:border-blue-900/30 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            About this App
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {post.snippet}
          </p>
        </div>
      )}

      {/* Share Buttons: WhatsApp and Telegram */}
      <div className="card-glow rounded-2xl p-4 border border-slate-200 dark:border-blue-900/30 flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-bold text-slate-400">
          Share this post:
        </span>
        <div className="flex items-center gap-2">
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span>WhatsApp</span>
          </a>

          <a
            href={`https://t.me/share/url?url=${shareUrl}&text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </a>
        </div>
      </div>

    </div>
  );
};
