import React, { useState } from 'react';
import { GifItem } from '../types/gif';
import { X, Heart, Download, Link, Check, MessageSquare, Trash2, Film, Info, Loader2 } from 'lucide-react';
import {
  shareAsWhatsAppGif,
  shareAsSignalGif,
  copyGifLink,
  downloadGif
} from '../utils/shareUtils';
import { ChatSimulator } from './ChatSimulator';

interface GifDetailModalProps {
  gif: GifItem;
  allGifs: GifItem[];
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onSelectGif: (gif: GifItem) => void;
  onShowQr: (gif: GifItem) => void;
  onShowToast: (msg: string) => void;
  onDelete?: (id: string) => void;
  onOpenDesktopModal?: (gif: GifItem, targetApp: 'whatsapp' | 'signal') => void;
}

export const GifDetailModal: React.FC<GifDetailModalProps> = ({
  gif,
  allGifs,
  isFavorite,
  onClose,
  onToggleFavorite,
  onSelectGif,
  onShowToast,
  onDelete,
  onOpenDesktopModal
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleWhatsAppGif = async () => {
    setIsSharing(true);
    await shareAsWhatsAppGif(
      gif,
      onShowToast,
      onOpenDesktopModal ? () => onOpenDesktopModal(gif, 'whatsapp') : undefined
    );
    setIsSharing(false);
  };

  const handleSignalGif = async () => {
    setIsSharing(true);
    await shareAsSignalGif(
      gif,
      onShowToast,
      onOpenDesktopModal ? () => onOpenDesktopModal(gif, 'signal') : undefined
    );
    setIsSharing(false);
  };

  const handleCopyLink = async () => {
    const success = await copyGifLink(gif.url);
    if (success) {
      setCopiedLink(true);
      onShowToast('Direct GIF link copied! Paste into WhatsApp or Signal chat.');
      setTimeout(() => setCopiedLink(false), 2200);
    } else {
      onShowToast('Could not copy link. Try WhatsApp or Download button.');
    }
  };

  const handleDownload = () => {
    downloadGif(gif);
    onShowToast('Downloading animated .gif...');
  };

  const handleDelete = () => {
    if (onDelete && window.confirm(`Delete "${gif.title}" from your library?`)) {
      onDelete(gif.id);
      onShowToast(`Deleted "${gif.title}"`);
      onClose();
    }
  };

  // Find related gifs from same category
  const relatedGifs = allGifs
    .filter((g) => g.id !== gif.id && g.category === gif.category)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
              <Film className="w-3.5 h-3.5" />
              <span>Animated Bobble GIF</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {gif.category} · {gif.language}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Delete this GIF"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onToggleFavorite(gif.id)}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Add to favorites"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Column Desktop Layout */}
        <div className="p-3.5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 max-h-[82vh] overflow-y-auto">
          {/* Left Column: GIF Display & Quick Actions */}
          <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
            {/* Animated GIF Player Canvas */}
            <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/60 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6">
              <img
                src={gif.url}
                alt={gif.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_8px_25px_rgba(255,255,255,0.15)] scale-105"
              />

              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/85 text-white text-[10px] font-mono tracking-wide backdrop-blur-xs flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ANIMATED GIF</span>
              </div>
            </div>

            {/* Title & Punchline */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {gif.title}
              </h2>
              {gif.dialogue && (
                <p className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400 italic">
                  "{gif.dialogue}"
                </p>
              )}
            </div>

            {/* Primary GIF Share Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsAppGif}
                disabled={isSharing}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
              >
                {isSharing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                )}
                <span>Send WhatsApp GIF</span>
              </button>

              <button
                onClick={handleSignalGif}
                disabled={isSharing}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#3A76F0] hover:bg-[#2b65da] active:scale-95 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
              >
                {isSharing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.95.56 3.77 1.53 5.32L2 22l4.82-1.51C8.32 21.45 10.1 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/>
                  </svg>
                )}
                <span>Send Signal GIF</span>
              </button>
            </div>

            {/* Copy Link & Download .gif */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Link className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy GIF Link'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download .gif</span>
              </button>
            </div>

            {/* GIF Tips Callout */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                <Info className="w-3.5 h-3.5" />
                <span>Sending as Animated GIF:</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                • <strong>Mobile:</strong> Tap "Send WhatsApp GIF" to open WhatsApp's native GIF sender directly with the looping animation.
                <br />
                • <strong>Desktop:</strong> The animated <code>.gif</code> downloads automatically—drag and drop it into WhatsApp Web / Signal chat to play in-line as a GIF!
              </p>
            </div>
          </div>

          {/* Right Column: Live Chat Simulation */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Live Chat Animation Preview</span>
              </div>
              <ChatSimulator
                gif={gif}
                onShowToast={onShowToast}
                onOpenDesktopModal={onOpenDesktopModal}
              />
            </div>

            {/* Related GIFs */}
            {relatedGifs.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  More GIFs in {gif.category}
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {relatedGifs.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => onSelectGif(rel)}
                      className="aspect-square p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 flex items-center justify-center transition-all group"
                    >
                      <img
                        src={rel.url}
                        alt={rel.title}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
