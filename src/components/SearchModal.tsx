import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, ChevronRight } from 'lucide-react';
import { Post } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onSelectPost: (post: Post) => void;
  language: 'all' | 'hi' | 'en';
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  posts,
  onSelectPost,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = searchTerm.trim()
    ? posts.filter((p) => {
        const query = searchTerm.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          p.snippet.toLowerCase().includes(query) ||
          (p.appCode && p.appCode.toLowerCase().includes(query))
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1626] rounded-2xl shadow-2xl border border-slate-200 dark:border-blue-900/40 z-10 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        
        {/* Search input header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-blue-900/30 flex items-center gap-3 bg-slate-50 dark:bg-[#111C2E]">
          <Search className="w-5 h-5 text-blue-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts or referral codes..."
            className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-200"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {searchTerm.trim() === '' ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <p>Type keywords to search your published posts on Zeno.com.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <p>No posts found for "{searchTerm}".</p>
            </div>
          ) : (
            results.map((post) => (
              <div
                key={post.id}
                onClick={() => {
                  onSelectPost(post);
                  onClose();
                }}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center gap-3 transition-colors group"
              >
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-blue-900/40"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-400">
                    {post.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {post.date} • by Zeno.com
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 shrink-0" />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
