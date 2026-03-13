import { useState, useRef, useEffect } from 'react';
import { Mic, Image as ImageIcon, Send, Loader2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { generateHooks, generateBody } from '../services/aiService';
import ImageLibrary from './ImageLibrary';

export default function CreativeStudio() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'pt-BR';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt((prev) => prev + ' ' + transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleGenerate = async (type: 'hook' | 'body') => {
    setLoading(true);
    try {
      if (type === 'hook') {
        const hooks = await generateHooks("Aprenda a fazer 52 Receitas de Bolo para comer preparadas em 5 Minutos ou Menos!", prompt);
        setResult(hooks || '');
      } else {
        const body = await generateBody(prompt, "Aprenda a fazer 52 Receitas de Bolo para comer preparadas em 5 Minutos ou Menos!", prompt);
        setResult(body || '');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {showLibrary && <ImageLibrary currentSelectedUrl={selectedImage} onSelect={(url) => setSelectedImage(url)} onClose={() => setShowLibrary(false)} />}
      
      <h2 className="font-serif italic text-3xl mb-8">Estúdio de Criação</h2>
      
      <div className="bg-white dark:bg-[#1C1C1C] p-6 rounded-xl shadow-sm border border-black/5 dark:border-white/10 relative overflow-hidden">
        {loading && (
          <motion.div 
            className="absolute top-0 left-0 h-1 bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "linear" }}
          />
        )}
        
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <img src={selectedImage} alt="Selected" className="h-24 w-24 object-cover rounded-lg" referrerPolicy="no-referrer" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
          </div>
        )}

        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Cole a copy do anúncio escalado ou descreva sua nova oferta..."
          className="w-full h-32 p-4 rounded-lg border border-black/10 dark:border-white/10 mb-4 font-mono text-sm bg-transparent dark:text-white"
        />
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'}`}
            >
              <Mic size={20} />
            </button>
            <button onClick={() => setShowLibrary(true)} className="p-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20"><ImageIcon size={20} /></button>
          </div>
          <button 
            onClick={() => handleGenerate('body')}
            disabled={loading}
            className="px-6 py-3 bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414] rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Gerando Criativo...
              </>
            ) : (
              <>
                <Send size={18} /> Gerar Criativo
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleGenerate('hook')}
          disabled={loading}
          className="p-4 border border-[#141414] dark:border-[#E4E3E0] rounded-lg text-left hover:bg-[#141414] dark:hover:bg-[#E4E3E0] hover:text-[#E4E3E0] dark:hover:text-[#141414] disabled:opacity-50"
        >
          Gerar 10 Hooks (Quebra de Padrão)
        </button>
        <button 
          onClick={() => handleGenerate('body')}
          disabled={loading}
          className="p-4 border border-[#141414] dark:border-[#E4E3E0] rounded-lg text-left hover:bg-[#141414] dark:hover:bg-[#E4E3E0] hover:text-[#E4E3E0] dark:hover:text-[#141414] disabled:opacity-50"
        >
          Criar Corpo do Anúncio (30-50s)
        </button>
      </div>

      {result && (
        <div className="mt-8 p-6 bg-white dark:bg-[#1C1C1C] rounded-xl border border-black/5 dark:border-white/10 whitespace-pre-wrap font-mono text-sm">
          {result}
        </div>
      )}
    </div>
  );
}
