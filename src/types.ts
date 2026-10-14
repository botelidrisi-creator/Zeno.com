export interface Post {
  id: string;
  title: string;
  author: 'by Zeno.com';
  date: string;
  imageUrl: string;
  snippet: string;
  appLink: string;
  appCode?: string; // referral or redeem code (optional)
  views?: number;
  status?: 'published' | 'draft';
}

export interface SiteSettings {
  siteName: 'Zeno.com';
  youtubeUrl: string;
  instagramUrl: string;
  telegramUrl: string;
  adminPassword?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  firebaseConfig?: string;
}
