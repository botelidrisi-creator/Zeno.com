import React from 'react';
import { TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { Post } from '../types';

interface PopularPostsProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

export const PopularPosts: React.FC<PopularPostsProps> = ({
  posts,
  onSelectPost,
}) => {
  if (!posts || posts.length === 0) return null;

  // Take top posts from user's posts
  const popularList = [...posts].slice(0, 4);

  return (
    <div className="card-glow rounded-2xl p-5 my-6 border border-slate-200 dark:border-blue-900/30">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-blue-900/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Popular Posts
          </h2>
        </div>
        <span className="text-[11px] font-bold text-blue-400">
          Zeno.com
        </span>
      </div>

      <div className="space-y-3">
        {popularList.map((post, idx) => (
          <div
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="group flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-blue-500/5 transition-colors"
          >
            <div className="relative shrink-0">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-blue-900/40"
              />
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                {idx + 1}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{post.date}</span>
                <span>•</span>
                <span className="font-medium text-slate-500">by Zeno.com</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
