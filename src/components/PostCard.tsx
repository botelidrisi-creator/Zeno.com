import React, { useState } from 'react';
import { Calendar, Check, Copy, ArrowRight, Edit3, Trash2 } from 'lucide-react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onSelectPost: (post: Post) => void;
  isAdminLoggedIn?: boolean;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onSelectPost,
  isAdminLoggedIn,
  onEditPost,
  onDeletePost,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.appCode) {
      navigator.clipboard.writeText(post.appCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure?')) {
      onDeletePost?.(post.id);
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
        {isAdminLoggedIn && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              onClick={handleEdit}
              title="Edit Post"
              className="px-2.5 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-md backdrop-blur-xs active:scale-95 transition-all"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              title="Delete Post"
              className="px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-md backdrop-blur-xs active:scale-95 transition-all"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
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
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between gap-2">
          
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
    </article>
  );
};
