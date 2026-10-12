import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MenuDrawer } from './components/MenuDrawer';
import { PostCard } from './components/PostCard';
import { PostDetail } from './components/PostDetail';
import { PopularPosts } from './components/PopularPosts';
import { AdminPanel } from './components/AdminPanel';
import { AddNewAppForm } from './components/AddNewAppForm';
import { EditPostModal } from './components/EditPostModal';
import { SearchModal } from './components/SearchModal';
import { StaticPageModal } from './components/StaticPageModal';
import { ScrollToTop } from './components/ScrollToTop';
import { Footer } from './components/Footer';
import { INITIAL_POSTS, INITIAL_SETTINGS } from './data/initialPosts';
import { Post, SiteSettings } from './types';
import { RotateCw, Sparkles, Inbox } from 'lucide-react';

const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Quota or incognito error ignored
  }
};

export default function App() {
  // Theme state: defaults to dark mode (navy)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = safeGetItem('zeno_dark_mode');
    if (saved !== null) return saved === 'true';
    return true; // Default to dark navy look
  });

  // Language state
  const [language, setLanguage] = useState<'all' | 'hi' | 'en'>(() => {
    return (safeGetItem('zeno_language') as 'all' | 'hi' | 'en') || 'en';
  });

  // Admin login state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return safeGetItem('zeno_admin_logged_in') === 'true';
  });

  // Settings state (starts with empty links until set by user)
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = safeGetItem('zeno_settings_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SETTINGS;
  });

  // Posts state (starts completely EMPTY!)
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = safeGetItem('zeno_posts_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_POSTS; // []
  });

  // Navigation state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Modals state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [staticPage, setStaticPage] = useState<'about' | 'contact' | 'privacy' | 'disclaimer' | null>(null);

  // Load posts and settings from database on mount (with static host support)
  useEffect(() => {
    fetch('/api/posts')
      .then((res) => {
        if (!res.ok) throw new Error('API not available');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Not JSON response (static host)');
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data);
          safeSetItem('zeno_posts_v2', JSON.stringify(data));
        }
      })
      .catch((err) => {
        // Normal and expected on GitHub Pages / static hosting: uses localStorage database
        console.log('Using local storage database:', err.message);
      });

    fetch('/api/settings')
      .then((res) => {
        if (!res.ok) throw new Error('API not available');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Not JSON response (static host)');
        }
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
          safeSetItem('zeno_settings_v2', JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.log('Using local storage settings:', err.message);
      });
  }, []);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    safeSetItem('zeno_dark_mode', String(darkMode));
  }, [darkMode]);

  // Sync language
  useEffect(() => {
    safeSetItem('zeno_language', language);
  }, [language]);

  // Sync settings
  useEffect(() => {
    safeSetItem('zeno_settings_v2', JSON.stringify(settings));
  }, [settings]);

  // Sync posts
  useEffect(() => {
    safeSetItem('zeno_posts_v2', JSON.stringify(posts));
  }, [posts]);

  // Sync admin auth
  useEffect(() => {
    safeSetItem('zeno_admin_logged_in', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  // Page title sync
  useEffect(() => {
    if (selectedPost) {
      document.title = `${selectedPost.title} - Zeno.com`;
    } else {
      document.title = 'Zeno.com - Online Earning Reviews, Gift Cards & Job Updates';
    }
  }, [selectedPost]);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedPost(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add new post
  const handleAddPost = async (newPost: Post) => {
    // Optimistic update
    const updated = [newPost, ...posts];
    setPosts(updated);

    // Save to database
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
    } catch (e) {
      console.error('Failed to sync new post with server db:', e);
    }
  };

  // Delete post
  const handleDeletePost = async (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    if (selectedPost?.id === id) {
      setSelectedPost(null);
    }

    // Delete in database
    try {
      await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete post on server db:', e);
    }
  };

  // Edit / Update post
  const handleUpdatePost = async (updatedPost: Post) => {
    const updated = posts.map((p) => (p.id === updatedPost.id ? updatedPost : p));
    setPosts(updated);
    if (selectedPost?.id === updatedPost.id) {
      setSelectedPost(updatedPost);
    }

    // Update in database
    try {
      await fetch(`/api/posts/${updatedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPost),
      });
    } catch (e) {
      console.error('Failed to update post on server db:', e);
    }
  };

  // Save settings
  const handleSaveSettings = async (newSettings: SiteSettings) => {
    setSettings(newSettings);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (e) {
      console.error('Failed to save settings on server db:', e);
    }
  };

  // Admin login check
  const handleAdminLogin = (password: string) => {
    const correctPassword = settings.adminPassword || 'admin';
    if (password === correctPassword) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
  };

  const displayedPosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-600 selection:text-white">
      
      {/* HEADER */}
      <Header
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onGoHome={handleBackToHome}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* DRAWER MENU */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onGoHome={handleBackToHome}
        onOpenStaticPage={(page) => setStaticPage(page)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        settings={settings}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
        onSaveSettings={handleSaveSettings}
      />

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={posts}
        onSelectPost={handleSelectPost}
        language={language}
      />

      {/* ADMIN PANEL */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        posts={posts}
        onAddPost={handleAddPost}
        onDeletePost={handleDeletePost}
        onEditPost={(p) => setEditingPost(p)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
      />

      {/* EDIT POST MODAL */}
      <EditPostModal
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        post={editingPost}
        onSave={handleUpdatePost}
      />

      {/* STATIC PAGE MODAL (About, Contact, Privacy, Disclaimer) */}
      <StaticPageModal
        page={staticPage}
        onClose={() => setStaticPage(null)}
        settings={settings}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        {selectedPost ? (
          /* POST PAGE */
          <PostDetail
            post={selectedPost}
            onBack={handleBackToHome}
            settings={settings}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditPost={(p) => setEditingPost(p)}
            onDeletePost={handleDeletePost}
          />
        ) : (
          /* HOME FEED: "All" FEED ONLY (NO CATEGORY TABS) */
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
            
            {/* If admin is logged in, show "Add New App" form right at the top */}
            {isAdminLoggedIn && (
              <AddNewAppForm onSave={handleAddPost} />
            )}

            {/* Posts Feed Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  All Feed
                </span>
                <span className="text-[11px] font-bold text-blue-500 bg-blue-500/10 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                  {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                </span>
              </div>
            </div>

            {/* FEED CONTENT OR "No posts yet" EMPTY STATE */}
            {posts.length === 0 ? (
              <div className="card-glow rounded-3xl p-10 sm:p-14 text-center border border-slate-200 dark:border-blue-900/40 my-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                  <Inbox className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  No posts yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
                  New apps, gift card codes, and updates will appear here once added.
                </p>

                <div className="mt-5">
                  {isAdminLoggedIn ? (
                    <button
                      onClick={() => setIsAdminOpen(true)}
                      className="btn-3d-blue px-5 py-2.5 rounded-xl text-white font-bold text-xs"
                    >
                      + Add Your First App
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsAdminOpen(true)}
                      className="btn-3d-white px-5 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-blue-900/50"
                    >
                      Admin Login to Add Posts
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelectPost={handleSelectPost}
                    isAdminLoggedIn={isAdminLoggedIn}
                    onEditPost={(p) => setEditingPost(p)}
                    onDeletePost={handleDeletePost}
                  />
                ))}
              </div>
            )}

            {/* "Load More Posts" button if posts exceed visible limit */}
            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                  className="btn-3d-blue w-full sm:w-auto sm:min-w-[200px] py-3.5 px-6 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-md"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Load More Posts</span>
                </button>
              </div>
            )}

            {/* Popular Posts (from user's own posts only) */}
            <PopularPosts
              posts={posts}
              onSelectPost={handleSelectPost}
            />

          </div>
        )}
      </main>

      {/* Floating Scroll-To-Top Button */}
      <ScrollToTop />

      {/* FOOTER */}
      <Footer
        settings={settings}
        onOpenStaticPage={(page) => setStaticPage(page)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

    </div>
  );
}
