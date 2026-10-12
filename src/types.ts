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
}

export interface SiteSettings {
  siteName: 'Zeno.com';
  youtubeUrl: string;
  instagramUrl: string;
  telegramUrl: string;
  adminPassword?: string;
}
