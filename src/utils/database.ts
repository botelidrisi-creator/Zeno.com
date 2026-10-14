import { Post, SiteSettings } from '../types';
import { INITIAL_POSTS, INITIAL_SETTINGS } from '../data/initialPosts';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  Firestore,
} from 'firebase/firestore';
import { 
  db, 
  auth, 
  isUserAuthorizedAdmin, 
  handleFirestoreError, 
  OperationType,
  firebaseConfig
} from './firebase';

// Safe localStorage access
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
  } catch {}
};

/**
 * Clean & sanitize URL (removes any leading/trailing punctuation or invalid chars)
 */
function cleanUrl(raw?: string): string {
  if (!raw) return '';
  const match = raw.match(/https?:\/\/[^\s\)\।\<\>\"\'\`]+/i);
  return match ? match[0] : '';
}

/**
 * Supabase Client (optional secondary sync if provided)
 */
export function getSupabaseClient(
  customUrl?: string,
  customKey?: string
): SupabaseClient | null {
  const urlCandidate =
    customUrl ||
    (import.meta as any).env?.VITE_SUPABASE_URL ||
    safeGetItem('zeno_supabase_url') ||
    '';
  const url = cleanUrl(urlCandidate);
  const key = (
    customKey ||
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    safeGetItem('zeno_supabase_key') ||
    ''
  ).trim();

  if (url && key && !url.includes('...')) {
    try {
      return createClient(url, key);
    } catch (e) {
      console.warn('Supabase initialization notice:', e);
    }
  }
  return null;
}

/**
 * Get active Firestore instance
 */
export function getFirebaseDb(): Firestore {
  return db;
}

/**
 * Check if the Firebase connection is active and valid
 */
export async function testFirebaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const isAuth = await isUserAuthorizedAdmin(auth.currentUser);
    const postsCol = collection(db, 'posts');
    const q = isAuth ? postsCol : query(postsCol, where('status', '==', 'published'));
    const snap = await getDocs(q);
    return {
      success: true,
      message: `Connected to Cloud Firestore successfully! (${firebaseConfig.projectId} / ${firebaseConfig.firestoreDatabaseId || 'default'}). ${snap.docs.length} ${isAuth ? 'total apps in database' : 'published posts visible'}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to query Cloud Firestore. Please check Firebase configuration.',
    };
  }
}

/**
 * Fetch shared posts and settings from Cloud Firestore.
 * Regular public visitors will only see published posts.
 * Authorized admin sees both published and draft posts.
 */
export async function fetchSharedDatabase(settingsOverride?: SiteSettings): Promise<{
  posts: Post[];
  settings: SiteSettings;
  provider: 'firebase' | 'supabase' | 'local';
}> {
  let fetchedPosts: Post[] | null = null;
  let fetchedSettings: SiteSettings | null = null;
  let activeProvider: 'firebase' | 'supabase' | 'local' = 'local';

  // 1. Fetch from Cloud Firestore
  try {
    const isAdmin = await isUserAuthorizedAdmin(auth.currentUser);
    const postsCol = collection(db, 'posts');

    let postsSnap;
    if (isAdmin) {
      // Admin sees all posts (published + drafts)
      postsSnap = await getDocs(postsCol);
    } else {
      // Public visitors only fetch published posts
      const q = query(postsCol, where('status', '==', 'published'));
      try {
        postsSnap = await getDocs(q);
      } catch {
        // Fallback to fetch with filter
        postsSnap = await getDocs(postsCol);
      }
    }

    if (postsSnap && !postsSnap.empty) {
      const list: Post[] = [];
      postsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const postStatus = data.status === 'draft' ? 'draft' : 'published';
        // Double-check: if visitor is not admin, do not leak drafts
        if (!isAdmin && postStatus === 'draft') {
          return;
        }

        list.push({
          id: docSnap.id,
          title: data.title || '',
          author: data.author || 'by Zeno.com',
          date: data.date || '',
          imageUrl: data.imageUrl || data.image_url || '',
          snippet: data.snippet || '',
          appLink: data.appLink || data.app_link || '',
          appCode: data.appCode || data.app_code || undefined,
          views: data.views || 1,
          status: postStatus,
        });
      });
      fetchedPosts = list;
      activeProvider = 'firebase';
    }

    const settingsDoc = await getDoc(doc(db, 'settings', 'global_settings'));
    if (settingsDoc.exists()) {
      const sData = settingsDoc.data();
      fetchedSettings = {
        ...INITIAL_SETTINGS,
        siteName: sData.siteName || 'Zeno.com',
        youtubeUrl: sData.youtubeUrl || '',
        instagramUrl: sData.instagramUrl || '',
        telegramUrl: sData.telegramUrl || '',
      };
    }
  } catch (err: any) {
    console.warn('Firebase Firestore read notice:', err);
  }

  // 2. Try Supabase as secondary if Firestore has no posts yet
  if (!fetchedPosts) {
    const supabase = getSupabaseClient(
      settingsOverride?.supabaseUrl,
      settingsOverride?.supabaseAnonKey
    );
    if (supabase) {
      try {
        const { data: postsData, error: postsErr } = await supabase
          .from('posts')
          .select('*')
          .order('id', { ascending: false });

        if (!postsErr && Array.isArray(postsData) && postsData.length > 0) {
          fetchedPosts = postsData.map((row: any) => ({
            id: row.id,
            title: row.title,
            author: 'by Zeno.com',
            date: row.date,
            imageUrl: row.image_url || row.imageUrl,
            snippet: row.snippet,
            appLink: row.app_link || row.appLink,
            appCode: row.app_code || row.appCode || undefined,
            views: row.views || 1,
            status: row.status === 'draft' ? 'draft' : 'published',
          }));
          activeProvider = 'supabase';
        }
      } catch (e) {
        console.warn('Supabase fetch notice:', e);
      }
    }
  }

  // 3. Fallback to local cache if offline
  if (!fetchedPosts) {
    const local = safeGetItem('zeno_posts_v2');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          fetchedPosts = parsed.map((p: any) => ({
            ...p,
            status: p.status === 'draft' ? 'draft' : 'published',
          }));
        }
      } catch {}
    }
  }

  if (!fetchedSettings) {
    const localSettings = safeGetItem('zeno_settings_v2');
    if (localSettings) {
      try {
        const parsed = JSON.parse(localSettings);
        if (parsed && typeof parsed === 'object') {
          fetchedSettings = { ...INITIAL_SETTINGS, ...parsed };
        }
      } catch {}
    }
  }

  return {
    posts: fetchedPosts || INITIAL_POSTS,
    settings: fetchedSettings || INITIAL_SETTINGS,
    provider: activeProvider,
  };
}

/**
 * Verify admin is logged in before performing mutations
 */
export async function assertAdminAccess(): Promise<void> {
  const isAuth = await isUserAuthorizedAdmin(auth.currentUser);
  if (!isAuth) {
    throw new Error('Database Rule Violation: Only authorized admin account can add, edit, publish, or delete apps.');
  }
}

/**
 * Save or update a single post in the shared Firebase Firestore database.
 */
export async function savePostToDatabase(
  post: Post,
  adminToken?: string | null,
  settings?: SiteSettings
): Promise<{ success: boolean; provider: string; message: string }> {
  // Validate admin authorization
  await assertAdminAccess();

  const statusVal = post.status === 'draft' ? 'draft' : 'published';
  const cleanPostData = {
    id: post.id,
    title: post.title.trim(),
    author: post.author || 'by Zeno.com',
    date: post.date,
    imageUrl: post.imageUrl,
    snippet: post.snippet.trim(),
    appLink: post.appLink.trim(),
    appCode: post.appCode?.trim() || '',
    views: post.views || 1,
    status: statusVal,
  };

  try {
    const docRef = doc(db, 'posts', post.id);
    await setDoc(docRef, cleanPostData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `posts/${post.id}`);
  }

  // Also sync to Supabase if configured
  const supabase = getSupabaseClient(settings?.supabaseUrl, settings?.supabaseAnonKey);
  if (supabase) {
    try {
      await supabase.from('posts').upsert({
        id: post.id,
        title: cleanPostData.title,
        date: cleanPostData.date,
        image_url: cleanPostData.imageUrl,
        snippet: cleanPostData.snippet,
        app_link: cleanPostData.appLink,
        app_code: cleanPostData.appCode || null,
        views: cleanPostData.views,
        status: cleanPostData.status,
      });
    } catch (e) {
      console.warn('Supabase backup sync notice:', e);
    }
  }

  const statusLabel = statusVal === 'draft' ? 'Draft' : 'Published App';
  return {
    success: true,
    provider: 'Cloud Firestore',
    message: `${statusLabel} saved to Firebase Firestore successfully across all devices!`,
  };
}

/**
 * Delete a post from the shared Firebase Firestore database.
 */
export async function deletePostFromDatabase(
  postId: string,
  adminToken?: string | null,
  settings?: SiteSettings
): Promise<{ success: boolean; provider: string; message: string }> {
  // Validate admin authorization
  await assertAdminAccess();

  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
  }

  // Also remove from Supabase if configured
  const supabase = getSupabaseClient(settings?.supabaseUrl, settings?.supabaseAnonKey);
  if (supabase) {
    try {
      await supabase.from('posts').delete().eq('id', postId);
    } catch (e) {
      console.warn('Supabase delete notice:', e);
    }
  }

  return {
    success: true,
    provider: 'Cloud Firestore',
    message: 'App deleted from Firebase Firestore successfully.',
  };
}

/**
 * Save settings to shared Firebase database
 */
export async function saveSharedDatabase(
  posts: Post[],
  settings: SiteSettings,
  adminToken?: string | null
): Promise<{ success: boolean; provider: string; error?: string }> {
  try {
    await assertAdminAccess();
  } catch (e: any) {
    return { success: false, provider: 'none', error: e.message };
  }

  try {
    await setDoc(
      doc(db, 'settings', 'global_settings'),
      {
        siteName: settings.siteName || 'Zeno.com',
        youtubeUrl: settings.youtubeUrl || '',
        instagramUrl: settings.instagramUrl || '',
        telegramUrl: settings.telegramUrl || '',
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/global_settings');
  }

  // Update local caches
  safeSetItem('zeno_posts_v2', JSON.stringify(posts));
  safeSetItem('zeno_settings_v2', JSON.stringify(settings));

  return {
    success: true,
    provider: 'Cloud Firestore',
  };
}
