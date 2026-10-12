import React, { useState, useRef } from 'react';
import { PlusCircle, Upload, Check, Sparkles, Image as ImageIcon, Link as LinkIcon, Hash } from 'lucide-react';
import { Post } from '../types';

interface AddNewAppFormProps {
  onSave: (newPost: Post) => void;
}

export const AddNewAppForm: React.FC<AddNewAppFormProps> = ({ onSave }) => {
  const [title, setTitle] = useState('');
  const [appLink, setAppLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [appCode, setAppCode] = useState('');
  const [snippet, setSnippet] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !appLink.trim() || (!imageUrl && !imagePreview)) {
      alert('Please fill in Title, App Link, and upload a photo.');
      return;
    }

    const today = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date());

    const newPost: Post = {
      id: `zeno-post-${Date.now()}`,
      title: title.trim(),
      author: 'by Zeno.com',
      date: today,
      imageUrl: imageUrl.trim() || imagePreview,
      appLink: appLink.trim(),
      appCode: appCode.trim() || undefined,
      snippet: snippet.trim() || `Official app review and download guide on Zeno.com.`,
      views: 1,
    };

    onSave(newPost);

    // Reset form
    setTitle('');
    setAppLink('');
    setImageUrl('');
    setImagePreview('');
    setAppCode('');
    setSnippet('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="card-glow rounded-2xl p-4 sm:p-5 border border-blue-500/30 bg-[#0E1626] text-white">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/30">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>Add New App</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/40 px-1.5 py-0.5 rounded font-mono font-normal">
                Admin
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Publish a new app, upload photo, code & download link
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand Form'}
        </button>
      </div>

      {isSuccess && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>App saved successfully! Now live in the All feed and saved in the database.</span>
        </div>
      )}

      {isExpanded && (
        <form onSubmit={handleSave} className="mt-4 pt-3 border-t border-blue-900/40 space-y-3.5 text-xs">
          
          {/* Title */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Free UPI Earning App - Instant ₹200 Daily"
              className="w-full h-10 px-3 rounded-xl bg-[#111827] border border-blue-900/50 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>

          {/* App Link */}
          <div>
            <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>App Link * (Target Download URL)</span>
            </label>
            <input
              type="url"
              required
              value={appLink}
              onChange={(e) => setAppLink(e.target.value)}
              placeholder="https://play.google.com/store/apps/details?id=..."
              className="w-full h-10 px-3 rounded-xl bg-[#111827] border border-blue-900/50 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Photo Upload *</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-3d-white px-3.5 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                <span>Choose Photo from Device</span>
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
                placeholder="Or paste an image URL"
                className="flex-1 h-10 px-3 rounded-xl bg-[#111827] border border-blue-900/50 text-white font-mono text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {imagePreview && (
              <div className="mt-2 relative aspect-[16/9] max-h-48 w-full rounded-xl overflow-hidden border border-blue-900/40 bg-slate-900">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Referral / Redeem Code (Optional) */}
          <div>
            <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              <span>Referral / Redeem Code (Optional)</span>
            </label>
            <input
              type="text"
              value={appCode}
              onChange={(e) => setAppCode(e.target.value)}
              placeholder="e.g. ZENO500 or GIFT-CODE"
              className="w-full h-10 px-3 rounded-xl bg-[#111827] border border-blue-900/50 text-white font-mono font-bold placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              placeholder="A few lines explaining the app, rewards or task..."
              className="w-full p-2.5 rounded-xl bg-[#111827] border border-blue-900/50 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="btn-3d-blue w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 tracking-wide shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>SAVE & PUBLISH TO ALL FEED</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
