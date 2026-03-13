import { useState, useEffect } from 'react';
import { Gemini2026 } from '../services/gemini2026Agent';
import { evaluateEbookContent } from '../services/openRouterService';
import { Loader2, Play, StopCircle, Download, BookOpen, Star } from 'lucide-react';
import jsPDF from 'jspdf';

export default function Gemini2026Orchestrator() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [topic, setTopic] = useState(() => {
    return localStorage.getItem('gemini2026_topic') || 'Artificial Intelligence';
  });
  const [generatedEbooks, setGeneratedEbooks] = useState<any[]>([]);
  const [evaluating, setEvaluating] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('gemini2026_topic', topic);
  }, [topic]);

  const downloadPDF = (ebook: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(ebook.title, 20, 20);
    doc.setFontSize(12);
    doc.text(ebook.outline, 20, 40);
    doc.text(ebook.script, 20, 80);
    doc.save(`${ebook.title.replace(/\s+/g, '_')}.pdf`);
  };

  const evaluateEbook = async (ebook: any) => {
    setEvaluating(ebook.title);
    try {
      const evaluation = await evaluateEbookContent(ebook);
      alert(`Avaliação: ${evaluation.score}/10\nFeedback: ${evaluation.feedback}`);
    } catch (error) {
      alert('Erro ao avaliar ebook.');
    } finally {
      setEvaluating(null);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running) {
      setLogs(prev => [...prev, `[Gemini2026] Starting production for: ${topic}`]);
      interval = setInterval(async () => {
        setLogs(prev => [...prev, '[Gemini2026] Orchestrating new ebook...']);
        try {
          const result = await Gemini2026.runTool('generateEbook', topic);
          setLogs(prev => [...prev, `[Gemini2026] Ebook delivered: ${result.title}`]);
          setGeneratedEbooks(prev => [...prev, result]);
        } catch (error) {
          setLogs(prev => [...prev, `[Gemini2026] Error: ${error}`]);
        }
      }, 10000); // Run every 10 seconds for demonstration
    }
    return () => clearInterval(interval);
  }, [running, topic]);

  return (
    <div className="p-6 bg-white dark:bg-[#141414] rounded-xl shadow-md">
      <h2 className="text-2xl font-serif italic mb-4">Agente Gemini2026: Criativo Autônomo</h2>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg dark:bg-[#1E1E1E] dark:border-white/10"
      />
      <button
        onClick={() => setRunning(!running)}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${running ? 'bg-red-500 text-white' : 'bg-black text-white dark:bg-white dark:text-black'}`}
      >
        {running ? <StopCircle size={18} /> : <Play size={18} />}
        {running ? 'Parar Produção' : 'Iniciar Produção Sem Descanso'}
      </button>
      
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Ebooks Entregues</h3>
        <div className="grid gap-4">
          {generatedEbooks.map((ebook, i) => (
            <div key={i} className="p-4 border rounded-lg flex justify-between items-center dark:border-white/10">
              <span>{ebook.title}</span>
              <div className="flex gap-2">
                <button onClick={() => evaluateEbook(ebook)} className="flex items-center gap-2 text-yellow-500" disabled={evaluating === ebook.title}>
                  {evaluating === ebook.title ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} />} Avaliar
                </button>
                <button onClick={() => downloadPDF(ebook)} className="flex items-center gap-2 text-blue-500">
                  <Download size={18} /> Baixar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-[#1E1E1E] rounded-lg h-48 overflow-y-auto font-mono text-xs">
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
}
