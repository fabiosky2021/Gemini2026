import { useState } from "react";
import { X, BarChart2, Zap, Share2, Check, Loader2, Sparkles, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Gemini2026 } from "../services/gemini2026Agent";
import { jsPDF } from "jspdf";

interface Ad {
  id: number;
  title: string;
  description: string;
  impressions: string;
  activeSince: string;
}

interface Props {
  ad: Ad;
  onClose: () => void;
}

export default function AdDetailView({ ad, onClose }: Props) {
  const [showToast, setShowToast] = useState(false);
  const [isRemodeling, setIsRemodeling] = useState(false);
  const [remodelResult, setRemodelResult] = useState<any>(null);

  const handleShare = () => {
    const content = remodelResult ? `Confira este Criativo Remodelado: ${remodelResult.title}\n\n${remodelResult.script}` : `Confira este Anúncio: ${ad.title}\n\n${ad.description}`;
    navigator.clipboard.writeText(content);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const downloadRemodeledPDF = () => {
    if (!remodelResult) return;
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxLineWidth = pageWidth - margin * 2;
      
      // Title
      doc.setFontSize(22);
      doc.setTextColor(0, 100, 0); // Dark green
      doc.text(remodelResult.title, margin, 30);
      
      // Content
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const splitText = doc.splitTextToSize(remodelResult.script, maxLineWidth);
      
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
      
      doc.save(`${remodelResult.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Falha ao gerar PDF. Tente copiar o texto manualmente.");
    }
  };

  const handleRemodel = async () => {
    setIsRemodeling(true);
    try {
      const result = await Gemini2026.runTool('remodelEbook', ad.title, { title: ad.title, script: ad.description });
      setRemodelResult(result);
    } catch (error) {
      console.error("Erro ao remodelar:", error);
      alert("Erro ao conectar com a IA para remodelagem.");
    } finally {
      setIsRemodeling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-[60]"
          >
            <Check size={16} /> Link copiado!
          </motion.div>
        )}
      </AnimatePresence>
      <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl shadow-2xl w-full max-w-3xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#1C1C1C] sticky top-0 z-10">
          <h2 className="font-serif italic text-2xl dark:text-white">{ad.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full dark:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="h-64 bg-gray-200 dark:bg-[#2A2A2A] rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-600 font-mono relative overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${ad.title}/600/400`} 
                alt={ad.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-50"
                referrerPolicy="no-referrer"
              />
              <span className="relative z-10 bg-black/50 px-4 py-2 rounded text-white">AD PREVIEW</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                <p className="text-xs uppercase font-mono opacity-50 dark:text-white">Métricas de Performance</p>
                <div className="flex justify-between mt-2 dark:text-white">
                  <span>Impressões:</span>
                  <span className="font-mono font-bold text-emerald-500">{ad.impressions}</span>
                </div>
                <div className="flex justify-between mt-1 dark:text-white">
                  <span>Ativo desde:</span>
                  <span className="font-mono font-bold">{ad.activeSince}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleRemodel}
                  disabled={isRemodeling}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {isRemodeling ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Remodelar com IA 2026
                </button>
                <button onClick={handleShare} className="p-3 border border-black/10 dark:border-white/10 rounded-lg dark:text-white hover:bg-black/5 dark:hover:bg-white/5">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 mb-6">
            <h4 className="text-xs font-mono uppercase opacity-50 mb-2 dark:text-white">Copy Original</h4>
            <p className="font-serif text-lg dark:text-white leading-relaxed">{ad.description}</p>
          </div>

          <AnimatePresence>
            {remodelResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-500/30"
              >
                <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                  <Sparkles size={20} />
                  <h4 className="font-bold uppercase text-sm tracking-widest">Versão Remodelada (IA Gemini 2026)</h4>
                </div>
                <h5 className="text-xl font-bold mb-2 dark:text-white">{remodelResult.title}</h5>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {remodelResult.script}
                  </p>
                </div>
                <div className="mt-6 flex gap-3">
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors">
                    Usar este Criativo
                  </button>
                  <button 
                    onClick={downloadRemodeledPDF}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Download size={16} /> Baixar PDF
                  </button>
                  <button className="px-4 py-2 border border-emerald-600/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-500/10 transition-colors">
                    Salvar na Galeria
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
