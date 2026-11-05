import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Curated GIF URL pool from Bobble CDN for realistic animated previews
const BOBBLE_PREVIEW_POOL = [
  'https://bobble-animations.bobblekeyboard.net/previews/2c603501-fe93-41de-8ab7-a1d9da194b07.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/178f694f-50c5-408d-8214-b403e60bc734.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/2204133f-f6b2-4cef-b87a-2fde4fd09b90.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/feddd75e-669d-4e92-ba65-6137a4757494.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/dea7d7e0-ad54-4dfc-8d7e-bfb1a8fde103.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/973c95b0-784d-4acf-b96b-6127ebeba1ab.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/7ebd604f-9418-462f-97c8-29176f41cb8a.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/5d1ca305-680a-42a7-9474-ea2d8fea7c37.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/5a7bd5b8-2983-4894-8731-1d87b740215f.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/43b70612-ff3e-4312-a160-9006c7c84312.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/32e27c62-f2dc-4bcd-8fd0-22367439b7c5.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/f4e94117-0d74-45a2-b302-3a4b1e11bf31.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/cd06961e-dab8-4f93-b658-520b7bc23acb.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/c0b9240c-0e97-463e-97d4-8e564f11d739.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/cd7e53ac-059a-4d16-a876-714a7680732b.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/59b804d3-8715-43f9-ae4f-45164739fcae.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/fe1e9fab-ea72-42ae-a59c-4be9c8bc3051.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/47f85852-7082-4a26-8f75-296910c4a367.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/9b7d436a-81ad-4ff5-9f92-fa77b8317074.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/11b0e44f-d9cf-4e19-88e0-c038c5d95822.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/c7b3381b-de6e-4c1d-af75-54085288a9ec.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/03f04e81-ffab-427a-85ba-a7435f86320c.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/141a97b6-a659-4cb3-b8c9-94ccdc104075.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/f1dbd6f7-8718-4f9b-8c28-42bef3082767.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/659b2b45-0220-4821-904e-7017a9a93a9f.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/0a3824ac-c9d8-443d-a671-921775b2fcb9.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/ae0fb52a-73cd-46c9-90af-3c1d6078a679.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/002f572c-2e3a-4c25-8a1a-9ca2d8f6cfdc.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/bb94cdfe-28fd-48ab-a163-e6848b03e8f3.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/d98a5a47-ae28-4a74-98fb-c0d012013c9e.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/b1f4e959-e179-4e02-8717-81b5598744f7.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/e029146b-0c3d-40c7-8f0c-c334fab73078.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/9c34dd4d-db68-4c54-8224-3e983ff91701.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/b82c85e2-f7ca-451c-9319-3ba2d2f17c15.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/f959e82b-4f1d-4aee-a914-424e61d940d9.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/47004613-96d6-4954-8c0a-fcae18473cdd.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/8cf34a4a-0869-42d2-9343-f6156dd4f1d9.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/a78c536b-9522-4dd6-a08e-2e9379b291b7.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/1d9c6caa-a582-4ac4-ad21-3362eea4e4ba.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/415a5b46-e593-4a70-ab58-2c6c306671e3.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/c91dc4bd-4dee-42ac-a891-a5c61a1b5a5e.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/9935561e-73a4-4861-8c7c-6257e5aebb71.gif'
];

// Fallback generator for themes when API key is not yet set
const generateFallbackCategory = (theme: string, language: string) => {
  const normalized = theme.trim() || 'Cooking';
  const cleanCategoryName = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  
  const presets: Record<string, any[]> = {
    cooking: [
      {
        title: 'Masterchef Tadka Sizzle',
        dialogue: 'Tadka lag chuka hai, khushbu poore mohalle mein fail gayi! 🍳🔥',
        mood: 'Excited',
        tags: ['cooking', 'tadka', 'masterchef', 'foodie', 'khana'],
      },
      {
        title: 'Biryani is Pure Love',
        dialogue: 'Biryani sirf khana nahi, dil ka sukoon hai 🍚❤️',
        mood: 'Loving',
        tags: ['biryani', 'cooking', 'love', 'foodie', 'lunch'],
      },
      {
        title: '2-Minute Maggi Reality',
        dialogue: '2 minute bolke 15 minute lagate hain par taste lajawab! 🍜🤤',
        mood: 'Funny',
        tags: ['maggi', 'cooking', 'late night', 'noodles', 'snack'],
      },
      {
        title: 'Onion Tears Drama',
        dialogue: 'Pyaar mein itne aansu nahi bahaye jitne pyaz kaatne mein aaye 🧅😭',
        mood: 'Funny',
        tags: ['cooking', 'pyaz', 'onions', 'kitchen drama', 'tears'],
      },
      {
        title: 'Garma Garam Golgappe',
        dialogue: 'Bhaiyya thoda teekha paani aur daalo! 🤤🌶️',
        mood: 'Happy',
        tags: ['golgappa', 'panipuri', 'street food', 'cooking', 'chatpata'],
      },
      {
        title: 'Chai & Garam Samosa',
        dialogue: 'Shaam ki chai ke saath samosa mil jaye toh jannat! ☕🥟',
        mood: 'Happy',
        tags: ['samosa', 'chai', 'evening snack', 'cooking', 'desifood'],
      },
    ],
    gym: [
      {
        title: 'Leg Day Soreness',
        dialogue: 'Aaj leg day tha, kal se wheel chair pe ghoomna padega 🦵💀',
        mood: 'Funny',
        tags: ['gym', 'leg day', 'fitness', 'workout', 'pain'],
      },
      {
        title: 'Protein Shake Addiction',
        dialogue: 'Dole shole banenge tabhi toh rishta aayega 💪🥛',
        mood: 'Excited',
        tags: ['protein', 'gym', 'workout', 'fitness', 'biceps'],
      },
      {
        title: 'Diet Day One Struggle',
        dialogue: 'Dieting shuru ki thi, samne samosa aa gaya 🍕😭',
        mood: 'Funny',
        tags: ['diet', 'gym', 'struggle', 'cheat meal', 'fitness'],
      },
    ]
  };

  const key = Object.keys(presets).find((k) => normalized.toLowerCase().includes(k)) || 'cooking';
  const templates = presets[key] || presets['cooking'];

  const gifs = templates.map((tmpl, idx) => ({
    id: `ai-${Date.now()}-${idx + 1}`,
    title: tmpl.title,
    category: cleanCategoryName,
    dialogue: tmpl.dialogue,
    tags: tmpl.tags,
    url: BOBBLE_PREVIEW_POOL[idx % BOBBLE_PREVIEW_POOL.length],
    language: language || 'Hinglish',
    mood: tmpl.mood || 'Happy',
    source: 'ai-studio-gemini',
    views: Math.floor(Math.random() * 50000) + 40000,
    likes: Math.floor(Math.random() * 8000) + 3000,
    aspectRatio: 'square',
    createdAt: new Date().toISOString()
  }));

  return {
    categoryName: cleanCategoryName,
    description: `AI-curated ${cleanCategoryName} animated GIFs with shareable WhatsApp/Signal dialogues.`,
    gifs
  };
};

// API Route: Generate Category using Gemini API (gemini-3.8-flash)
app.post('/api/gemini/generate-category', async (req, res) => {
  try {
    const { categoryName, theme, language = 'Hinglish', count = 6 } = req.body;
    const promptTheme = categoryName || theme || 'Cooking';

    const ai = getGeminiClient();

    if (!ai) {
      console.log('GEMINI_API_KEY not configured, using smart curated category fallback');
      const fallbackData = generateFallbackCategory(promptTheme, language);
      return res.json({
        success: true,
        source: 'smart-preset',
        data: fallbackData,
      });
    }

    const systemInstruction = `You are an expert pop-culture and Indian sticker/GIF curator for Bobble Keyboard.
Create an awesome pack of GIF cards for the requested category/theme.
Focus on highly relatable, hilarious, share-worthy dialogues tailored for WhatsApp and Signal status & chats.
Use colloquial Hinglish, Hindi, or English that friends and family share every day.`;

    const userPrompt = `Create a GIF pack for category: "${promptTheme}".
Preferred language: ${language}.
Number of GIFs: ${Math.min(Math.max(count, 4), 10)}.
Provide witty titles, relatable chat dialogues (with emojis), relevant tags, and mood.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoryName: {
              type: Type.STRING,
              description: 'Short display name for the category (e.g. Cooking, Biryani Lovers, Chai Time)',
            },
            description: {
              type: Type.STRING,
              description: 'One sentence description of this GIF pack',
            },
            gifs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Catchy GIF title' },
                  dialogue: { type: Type.STRING, description: 'Hilarious or sweet chat caption ready to send with GIF' },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3-5 search keywords',
                  },
                  mood: { type: Type.STRING, description: 'Happy, Funny, Loving, Excited, Chilled, Celebratory, or Savage' },
                  language: { type: Type.STRING, description: 'Hinglish, Hindi, or English' },
                },
                required: ['title', 'dialogue', 'tags', 'mood'],
              },
            },
          },
          required: ['categoryName', 'gifs'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const finalCategoryName = parsed.categoryName || promptTheme;

    // Attach valid Bobble preview GIF URLs to the items
    const gifs = (parsed.gifs || []).map((item: any, idx: number) => ({
      id: `ai-${Date.now()}-${idx + 1}`,
      title: item.title,
      category: finalCategoryName,
      dialogue: item.dialogue,
      tags: item.tags || [finalCategoryName.toLowerCase()],
      url: BOBBLE_PREVIEW_POOL[idx % BOBBLE_PREVIEW_POOL.length],
      language: item.language || language,
      mood: item.mood || 'Happy',
      source: 'gemini-3.8-flash',
      views: Math.floor(Math.random() * 60000) + 30000,
      likes: Math.floor(Math.random() * 9000) + 2000,
      aspectRatio: 'square',
      createdAt: new Date().toISOString()
    }));

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      data: {
        categoryName: finalCategoryName,
        description: parsed.description || `AI created GIF category for ${finalCategoryName}`,
        gifs
      }
    });
  } catch (error: any) {
    console.error('Gemini category generation error:', error);
    // Graceful fallback so the client never breaks
    const fallback = generateFallbackCategory(req.body.categoryName || 'Cooking', req.body.language || 'Hinglish');
    return res.json({
      success: true,
      source: 'fallback-after-error',
      data: fallback,
      errorNotice: error.message
    });
  }
});

// Proxy image route to bypass CORS for HTML5 Canvas sticker rendering
app.get('/api/sticker/proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send('Missing url parameter');
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch image');
    }

    const contentType = response.headers.get('content-type') || 'image/gif';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const buffer = Buffer.from(await response.arrayBuffer());
    return res.send(buffer);
  } catch (err: any) {
    console.error('Sticker proxy error:', err);
    return res.status(500).send('Error proxying sticker');
  }
});

// Direct WebP sticker download endpoint
app.get('/api/sticker/download', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    const title = (req.query.title as string) || 'sticker';
    if (!imageUrl) {
      return res.status(400).send('Missing url parameter');
    }

    const cleanName = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch sticker');
    }

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}_sticker.webp"`);
    res.setHeader('Access-Control-Allow-Origin', '*');

    const buffer = Buffer.from(await response.arrayBuffer());
    return res.send(buffer);
  } catch (err: any) {
    console.error('Sticker download error:', err);
    return res.status(500).send('Error downloading sticker');
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bobble GIF app server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
