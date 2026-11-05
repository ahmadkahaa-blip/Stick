export interface GifItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  url: string;
  previewUrl?: string;
  dialogue?: string;
  language: string;
  mood: string;
  isCustom?: boolean;
  source: string;
  views?: number;
  likes?: number;
  aspectRatio?: 'square' | 'wide' | 'tall';
  createdAt?: string;
}

export type MessengerTarget = 'whatsapp' | 'signal' | 'native' | 'clipboard';

export interface BobblePack {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  gifs: GifItem[];
}
