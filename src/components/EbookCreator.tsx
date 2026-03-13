import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, FileText, Download } from 'lucide-react';
import { generateEbookContent } from '../services/openRouterService';
import jsPDF from 'jspdf';

export default function EbookCreator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [ebookData, setEbookData] = useState<{ title: string; outline: string; script: string } | null>(null);

  const handleCreateEbook = async () => {
    setLoading(true);
    try {
      const title = await generateEbookContent(topic, 'title');
      const outline = await generateEbookContent(topic, 'outline');
      const script = await generateEbookContent(topic, 'script');
      setEbookData({ title, outline, script });
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar ebook. Verifique sua chave OpenRouter.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!ebookData) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(ebookData.title, 20, 20);
    doc.setFontSize(12);
    doc.text(ebookData.outline, 20, 40);
    doc.text(ebookData.script, 20, 80);
    doc.save('ebook.pdf');
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="font-serif italic text-3xl mb-8">Criador de Ebook Automático</h2>
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
          <h3 className="text-xl font-bold mb-4">{ebookData.title}</h3>
          <button onClick={downloadPDF} className="flex items-center gap-2 text-blue-500">
            <Download size={18} /> Baixar PDF
          </button>
        </div>
      )}
    </div>
  );
}
