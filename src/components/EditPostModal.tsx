import React, { useState, useRef } from 'react';
import { X, Upload, Check, Image as ImageIcon } from 'lucide-react';
import { Post } from '../types';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onSave: (updatedPost: Post) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  onSave,
}) => {
  if (!isOpen || !post) return null;

  const [title, setTitle] = useState(post.title);
  const [appLink, setAppLink] = useState(post.appLink);
  const [appCode, setAppCode] = useState(post.appCode || '');
  const [imageUrl, setImageUrl] = useState(post.imageUrl);
  const [snippet, setSnippet] = useState(post.snippet);
  const [imagePreview, setImagePreview] = useState(post.imageUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageUrl(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !appLink.trim() || !imageUrl.trim()) {
      alert('Please fill in Title, App Link, and upload/provide a photo.');
      return;
    }

    onSave({
      ...post,
      title: title.trim(),
      appLink: appLink.trim(),
      appCode: appCode.trim() || undefined,
      imageUrl: imageUrl.trim(),
      snippet: snippet.trim() || post.snippet,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1626] rounded-3xl shadow-2xl border border-slate-200 dark:border-blue-900/40 z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-blue-900/30 flex items-center justify-between bg-slate-50 dark:bg-[#111C2E]">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Edit Post Details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
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
              App Link *
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
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-3d-blue py-3 rounded-xl text-white font-black flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
