import React, { useState } from 'react';
import { Mic, Play, Download, Loader2, Volume2 } from 'lucide-react';

export const AntonyVoiceGenerator: React.FC = () => {
  const [text, setText] = useState('Olá parceiro, o sistema foi atualizado e agora minha voz está soando perfeitamente natural.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateVoice = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Falha ao gerar voz');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Erro ao gerar voz:', error);
      alert('Erro ao conectar com ElevenLabs. Verifique sua API Key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'voz_antony.mp3';
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-[#1C1C1C] rounded-2xl shadow-xl border border-black/5 dark:border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/10 rounded-xl">
          <Volume2 className="text-emerald-600" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-serif italic">Voz do Antony (ElevenLabs)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">Alta Fidelidade & Naturalidade</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2 opacity-70">Texto para Locução</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 bg-gray-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="Digite o texto que o Antony deve falar..."
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={generateVoice}
            disabled={isGenerating}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Gerando Áudio...
              </>
            ) : (
              <>
                <Mic size={20} />
                Gerar Voz do Antony
              </>
            )}
          </button>
        </div>

        {audioUrl && (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Áudio Gerado com Sucesso!</span>
              <button
                onClick={downloadAudio}
                className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-600 transition-colors"
                title="Baixar MP3"
              >
                <Download size={20} />
              </button>
            </div>
            <audio src={audioUrl} controls className="w-full" />
          </div>
        )}
      </div>

      <div className="mt-8 p-4 border-t border-black/5 dark:border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Configurações do Antony</h4>
        <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-gray-500">
          <div>Estabilidade: 45%</div>
          <div>Similaridade: 75%</div>
          <div>Modelo: Multilingual v2</div>
          <div>ID: ErXwoba...</div>
        </div>
      </div>
    </div>
  );
};
