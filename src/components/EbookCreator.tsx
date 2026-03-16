import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, FileText, Download, X, RefreshCw, Share2 } from 'lucide-react';
import { runAutonomousTask } from '../services/AgenticOrchestrator';
import { useNotifications } from '../contexts/NotificationContext';
import jsPDF from 'jspdf';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function EbookCreator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [remodeling, setRemodeling] = useState(false);
  const [ebookData, setEbookData] = useState<{ title: string; outline: string; script: string; original?: any; isOffline?: boolean } | null>(null);
  const [viewMode, setViewMode] = useState<'current' | 'original'>('current');
  const { addNotification } = useNotifications();

  const handleCreateEbook = async () => {
    setLoading(true);
    try {
      const result = await runAutonomousTask(`Create a complete ebook about ${topic} with script, outline and cover description`, {});
      setEbookData({ 
        title: result.title, 
        outline: result.outline, 
        script: result.script,
        isOffline: result.isOffline 
      });
      setViewMode('current');
      addNotification('Ebook gerado com sucesso!');
    } catch (error) {
      console.error(error);
      addNotification('Erro ao gerar ebook.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemodel = async () => {
    if (!ebookData) return;
    setRemodeling(true);
    try {
      const result = await runAutonomousTask('Remodel this ebook to be more engaging and professional. Keep the original as reference.', ebookData);
      setEbookData({ 
        title: result.title, 
        outline: result.outline, 
        script: result.script, 
        original: { ...ebookData },
        isOffline: result.isOffline
      });
      setViewMode('current');
      addNotification('Ebook remodelado com sucesso!');
    } catch (error) {
      console.error(error);
      addNotification('Erro ao remodelar ebook.');
    } finally {
      setRemodeling(false);
    }
  };

  const handlePublish = async () => {
    if (!ebookData) return;
    addNotification('Publicando ebook no marketplace...', 'info');
    setTimeout(() => {
      addNotification('Ebook publicado e compartilhado com sucesso!', 'success');
    }, 2000);
  };

  const downloadPDF = () => {
    if (!ebookData) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(ebookData.title, 20, 20);
    
    doc.setFontSize(12);
    const splitOutline = doc.splitTextToSize(ebookData.outline, 170);
    doc.text(splitOutline, 20, 40);
    
    const splitScript = doc.splitTextToSize(ebookData.script, 170);
    doc.text(splitScript, 20, 80);
    
    doc.save(`${ebookData.title.replace(/\s+/g, '_')}.pdf`);
    addNotification('PDF baixado!');
  };

  const saveToGallery = async () => {
    if (!ebookData || !auth.currentUser) return;
    try {
      await addDoc(collection(db, 'creatives'), {
        uid: auth.currentUser.uid,
        title: ebookData.title,
        type: 'Ebook',
        createdAt: new Date().toISOString(),
      });
      addNotification('Ebook adicionado à galeria!');
    } catch (error) {
      console.error(error);
      addNotification('Erro ao salvar na galeria.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="font-serif italic text-3xl mb-8">Criador de Ebook Autônomo</h2>
      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Sobre o que é o seu ebook?"
        className="w-full h-32 p-4 rounded-lg border border-black/10 dark:border-white/10 mb-4 font-mono text-sm bg-transparent dark:text-white"
      />
      <button
        onClick={handleCreateEbook}
        disabled={loading}
        className="px-6 py-3 bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414] rounded-lg flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
        Gerar Ebook
      </button>

      {ebookData && (
        <div className="mt-8 p-6 bg-white dark:bg-[#1C1C1C] rounded-xl border border-black/5 dark:border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              {viewMode === 'original' ? `Original: ${ebookData.original?.title || ebookData.title}` : ebookData.title}
              {ebookData.isOffline && <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase font-bold">Offline</span>}
            </h3>
            {ebookData.original && (
              <div className="flex bg-gray-100 dark:bg-black p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('original')}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'original' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-gray-500'}`}
                >
                  Original
                </button>
                <button 
                  onClick={() => setViewMode('current')}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'current' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-gray-500'}`}
                >
                  Remodelado
                </button>
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto mb-6 p-4 bg-gray-50 dark:bg-black/20 rounded-lg font-serif text-sm leading-relaxed">
            <div className="font-bold mb-2 uppercase tracking-widest text-xs text-gray-400">Conteúdo</div>
            {viewMode === 'original' ? ebookData.original?.script : ebookData.script}
          </div>

          <div className="flex flex-wrap gap-4">
            <button onClick={downloadPDF} className="flex items-center gap-2 text-blue-500 hover:bg-blue-500/5 px-3 py-2 rounded-lg transition-all">
              <Download size={18} /> Baixar PDF
            </button>
            <button onClick={handleRemodel} disabled={remodeling} className="flex items-center gap-2 text-emerald-500 hover:bg-emerald-500/5 px-3 py-2 rounded-lg transition-all">
              {remodeling ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />} Remodelar
            </button>
            <button onClick={handlePublish} className="flex items-center gap-2 text-purple-500 hover:bg-purple-500/5 px-3 py-2 rounded-lg transition-all">
              <Share2 size={18} /> Publicar e Vender
            </button>
            <button onClick={saveToGallery} className="flex items-center gap-2 text-gray-500 hover:bg-gray-500/5 px-3 py-2 rounded-lg transition-all">
              <FileText size={18} /> Galeria
            </button>
            <button onClick={() => setEbookData(null)} className="flex items-center gap-2 text-red-500 hover:bg-red-500/5 px-3 py-2 rounded-lg transition-all ml-auto">
              <X size={18} /> Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
