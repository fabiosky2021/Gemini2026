import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Sparkles, Download } from 'lucide-react';
import { generateContentWithRetry } from "../utils/geminiRetry";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    setImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await generateContentWithRetry(ai, {
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
      });

      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            setImage(`data:image/png;base64,${base64EncodeString}`);
            setLoading(false);
            return;
          }
        }
      }
      throw new Error("No image generated");
    } catch (error) {
      console.error('Gemini error, trying OpenRouter fallback:', error);
      try {
        const response = await fetch('/api/openrouter-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].url) {
          setImage(data.data[0].url);
        } else {
          throw new Error("OpenRouter failed");
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        alert('Failed to generate image on both models. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-[#141414] rounded-xl shadow-md">
      <h2 className="text-2xl font-serif italic mb-4">Gerador de Imagens AI</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Descreva a imagem que deseja criar..."
          className="flex-1 p-3 border rounded-lg dark:bg-[#1E1E1E] dark:border-white/10"
        />
        <button
          onClick={generateImage}
          disabled={loading}
          className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          Gerar
        </button>
      </div>

      {image && (
        <div className="mt-6">
          <img src={image} alt="Generated" className="w-full rounded-lg shadow-lg" referrerPolicy="no-referrer" />
          <a
            href={image}
            download="ad_visual.png"
            className="mt-4 inline-flex items-center gap-2 text-blue-500"
          >
            <Download size={18} /> Baixar Imagem
          </a>
        </div>
      )}
    </div>
  );
}
