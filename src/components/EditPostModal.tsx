import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Check, AlertCircle, FileText, Globe } from 'lucide-react';
import { Post } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onSave: (updatedPost: Post) => Promise<void> | void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  onSave,
}) => {
  const [title, setTitle] = useState(post?.title || '');
  const [appLink, setAppLink] = useState(post?.appLink || '');
  const [appCode, setAppCode] = useState(post?.appCode || '');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
  const [snippet, setSnippet] = useState(post?.snippet || '');
  const [status, setStatus] = useState<'published' | 'draft'>(post?.status || 'published');
  const [imagePreview, setImagePreview] = useState(post?.imageUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setAppLink(post.appLink || '');
      setAppCode(post.appCode || '');
      setImageUrl(post.imageUrl || '');
      setSnippet(post.snippet || '');
      setStatus(post.status || 'published');
      setImagePreview(post.imageUrl || '');
      setErrorMessage('');
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 800, 0.72);
      setImageUrl(compressed);
      setImagePreview(compressed);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !appLink.trim() || (!imageUrl.trim() && !imagePreview)) {
      setErrorMessage('Please fill in Title, App Link, and upload or provide a photo.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...post,
        title: title.trim(),
        appLink: appLink.trim(),
        appCode: appCode.trim() || undefined,
        imageUrl: imageUrl.trim() || imagePreview,
        snippet: snippet.trim() || post.snippet,
        status,
      });
      onClose();
    } catch (err: any) {
      let msg = err.message || 'Failed to update app in database.';
      try {
        if (typeof msg === 'string' && msg.trim().startsWith('{')) {
          const parsed = JSON.parse(msg);
          if (parsed?.error) {
            msg = parsed.error;
          }
        }
      } catch {}
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1626] rounded-3xl shadow-2xl border border-slate-200 dark:border-blue-900/40 z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-blue-900/30 flex items-center justify-between bg-slate-50 dark:bg-[#111C2E]">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Edit App Details
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Update app information and sync to Firebase Firestore
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
          
          {/* Status selector (Published vs Draft) */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              App Visibility Status *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                  status === 'published'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Published (Live)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                  status === 'draft'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Save as Draft</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {status === 'published'
                ? 'Visible on public feed across all devices.'
                : 'Hidden from public visitors (only visible to admin).'}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              App Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* App Link */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              App Link * (Download / AdFly Promotional URL)
            </label>
            <input
              type="url"
              required
              value={appLink}
              onChange={(e) => setAppLink(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Photo Upload & Preview */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Photo * (Upload or Image URL)
            </label>

            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-3d-white px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                <span>Upload New Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="Or paste image URL"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-mono text-[11px]"
              />
            </div>

            {imagePreview && (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Referral / Redeem Code */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Referral / Redeem Code (Optional)
            </label>
            <input
              type="text"
              value={appCode}
              onChange={(e) => setAppCode(e.target.value)}
              placeholder="e.g. ZENO500 or GIFT-CODE"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Short description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Short Description
            </label>
            <textarea
              rows={3}
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-300 dark:border-blue-900/50 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-3d-blue py-3 rounded-xl text-white font-black flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : 'Update in Firebase'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
