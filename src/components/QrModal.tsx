import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { GifItem } from '../types/gif';
import { X, Smartphone, Check, Copy } from 'lucide-react';
import { buildShareMessage } from '../utils/shareUtils';

interface QrModalProps {
  gif: GifItem;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const QrModal: React.FC<QrModalProps> = ({ gif, onClose, onShowToast }) => {
  const [targetApp, setTargetApp] = useState<'whatsapp' | 'signal' | 'direct'>('whatsapp');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateQr = async () => {
      let targetPayload = gif.url;
      const text = buildShareMessage(gif);

      if (targetApp === 'whatsapp') {
        targetPayload = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      } else if (targetApp === 'signal') {
        targetPayload = `https://signal.me/#p/?text=${encodeURIComponent(text)}`;
      }

      try {
        const url = await QRCode.toDataURL(targetPayload, {
          width: 320,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    };

    generateQr();
  }, [gif, targetApp]);

  const handleCopyLink = async () => {
    let payload = gif.url;
    if (targetApp === 'whatsapp') {
      payload = `https://api.whatsapp.com/send?text=${encodeURIComponent(buildShareMessage(gif))}`;
    } else if (targetApp === 'signal') {
      payload = `https://signal.me/#p/?text=${encodeURIComponent(buildShareMessage(gif))}`;
    }
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    onShowToast('Copied QR share URL to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
          <Smartphone className="w-5 h-5" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Scan to Send from Mobile
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
          Open your phone camera to scan and immediately launch chat
        </p>

        {/* Target Switcher */}
        <div className="flex items-center justify-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
          <button
            onClick={() => setTargetApp('whatsapp')}
            className={`flex-1 py-1 px-2 text-xs font-semibold rounded-md transition-colors ${
              targetApp === 'whatsapp'
                ? 'bg-[#25D366] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setTargetApp('signal')}
            className={`flex-1 py-1 px-2 text-xs font-semibold rounded-md transition-colors ${
              targetApp === 'signal'
                ? 'bg-[#3A76F0] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Signal
          </button>
          <button
            onClick={() => setTargetApp('direct')}
            className={`flex-1 py-1 px-2 text-xs font-semibold rounded-md transition-colors ${
              targetApp === 'direct'
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Direct GIF
          </button>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 inline-block shadow-inner">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="w-48 h-48 mx-auto object-contain"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
              Generating QR...
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 mt-3 font-medium">
          {targetApp === 'whatsapp'
            ? 'Opens WhatsApp chat with GIF on your phone'
            : targetApp === 'signal'
            ? 'Opens Signal chat with GIF on your phone'
            : 'Opens full GIF link in phone browser'}
        </p>

        <button
          onClick={handleCopyLink}
          className="mt-4 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copy Share URL</span>
        </button>
      </div>
    </div>
  );
};
