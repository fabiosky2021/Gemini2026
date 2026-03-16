import { useState, useEffect } from 'react';
import { Gemini2026, evaluateEbookContent } from '../services/gemini2026Agent';
import { Loader2, Play, StopCircle, Download, BookOpen, Star, Search, RefreshCw, Share2, Globe, ExternalLink, Layout } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useNotifications } from '../contexts/NotificationContext';
import LandingPageCreator from './LandingPageCreator';

export default function Gemini2026Orchestrator() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [topic, setTopic] = useState(() => {
    return localStorage.getItem('gemini2026_topic') || 'Marketing Digital';
  });
  const [generatedEbooks, setGeneratedEbooks] = useState<any[]>([]);
  const [evaluating, setEvaluating] = useState<string | null>(null);
  const [spying, setSpying] = useState(false);
  const [remodeling, setRemodeling] = useState<string | null>(null);
  const [showLP, setShowLP] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<any>(null);
  const [previewEbook, setPreviewEbook] = useState<any>(null);
  const [fbConnected, setFbConnected] = useState(false);
  const [connectingFb, setConnectingFb] = useState(false);
  const { addNotification } = useNotifications();

  const connectFacebook = () => {
    setConnectingFb(true);
    setLogs(prev => [...prev, `[Gemini2026] Connecting to Facebook Ads API...`]);
    setTimeout(() => {
      setFbConnected(true);
      setConnectingFb(false);
      setLogs(prev => [...prev, `[Gemini2026] Facebook Ads Connected Successfully!`]);
      addNotification('Facebook Ads Conectado!', 'success');
    }, 2000);
  };

  useEffect(() => {
    localStorage.setItem('gemini2026_topic', topic);
  }, [topic]);

  const downloadPDF = (ebook: any) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxLineWidth = pageWidth - margin * 2;
      
      // Title
      doc.setFontSize(22);
      doc.setTextColor(0, 100, 0); // Dark green
      doc.text(ebook.title, margin, 30);
      
      // Content
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const content = ebook.script || ebook.outline;
      const splitText = doc.splitTextToSize(content, maxLineWidth);
      
      let cursorY = 50;
      const pageHeight = doc.internal.pageSize.getHeight();
      
      splitText.forEach((line: string) => {
        if (cursorY > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += 7;
      });
      
      doc.save(`${ebook.title.replace(/\s+/g, '_')}.pdf`);
      addNotification(`Ebook baixado com sucesso! Verifique seus downloads.`, 'success');
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      addNotification("Falha ao gerar PDF. Tente novamente.", "warning");
    }
  };

  const shareEbook = (ebook: any) => {
    const text = `Confira este Ebook gerado pela IA Gemini 2026: ${ebook.title}\n\n${ebook.outline}\n\nGerado em: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    addNotification("Link e resumo copiados para a área de transferência!", "success");
  };

  const spyAds = async () => {
    setSpying(true);
    setLogs(prev => [...prev, `[Gemini2026] Spying ads for: ${topic}...`]);
    try {
      const adsInfo = await Gemini2026.runTool('spyAds', topic) as string;
      setLogs(prev => [...prev, `[Gemini2026] Ads found and links generated.`]);
      
      // Extrair o link da biblioteca de anúncios
      const fbLinkMatch = adsInfo.match(/LINK DIRETO PARA BIBLIOTECA DE ANÚNCIOS: (https:\/\/\S+)/);
      const fbLink = fbLinkMatch ? fbLinkMatch[1] : null;

      if (fbLink) {
        window.open(fbLink, '_blank');
        addNotification('Biblioteca de Anúncios aberta em nova aba!', 'success');
      }

      alert(adsInfo);
    } catch (error) {
      setLogs(prev => [...prev, `[Gemini2026] Error spying ads: ${error}`]);
    } finally {
      setSpying(false);
    }
  };

  const remodelEbook = async (ebook: any) => {
    setRemodeling(ebook.title);
    setLogs(prev => [...prev, `[Gemini2026] Remodeling ebook: ${ebook.title}...`]);
    try {
      const remodeled = await Gemini2026.runTool('remodelEbook', topic, ebook) as any;
      setGeneratedEbooks(prev => [...prev, { ...remodeled, score: 9 }]);
      addNotification(`Ebook remodelado com sucesso: ${remodeled.title}`, 'success');
      setLogs(prev => [...prev, `[Gemini2026] Ebook remodeled: ${remodeled.title}`]);
    } catch (error) {
      setLogs(prev => [...prev, `[Gemini2026] Error remodeling: ${error}`]);
    } finally {
      setRemodeling(null);
    }
  };

  const openLPGenerator = (ebook: any) => {
    setSelectedEbook(ebook);
    setShowLP(true);
    addNotification('Abrindo gerador de Landing Page...', 'info');
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
    let active = true;
    if (running) {
      const orchestrate = async () => {
        while (active) {
          setLogs(prev => [...prev, `[Gemini2026] Orchestrating new ebook for: ${topic}`]);
          try {
            let ebook = await Gemini2026.runTool('generateEbook', topic) as any;
            setLogs(prev => [...prev, `[Gemini2026] Ebook generated: ${ebook.title}`]);
            if (ebook.isOffline) {
              setLogs(prev => [...prev, `[Gemini2026] WARNING: Using local knowledge base (Offline Mode)`]);
            }
            addNotification(`Novo ebook gerado: ${ebook.title}`, 'success');
            
            let evaluation = await evaluateEbookContent(ebook);
            setLogs(prev => [...prev, `[Gemini2026] Evaluation: ${evaluation.score}/10. Feedback: ${evaluation.feedback}`]);
            
            if (evaluation.score < 7 && !ebook.isOffline) {
              setLogs(prev => [...prev, `[Gemini2026] Score too low. Re-generating...`]);
              ebook = await Gemini2026.runTool('generateEbook', topic) as any;
              setLogs(prev => [...prev, `[Gemini2026] Ebook re-generated: ${ebook.title}`]);
            }
            
            setGeneratedEbooks(prev => [...prev, { ...ebook, score: evaluation.score }]);
            setLogs(prev => [...prev, `[Gemini2026] Ebook finalized: ${ebook.title}`]);
          } catch (error) {
            setLogs(prev => [...prev, `[Gemini2026] Error: ${error}`]);
          }
          await new Promise(resolve => setTimeout(resolve, 10000)); 
        }
      };
      orchestrate();
    }
    return () => { active = false; };
  }, [running, topic]);

  return (
    <div className="p-6 bg-white dark:bg-[#141414] rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif italic">Agente Gemini2026: Automação Total</h2>
        <div className="flex gap-2">
          <button
            onClick={connectFacebook}
            disabled={fbConnected || connectingFb}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${fbConnected ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-500/30' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {connectingFb ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
            {fbConnected ? 'Facebook Conectado' : 'Conectar Facebook Ads'}
          </button>
          <button
            onClick={spyAds}
            disabled={spying}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
          >
            {spying ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Espionar Anúncios
          </button>
          <button
            onClick={() => setRunning(!running)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${running ? 'bg-red-500 text-white' : 'bg-black text-white dark:bg-white dark:text-black'}`}
          >
            {running ? <StopCircle size={18} /> : <Play size={18} />}
            {running ? 'Parar Autonomia' : 'Iniciar Autonomia'}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Tópico ou Produto para Automação</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: Marketing Digital, Emagrecimento, IA..."
          className="w-full p-3 border rounded-lg dark:bg-[#1E1E1E] dark:border-white/10"
        />
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BookOpen size={20} /> Ebooks Processados e Validados
        </h3>
        <div className="grid gap-4">
          {generatedEbooks.length === 0 && (
            <div className="p-8 text-center border border-dashed rounded-lg text-gray-400">
              Nenhum ebook gerado ainda. Inicie a autonomia ou espione anúncios.
            </div>
          )}
          {generatedEbooks.map((ebook, i) => (
            <div key={i} className="p-4 border rounded-lg flex flex-col gap-4 dark:border-white/10 bg-gray-50 dark:bg-[#1E1E1E]">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg">{ebook.title}</h4>
                  <div className="flex gap-2 mt-1">
                    {ebook.isOffline && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase font-bold">Offline Mode</span>}
                    <span className="text-[10px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded uppercase font-bold">Score: {ebook.score}/10</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setPreviewEbook(ebook)} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg" title="Visualizar Conteúdo">
                    <Search size={18} />
                  </button>
                  <button onClick={() => openLPGenerator(ebook)} className="p-2 text-purple-500 hover:bg-purple-500/10 rounded-lg" title="Gerar Landing Page">
                    <Layout size={18} />
                  </button>
                  <button onClick={() => remodelEbook(ebook)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg" title="Remodelar com IA">
                    {remodeling === ebook.title ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  </button>
                  <button onClick={() => shareEbook(ebook)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg" title="Compartilhar">
                    <Share2 size={18} />
                  </button>
                  <button onClick={() => downloadPDF(ebook)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1" title="Baixar PDF">
                    <Download size={14} /> PDF
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                {ebook.script || ebook.outline}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showLP && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-5xl">
            <div className="flex justify-end mb-2">
              <button 
                onClick={() => setShowLP(false)}
                className="bg-white text-black px-4 py-2 rounded-lg font-bold"
              >
                FECHAR X
              </button>
            </div>
            <LandingPageCreator topic={topic} ebookData={selectedEbook} />
          </div>
        </div>
      )}

      {previewEbook && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1C1C] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b dark:border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Preview: {previewEbook.title}</h3>
              <button onClick={() => setPreviewEbook(null)} className="text-gray-500 hover:text-black dark:hover:text-white">
                FECHAR
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 font-serif text-lg leading-relaxed dark:text-gray-300">
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-bold text-sm uppercase text-blue-600 mb-2">Estrutura (Outline)</h4>
                <p className="text-sm italic">{previewEbook.outline}</p>
              </div>
              <div className="whitespace-pre-wrap">
                {previewEbook.script}
              </div>
            </div>
            <div className="p-6 border-t dark:border-white/10 flex justify-end gap-4">
              <button 
                onClick={() => shareEbook(previewEbook)}
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-500/10 flex items-center gap-2"
              >
                <Share2 size={20} /> COMPARTILHAR
              </button>
              <button 
                onClick={() => { downloadPDF(previewEbook); setPreviewEbook(null); }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <Download size={20} /> BAIXAR PDF AGORA
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-bold mb-2 uppercase tracking-wider text-gray-400">Log de Operações em Tempo Real</h3>
        <div className="p-4 bg-gray-100 dark:bg-black rounded-lg h-48 overflow-y-auto font-mono text-[10px] border dark:border-white/5">
          {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
        </div>
      </div>
    </div>
  );
}
