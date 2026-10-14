import React, { useState } from 'react';
import { Calendar, Check, Copy, ArrowRight, Edit3, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onSelectPost: (post: Post) => void;
  isAdmin?: boolean;
  isAdminLoggedIn?: boolean;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (id: string) => Promise<void> | void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onSelectPost,
  isAdmin,
  isAdminLoggedIn,
  onEditPost,
  onDeletePost,
}) => {
  const isUserAdmin = Boolean(isAdmin ?? isAdminLoggedIn);
  const [copied, setCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.appCode) {
      navigator.clipboard.writeText(post.appCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (onDeletePost) {
        await onDeletePost(post.id);
      }
      setConfirmingDelete(false);
    } catch (err: any) {
      const code = err?.code || err?.name || '';
      const msg = err?.message || String(err);
      console.error(`Error deleting post ${post.id}:`, { code, message: msg, err });
      setDeleteError(code ? `[${code}] ${msg}` : msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditPost?.(post);
  };

  return (
    <article className="card-glow group rounded-2xl overflow-hidden border transition-all select-none">
      
      {/* Uploaded Photo: Tapping photo opens the post directly per prompt! */}
      <div 
        onClick={() => onSelectPost(post)}
        title="Tap photo to open post"
        className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 cursor-pointer"
      >
        <img
          src={post.imageUrl}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Tap Callout Overlay */}
        <div className="absolute bottom-2.5 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/10 shadow-sm">
          <span>Tap photo to open</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Admin Controls on Card (visible only when logged in) */}
        {isUserAdmin && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {confirmingDelete ? (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex items-center gap-1 bg-black/90 p-1 rounded-xl backdrop-blur-md border border-red-500/60 shadow-xl animate-in fade-in"
              >
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  title="Confirm Delete"
                  className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmingDelete(false);
                    setDeleteError(null);
                  }}
                  disabled={isDeleting}
                  title="Cancel"
                  className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  title="Edit Post"
                  className="px-2.5 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-md backdrop-blur-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmingDelete(true);
                  }}
                  title="Delete Post"
                  className="px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-md backdrop-blur-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Delete Error Notification Badge on Card */}
        {deleteError && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 right-3 left-3 bg-red-700/95 text-white text-[11px] font-medium p-2 rounded-xl border border-red-400 shadow-2xl flex items-start justify-between gap-1.5 z-20 animate-in fade-in"
          >
            <div className="flex items-start gap-1.5 overflow-hidden">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-200" />
              <div className="font-mono text-[10px] break-all leading-tight">
                {deleteError}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteError(null);
              }}
              className="text-white/80 hover:text-white shrink-0 font-bold px-1"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5">
        
        {/* Byline & Date */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold text-blue-500 dark:text-blue-400">
              by Zeno.com
            </span>
            {post.status === 'draft' && (
              <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                Draft (Hidden from Visitors)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>{post.date}</span>
          </div>
        </div>

        {/* Title */}
        <h2 
          onClick={() => onSelectPost(post)}
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug cursor-pointer group-hover:text-blue-500 transition-colors"
        >
          {post.title}
        </h2>

        {/* Short Text */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {post.snippet}
        </p>

        {/* Card Footer: Code chip with copy icon & Read Details button */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between gap-2 flex-wrap">
          
          {/* Code Chip with Copy Icon (if code exists) */}
          {post.appCode ? (
            <div 
              onClick={handleCopyCode}
              title="Click to copy code"
              className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 text-blue-600 dark:text-blue-400 px-2.5 py-1.5 rounded-xl cursor-pointer active:scale-95 transition-all text-xs font-mono font-bold"
            >
              <span className="text-[10px] uppercase font-sans text-slate-500">Code:</span>
              <span>{post.appCode}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-blue-400" />
              )}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 font-medium">
              Direct Link Available
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Admin Edit & Delete buttons on every post */}
            {isUserAdmin && (
              <>
                <button
                  type="button"
                  onClick={handleEdit}
                  title="Edit Post"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                {confirmingDelete ? (
                  <div className="flex items-center gap-1 bg-black/80 dark:bg-slate-900/90 p-1 rounded-xl border border-red-500/50 shadow-md animate-in fade-in">
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      title="Confirm Delete"
                      className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      <span>{isDeleting ? 'Deleting...' : 'Confirm'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmingDelete(false);
                        setDeleteError(null);
                      }}
                      disabled={isDeleting}
                      title="Cancel"
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold active:scale-95 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmingDelete(true);
                    }}
                    title="Delete Post"
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </>
            )}

            {/* Read Details button with 3D raised feel */}
            <button
              onClick={() => onSelectPost(post)}
              className="btn-3d-blue text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Read Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </article>
  );
};
