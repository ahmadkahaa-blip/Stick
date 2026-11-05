import { GifItem } from '../types/gif';

/**
 * Checks if current environment is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Clean filename for GIF download
 */
export function getGifFilename(gif: GifItem): string {
  const clean = gif.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${clean}.gif`;
}

/**
 * Gets a CORS-friendly URL for any GIF animation
 * Preserves animated GIF frames using n=-1 in weserv proxy or local server proxy
 */
export function getCorsFriendlyGifUrl(originalUrl: string): string {
  if (originalUrl.startsWith('/') || originalUrl.startsWith('data:')) {
    return originalUrl;
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `/api/sticker/proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  // n=-1 ensures weserv preserves ALL animation frames of the GIF
  return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&output=gif&n=-1`;
}

export const getCorsFriendlyUrl = (url: string) => getCorsFriendlyGifUrl(url);

/**
 * Fetches the actual raw animated GIF blob with image/gif MIME type
 */
export async function fetchGifBlob(gifUrl: string): Promise<Blob> {
  // If local asset or data URL, fetch directly without proxy
  if (gifUrl.startsWith('/') || gifUrl.startsWith('data:')) {
    try {
      const res = await fetch(gifUrl);
      if (res.ok) {
        const raw = await res.blob();
        return new Blob([raw], { type: 'image/gif' });
      }
    } catch (e) {
      console.warn('Local GIF fetch failed:', e);
    }
  }

  // If local server proxy is available
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    try {
      const res = await fetch(`/api/sticker/proxy?url=${encodeURIComponent(gifUrl)}`);
      if (res.ok) {
        const raw = await res.blob();
        return new Blob([raw], { type: 'image/gif' });
      }
    } catch (e) {
      console.warn('Local proxy GIF fetch failed:', e);
    }
  }

  // Direct fetch (preserves GIF animation)
  try {
    const res = await fetch(gifUrl);
    if (res.ok) {
      const raw = await res.blob();
      return new Blob([raw], { type: 'image/gif' });
    }
  } catch (e) {
    console.warn('Direct GIF fetch failed, trying proxy:', e);
  }

  // Fallback: weserv.nl preserving all GIF frames
  const fallbackUrl = `https://images.weserv.nl/?url=${encodeURIComponent(gifUrl)}&output=gif&n=-1`;
  const res = await fetch(fallbackUrl);
  const raw = await res.blob();
  return new Blob([raw], { type: 'image/gif' });
}

export const fetchStickerBlob = (url: string) => fetchGifBlob(url);

/**
 * Copies direct link to the animated GIF for sharing in chats
 */
export async function copyGifLink(gifUrl: string): Promise<boolean> {
  try {
    let finalUrl = gifUrl;
    if (gifUrl.startsWith('/')) {
      finalUrl = `${window.location.origin}${gifUrl}`;
    }
    await navigator.clipboard.writeText(finalUrl);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies PNG image to clipboard for desktop paste fallback
 */
export async function copyStickerToClipboard(gifUrl: string): Promise<{ success: boolean; type: 'image' | 'error' }> {
  try {
    const blob = await fetchGifBlob(gifUrl);
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    const pngBlob = await new Promise<Blob>((resolve) => {
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => resolve(b || blob), 'image/png');
        } else {
          resolve(blob);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(blob);
      };
      img.src = objectUrl;
    });

    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);
      return { success: true, type: 'image' };
    }
  } catch (err) {
    console.warn('Clipboard image copy error:', err);
  }

  return { success: false, type: 'error' };
}

/**
 * Downloads the actual animated .gif file
 */
export async function downloadGif(gif: GifItem) {
  try {
    const blob = await fetchGifBlob(gif.url);
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = getGifFilename(gif);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    const a = document.createElement('a');
    a.href = getCorsFriendlyGifUrl(gif.url);
    a.download = getGifFilename(gif);
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export const downloadWebpSticker = downloadGif;

export type ShareResult = {
  success: boolean;
  method: 'native_share' | 'clipboard_desktop';
};

/**
 * Share as Animated GIF to WhatsApp:
 * - On Mobile: Uses navigator.share with the actual .gif file (image/gif).
 *   WhatsApp opens in native GIF mode and sends the animated looping GIF!
 * - On Desktop: Downloads the .gif file and opens WhatsApp Web with instructions to drag/drop or attach as GIF.
 */
export async function shareAsWhatsAppGif(
  gif: GifItem,
  onToast?: (msg: string) => void,
  onDesktopModal?: () => void
): Promise<ShareResult> {
  const filename = getGifFilename(gif);

  // 1. Mobile Native Share: attaches the actual .gif file to WhatsApp
  if (navigator.canShare) {
    try {
      const blob = await fetchGifBlob(gif.url);
      const file = new File([blob], filename, { type: 'image/gif' });

      if (navigator.canShare({ files: [file] })) {
        onToast?.('Opening WhatsApp with your animated GIF...');
        await navigator.share({
          files: [file],
          title: `${gif.title} GIF`
        });
        return { success: true, method: 'native_share' };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: true, method: 'native_share' };
      }
      console.warn('Native share failed, using download flow:', err);
    }
  }

  // 2. Desktop Flow: auto-download the .gif and show desktop helper modal
  onToast?.('Downloading animated GIF for WhatsApp...');
  await downloadGif(gif);

  if (onDesktopModal) {
    onDesktopModal();
  } else {
    onToast?.('GIF downloaded! Drag and drop into WhatsApp Web to send as an animated GIF.');
    window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer');
  }

  return { success: true, method: 'clipboard_desktop' };
}

/**
 * Share as Animated GIF to Signal:
 * - On Mobile: Uses navigator.share with the actual .gif file (image/gif).
 *   Signal attaches and sends it as an animated looping GIF!
 * - On Desktop: Downloads the .gif file and opens Signal with drag & drop instructions.
 */
export async function shareAsSignalGif(
  gif: GifItem,
  onToast?: (msg: string) => void,
  onDesktopModal?: () => void
): Promise<ShareResult> {
  const filename = getGifFilename(gif);

  if (navigator.canShare) {
    try {
      const blob = await fetchGifBlob(gif.url);
      const file = new File([blob], filename, { type: 'image/gif' });

      if (navigator.canShare({ files: [file] })) {
        onToast?.('Opening Signal with your animated GIF...');
        await navigator.share({
          files: [file],
          title: `${gif.title} GIF`
        });
        return { success: true, method: 'native_share' };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: true, method: 'native_share' };
      }
      console.warn('Native Signal share failed, using download flow:', err);
    }
  }

  // Desktop Flow
  onToast?.('Downloading animated GIF for Signal...');
  await downloadGif(gif);

  if (onDesktopModal) {
    onDesktopModal();
  } else {
    onToast?.('GIF downloaded! Drag and drop into Signal to send as an animated GIF.');
    window.open('https://signal.org', '_blank', 'noopener,noreferrer');
  }

  return { success: true, method: 'clipboard_desktop' };
}

// Backward compatibility aliases
export const shareAsWhatsAppSticker = shareAsWhatsAppGif;
export const shareAsSignalSticker = shareAsSignalGif;
export const shareToWhatsApp = shareAsWhatsAppGif;
export const shareToSignal = shareAsSignalGif;
export const getStickerFilename = getGifFilename;
export function buildShareMessage(gif: GifItem): string {
  return `*${gif.dialogue || gif.title}*`;
}
