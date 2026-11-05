import React, { useState } from 'react';
import { GifItem } from '../types/gif';
import { CATEGORIES, MOODS, LANGUAGES } from '../data/initialGifs';
import { X, Link2, Upload, Check, AlertCircle, ExternalLink } from 'lucide-react';

interface AddGifModalProps {
  onClose: () => void;
  onAddGif: (gif: GifItem) => void;
  onBatchAddGifs: (gifs: GifItem[]) => void;
  onShowToast: (msg: string) => void;
}

export const AddGifModal: React.FC<AddGifModalProps> = ({
  onClose,
  onAddGif,
  onBatchAddGifs,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');

  // URL Form state
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [dialogue, setDialogue] = useState('');
  const [category, setCategory] = useState<string>('Trending');
  const [mood, setMood] = useState<string>('Happy');
  const [language, setLanguage] = useState<string>('Hindi');
  const [tagsInput, setTagsInput] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [isBatchUrlMode, setIsBatchUrlMode] = useState(false);
  const [batchUrlsInput, setBatchUrlsInput] = useState('');

  // Upload file state
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDialogue, setUploadDialogue] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('Trending');

  // Handle URL change
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setPreviewError(false);

    // Auto extract title if url contains hints
    if (!title && newUrl) {
      try {
        const parts = newUrl.split('/');
        const last = parts[parts.length - 1].replace(/\.[^/.]+$/, '');
        if (last && last.length > 2 && !last.includes('giphy')) {
          setTitle(decodeURIComponent(last).replace(/[-_]/g, ' '));
        }
      } catch {
        // ignore
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image') && !file.name.endsWith('.gif')) {
      onShowToast('Please select a valid GIF or animated image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedDataUrl(reader.result as string);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFromUrl = (e: React.FormEvent) => {
    e.preventDefault();

    if (isBatchUrlMode) {
      const urls = batchUrlsInput
        .split('\n')
        .map((u) => u.trim())
        .filter((u) => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:'));

      if (urls.length === 0) {
        onShowToast('Please paste at least one valid GIF URL.');
        return;
      }

      const createdGifs: GifItem[] = urls.map((u, i) => {
        let derivedTitle = `Bobble GIF ${i + 1}`;
        try {
          const parts = u.split('/');
          const last = parts[parts.length - 1].replace(/\.[^/.]+$/, '');
          if (last && last.length > 2) {
            derivedTitle = decodeURIComponent(last).replace(/[-_]/g, ' ');
          }
        } catch {
          // fallback
        }

        return {
          id: `custom-batch-${Date.now()}-${i}`,
          title: derivedTitle,
          category,
          mood,
          language,
          url: u,
          tags: ['bobble', category.toLowerCase()],
          isCustom: true,
          source: 'bobble.ai/en/gifs'
        };
      });

      onBatchAddGifs(createdGifs);
      onShowToast(`Added ${createdGifs.length} GIFs to your library!`);
      onClose();
      return;
    }

    if (!url.trim()) {
      onShowToast('Please provide a GIF URL.');
      return;
    }
    if (!title.trim()) {
      onShowToast('Please provide a title for the GIF.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const newGif: GifItem = {
      id: `custom-url-${Date.now()}`,
      title: title.trim(),
      dialogue: dialogue.trim() || undefined,
      category,
      mood,
      language,
      url: url.trim(),
      tags: tags.length > 0 ? tags : [title.toLowerCase(), category.toLowerCase()],
      isCustom: true,
      source: 'bobble.ai/en/gifs',
      views: 1,
      likes: 1
    };

    onAddGif(newGif);
    onShowToast(`Added "${newGif.title}" to your Bobble GIF library!`);
    onClose();
  };

  const handleSaveFromUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedDataUrl) {
      onShowToast('Please upload a GIF file first.');
      return;
    }
    if (!uploadTitle.trim()) {
      onShowToast('Please enter a title for the uploaded GIF.');
      return;
    }

    const newGif: GifItem = {
      id: `custom-upload-${Date.now()}`,
      title: uploadTitle.trim(),
      dialogue: uploadDialogue.trim() || undefined,
      category: uploadCategory,
      mood: 'Excited',
      language: 'Hindi',
      url: uploadedDataUrl,
      tags: ['custom upload', uploadCategory.toLowerCase()],
      isCustom: true,
      source: 'Uploaded Local GIF',
      views: 1,
      likes: 1
    };

    onAddGif(newGif);
    onShowToast(`Uploaded and added "${newGif.title}" to your library!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Add GIFs to Hub
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste links from{' '}
              <a
                href="https://www.bobble.ai/en/gifs"
                target="_blank"
                rel="noreferrer"
                className="text-amber-600 dark:text-amber-400 font-semibold underline"
              >
                bobble.ai/en/gifs
              </a>{' '}
              or upload files from your device
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 gap-6">
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'url'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Add by URL</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload GIF File</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: ADD BY URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleSaveFromUrl} className="flex flex-col gap-4">
              {/* Single URL vs Multiple URLs Mode Switcher */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setIsBatchUrlMode(false)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      !isBatchUrlMode
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Single GIF Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBatchUrlMode(true)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      isBatchUrlMode
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Paste Multiple Links
                  </button>
                </div>

                <a
                  href="https://www.bobble.ai/en/gifs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1"
                >
                  <span>Open bobble.ai/en/gifs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {!isBatchUrlMode ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bobble AI or Direct GIF URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.bobble.ai/en/gifs/... or https://media.giphy.com/.../giphy.gif"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Tip: Right-click any GIF on bobble.ai/en/gifs and choose "Copy Image Address".
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paste Multiple GIF Links (1 per line) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={batchUrlsInput}
                    onChange={(e) => setBatchUrlsInput(e.target.value)}
                    placeholder="https://www.bobble.ai/en/gifs/example1.gif&#10;https://www.bobble.ai/en/gifs/example2.gif&#10;https://www.bobble.ai/en/gifs/example3.gif"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Add multiple GIF links at once. Each line will become a separate GIF in your hub!
                  </span>
                </div>
              )}

              {/* Live Preview Box */}
              {url && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-slate-200 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                    {!previewError ? (
                      <img
                        src={url}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        onError={() => setPreviewError(true)}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-[10px] text-rose-500 text-center p-1 flex flex-col items-center">
                        <AlertCircle className="w-4 h-4 mb-0.5" />
                        <span>Link error</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Live GIF Preview
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {!previewError
                        ? 'Image detected! Ready to add to your collection.'
                        : 'Could not load image directly. Check the link or try another.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Title / Sticker Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aur Batao Swag"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dialogue / Caption Punchline (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kya Haal Chaal Guru?"
                    value={dialogue}
                    onChange={(e) => setDialogue(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mood
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {MOODS.filter((m) => m !== 'All Moods').map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {LANGUAGES.filter((l) => l !== 'All Languages').map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. aur batao, funny, desi, chat"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 rounded-lg shadow-sm transition-all"
                >
                  Save to Hub
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: UPLOAD GIF FILE */}
          {activeTab === 'upload' && (
            <form onSubmit={handleSaveFromUpload} className="flex flex-col gap-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-amber-500 dark:hover:border-amber-400 transition-colors">
                <input
                  type="file"
                  id="gif-upload-input"
                  accept="image/gif,image/webp,image/png,image/jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="gif-upload-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Click to select a GIF or animated sticker from your device
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Supports .gif, .webp animated, up to 15MB
                  </span>
                </label>
              </div>

              {uploadedDataUrl && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-slate-200 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={uploadedDataUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      File Loaded Successfully
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ready to store in your browser library.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Title / Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My Custom Bobblehead"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dialogue / Punchline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kya Bolti Public!"
                  value={uploadDialogue}
                  onChange={(e) => setUploadDialogue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadedDataUrl}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  Add Uploaded GIF
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
