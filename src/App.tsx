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
import { 
  fetchSharedDatabase, 
  saveSharedDatabase, 
  savePostToDatabase, 
  deletePostFromDatabase,
  getSupabaseClient
} from './utils/database';
import { 
  auth, 
  db,
  googleProvider, 
  PRIMARY_ADMIN_EMAIL, 
  isUserAuthorizedAdmin 
} from './utils/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  setPersistence,
  browserSessionPersistence,
  User 
} from 'firebase/auth';
import { RotateCw, Inbox, PlusCircle, AlertCircle } from 'lucide-react';

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

  // Real Firebase Admin authentication state (FALSE by default)
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);

  // Settings state
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

  // Posts state
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
    return INITIAL_POSTS;
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
  const [deleteError, setDeleteError] = useState<{ id: string; code?: string; message: string } | null>(null);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    try {
      sessionStorage.removeItem('zeno_admin_session');
    } catch {}

    // On page load or refresh, user must always start as logged out.
    // Call signOut() immediately so any cached admin session is cleared.
    signOut(auth)
      .catch(() => {})
      .finally(() => {
        if (!isMounted) return;
        setIsAdmin(false);
        setAdminUser(null);

        // Attach listener for fresh explicit logins in this session
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!isMounted) return;
          if (!user) {
            setIsAdmin(false);
            setAdminUser(null);
            return;
          }

          const isAuthorizedEmail = Boolean(
            user.email && 
            user.email.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL.toLowerCase()
          );

          if (isAuthorizedEmail) {
            setIsAdmin(true);
            setAdminUser(user);
            // Sync admin record into /admins/{uid}
            setDoc(doc(db, 'admins', user.uid), {
              email: user.email,
              role: 'admin',
            }, { merge: true }).catch((err) => {
              console.warn('Admin record sync notice:', err);
            });

            // Re-fetch all posts including private drafts for admin
            fetchSharedDatabase().then(({ posts: remotePosts }) => {
              if (Array.isArray(remotePosts) && remotePosts.length > 0) {
                setPosts(remotePosts);
              }
            });
          } else {
            setIsAdmin(false);
            setAdminUser(null);
          }
        });
      });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Listen for #admin or ?admin in URL to open admin area (shows login screen if not authenticated)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        hash.includes('admin') ||
        hash.includes('login') ||
        search.includes('admin') ||
        search.includes('login')
      ) {
        setIsAdminOpen(true);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('admin') || hash.includes('login')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Load shared online Cloud Firestore database on mount
  useEffect(() => {
    fetchSharedDatabase(settings)
      .then(({ posts: remotePosts, settings: remoteSettings }) => {
        if (Array.isArray(remotePosts)) {
          setPosts(remotePosts);
          safeSetItem('zeno_posts_v2', JSON.stringify(remotePosts));
        }
        if (remoteSettings && typeof remoteSettings === 'object') {
          setSettings((prev) => ({ ...prev, ...remoteSettings }));
          safeSetItem('zeno_settings_v2', JSON.stringify(remoteSettings));
        }
      })
      .catch((err) => {
        console.warn('Initial Firestore database load notice:', err);
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

  // Admin Logout
  const handleAdminLogout = async () => {
    try {
      sessionStorage.removeItem('zeno_admin_session');
    } catch {}
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
    setIsAdmin(false);
    setAdminUser(null);
    setIsAdminOpen(false);
    setEditingPost(null);
    // Hide drafts immediately from local state
    setPosts((prev) => prev.filter((p) => p.status !== 'draft'));
  };

  // Add new post (saved directly to Cloud Firestore)
  const handleAddPost = async (newPost: Post, actionType: 'draft' | 'published' = 'published') => {
    const postWithStatus: Post = {
      ...newPost,
      status: actionType,
    };
    const updated = [postWithStatus, ...posts.filter(p => p.id !== newPost.id)];
    setPosts(updated);
    safeSetItem('zeno_posts_v2', JSON.stringify(updated));

    try {
      const result = await savePostToDatabase(postWithStatus, null, settings);
      // Immediately sign the admin out and set admin state to false so all admin controls disappear instantly
      await handleAdminLogout();
      return result;
    } catch (e) {
      console.error('Failed to sync new post to Firebase Firestore:', e);
      throw e;
    }
  };

  // Delete post (removes from Cloud Firestore collection 'posts' using post.id)
  const handleDeletePost = async (id: string) => {
    try {
      // 1. Call deleteDoc on 'posts' collection using correct document ID
      await deleteDoc(doc(db, 'posts', id));

      // Also clean up from secondary Supabase if configured
      const supabase = getSupabaseClient(settings?.supabaseUrl, settings?.supabaseAnonKey);
      if (supabase) {
        try {
          await supabase.from('posts').delete().eq('id', id);
        } catch (e) {
          console.warn('Supabase delete notice:', e);
        }
      }

      // 2. After a successful delete, remove the post from the list instantly without a page refresh
      setPosts((prevPosts) => {
        const updated = prevPosts.filter((p) => p.id !== id);
        safeSetItem('zeno_posts_v2', JSON.stringify(updated));
        return updated;
      });

      if (selectedPost?.id === id) {
        setSelectedPost(null);
      }
      setDeleteError(null);
    } catch (e: any) {
      const errCode = e?.code || (e instanceof Error ? e.name : 'firestore/delete-error');
      const errMsg = e?.message || String(e);
      console.error('Failed to delete post from Firebase Firestore:', { code: errCode, message: errMsg, error: e });
      setDeleteError({
        id,
        code: errCode,
        message: errMsg,
      });
      throw e;
    }
  };

  // Edit / Update post (updates in Cloud Firestore)
  const handleUpdatePost = async (updatedPost: Post) => {
    const updated = posts.map((p) => (p.id === updatedPost.id ? updatedPost : p));
    setPosts(updated);
    safeSetItem('zeno_posts_v2', JSON.stringify(updated));
    if (selectedPost?.id === updatedPost.id) {
      setSelectedPost(updatedPost);
    }

    try {
      await savePostToDatabase(updatedPost, null, settings);
      setEditingPost(null);
    } catch (e) {
      console.error('Failed to update post in Firebase Firestore:', e);
      throw e;
    }
  };

  // Quick publish a draft
  const handlePublishDraft = async (draftPost: Post) => {
    const published: Post = { ...draftPost, status: 'published' };
    await handleUpdatePost(published);
  };

  // Save settings (social links) to Cloud Firestore
  const handleSaveSettings = async (newSettings: SiteSettings) => {
    setSettings(newSettings);
    safeSetItem('zeno_settings_v2', JSON.stringify(newSettings));

    try {
      await saveSharedDatabase(posts, newSettings, null);
    } catch (e) {
      console.error('Failed to save settings to Firebase Firestore:', e);
    }
  };

  // Real Firebase Admin Login with Email & Password
  const handleAdminLoginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const authorized = cred.user.email?.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL.toLowerCase();
      if (!authorized) {
        await signOut(auth);
        try { sessionStorage.removeItem('zeno_admin_session'); } catch {}
        setIsAdmin(false);
        return { 
          success: false, 
          error: `Access Denied: Only ${PRIMARY_ADMIN_EMAIL} is authorized to manage Zeno.com.` 
        };
      }
      try { sessionStorage.setItem('zeno_admin_session', 'active'); } catch {}
      setIsAdmin(true);
      setAdminUser(cred.user);
      fetchSharedDatabase().then(({ posts: p }) => {
        if (Array.isArray(p)) setPosts(p);
      });
      return { success: true };
    } catch (err: any) {
      let msg = 'Failed to sign in. Please verify your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect password. If this is your first time, create a password below.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'Account not found. Click "First time? Create password" below.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please try again shortly or use Google sign in.';
      } else if (err.code === 'auth/api-key-not-valid' || err.code === 'auth/invalid-api-key') {
        msg = 'Firebase API key in firebase-applet-config.json was rejected.';
      } else if (err.message) {
        msg = err.message;
      }
      return { success: false, error: msg };
    }
  };

  // Real Firebase Admin Login with Google (1-Click)
  const handleAdminLoginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      const cred = await signInWithPopup(auth, googleProvider);
      const authorized = cred.user.email?.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL.toLowerCase();
      if (!authorized) {
        await signOut(auth);
        try { sessionStorage.removeItem('zeno_admin_session'); } catch {}
        setIsAdmin(false);
        return { 
          success: false, 
          error: `Access Denied: Account (${cred.user.email}) is not authorized. Authorized admin is ${PRIMARY_ADMIN_EMAIL}.` 
        };
      }
      try { sessionStorage.setItem('zeno_admin_session', 'active'); } catch {}
      setIsAdmin(true);
      setAdminUser(cred.user);
      fetchSharedDatabase().then(({ posts: p }) => {
        if (Array.isArray(p)) setPosts(p);
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google authentication canceled.' };
    }
  };

  // Create Firebase Admin account with Email & Password
  const handleAdminRegisterWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (email.toLowerCase().trim() !== PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      return { 
        success: false, 
        error: `Only the authorized admin (${PRIMARY_ADMIN_EMAIL}) can create admin credentials.` 
      };
    }
    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      await setPersistence(auth, browserSessionPersistence);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      try { sessionStorage.setItem('zeno_admin_session', 'active'); } catch {}
      setIsAdmin(true);
      setAdminUser(cred.user);
      fetchSharedDatabase().then(({ posts: p }) => {
        if (Array.isArray(p)) setPosts(p);
      });
      return { success: true };
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, error: 'Account already exists. Please sign in with your password.' };
      } else if (err.code === 'auth/api-key-not-valid' || err.code === 'auth/invalid-api-key') {
        return { success: false, error: 'Firebase API key in firebase-applet-config.json was rejected.' };
      }
      return { success: false, error: err.message || 'Failed to create admin account in Firebase.' };
    }
  };



  // Public visitors must ONLY see published apps.
  // Authorized admin sees published apps + drafts with clear indicators.
  const visiblePosts = isAdmin
    ? posts
    : posts.filter((p) => p.status !== 'draft');

  const displayedPosts = visiblePosts.slice(0, visibleCount);
  const hasMore = visibleCount < visiblePosts.length;

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
        isAdmin={isAdmin}
        onAdminLogout={handleAdminLogout}
        onSaveSettings={handleSaveSettings}
      />

      {/* SEARCH MODAL (Public visitors only search published apps) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={visiblePosts}
        onSelectPost={handleSelectPost}
        language={language}
      />

      {/* ADMIN PANEL (Real Firebase Login for visitors; Full Dashboard for authorized admin) */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        posts={posts}
        onAddPost={handleAddPost}
        onDeletePost={handleDeletePost}
        onEditPost={(p) => setEditingPost(p)}
        onPublishDraft={handlePublishDraft}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        isAdmin={isAdmin}
        adminEmail={adminUser?.email}
        onAdminLoginWithEmail={handleAdminLoginWithEmail}
        onAdminLoginWithGoogle={handleAdminLoginWithGoogle}
        onAdminRegisterWithEmail={handleAdminRegisterWithEmail}
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
        {/* On-screen error display if delete fails */}
        {deleteError && (
          <div className="max-w-2xl mx-auto px-4 pt-3 pb-1 animate-in fade-in">
            <div className="bg-red-500/10 dark:bg-red-950/40 border border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-2xl flex items-start justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Delete Error</p>
                  <p className="font-mono text-[11px] mt-0.5 break-all">
                    {deleteError.code ? `[${deleteError.code}] ` : ''}{deleteError.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteError(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm px-1 cursor-pointer"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {selectedPost ? (
          /* POST PAGE */
          <PostDetail
            post={selectedPost}
            onBack={handleBackToHome}
            settings={settings}
            isAdmin={isAdmin}
            onEditPost={(p) => setEditingPost(p)}
            onDeletePost={handleDeletePost}
          />
        ) : (
          /* HOME FEED: "All" FEED ONLY */
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
            
            {/* If and ONLY if admin is authenticated, show "Add New App" form at the top */}
            {isAdmin && (
              <AddNewAppForm onSave={handleAddPost} />
            )}

            {/* Posts Feed Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  All Feed
                </span>
                <span className="text-[11px] font-bold text-blue-500 bg-blue-500/10 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                  {visiblePosts.length} {visiblePosts.length === 1 ? 'post' : 'posts'}
                </span>
              </div>
              {/* Only authorized admin sees "+ Add App" quick shortcut */}
              {isAdmin && (
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="btn-3d-blue px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Add App</span>
                </button>
              )}
            </div>

            {/* FEED CONTENT OR "No posts yet" EMPTY STATE */}
            {visiblePosts.length === 0 ? (
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

                {/* Only logged in admin sees action button here; normal visitors see zero admin prompts */}
                {isAdmin && (
                  <div className="mt-5">
                    <button
                      onClick={() => setIsAdminOpen(true)}
                      className="btn-3d-blue px-5 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer"
                    >
                      + Add Your First App
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {displayedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelectPost={handleSelectPost}
                    isAdmin={isAdmin}
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

            {/* Popular Posts (published apps only for public visitors) */}
            <PopularPosts
              posts={visiblePosts}
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
        isAdmin={isAdmin}
      />

    </div>
  );
}
