import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, FileText, Download, BookOpen, Eye, RefreshCw } from 'lucide-react';
import { generateEbookContent } from '../services/openRouterService';
import jsPDF from 'jspdf';

interface EbookData {
  title: string;
  outline: string;
  script: string;
}

export default function EbookCreator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [ebookData, setEbookData] = useState<EbookData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleCreateEbook = async () => {
    if (!topic.trim()) {
      alert('Por favor, insira um tópico para o ebook.');
      return;
    }

    setLoading(true);
    setEbookData(null);
    
    try {
      setLoadingStep('Gerando título...');
      const title = await generateEbookContent(topic, 'title');
      
      setLoadingStep('Criando estrutura...');
      const outline = await generateEbookContent(topic, 'outline');
      
      setLoadingStep('Escrevendo conteúdo...');
      const script = await generateEbookContent(topic, 'script');
      
      setEbookData({ title, outline, script });
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar ebook. Verifique se a chave VITE_OPENROUTER_API_KEY está configurada.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const downloadPDF = () => {
    if (!ebookData) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Função auxiliar para adicionar texto com quebra de linha
    const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      
      yPosition += 5;
    };

    // Capa
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(228, 227, 224);
    doc.setFontSize(32);
    const titleLines = doc.splitTextToSize(ebookData.title, maxWidth);
    const titleY = pageHeight / 2 - (titleLines.length * 16);
    titleLines.forEach((line: string, index: number) => {
      doc.text(line, pageWidth / 2, titleY + (index * 16), { align: 'center' });
    });

    doc.setFontSize(12);
    doc.text('Criado com AdStudio Pro', pageWidth / 2, pageHeight - 30, { align: 'center' });
    doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth / 2, pageHeight - 20, { align: 'center' });

    // Página de sumário
    doc.addPage();
    yPosition = margin;
    
    doc.setTextColor(0, 0, 0);
    addText('SUMÁRIO', 24, true);
    yPosition += 10;
    
    addText(ebookData.outline, 12, false, [60, 60, 60]);

    // Conteúdo
    doc.addPage();
    yPosition = margin;

    const paragraphs = ebookData.script.split('\n\n');
    
    paragraphs.forEach((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return;

      // Detecta títulos de capítulos
      if (trimmed.startsWith('#') || trimmed.match(/^(Capítulo|Chapter|Introdução|Conclusão)/i)) {
        yPosition += 10;
        addText(trimmed.replace(/^#+\s*/, ''), 18, true);
        yPosition += 5;
      } else {
        addText(trimmed, 11, false, [40, 40, 40]);
      }
    });

    // Rodapé em todas as páginas
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`${i - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Salva o PDF
    const safeTitle = ebookData.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 50);
    doc.save(`${safeTitle || 'ebook'}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="font-serif italic text-3xl mb-2">Criador de Ebook Automático</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gere ebooks completos com IA em minutos. Basta descrever o tema.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-black/5 dark:border-white/10 p-6 mb-6">
        <label className="block text-sm font-medium mb-2">Tema do Ebook</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: Guia completo de marketing digital para pequenos negócios em 2024"
          className="w-full h-32 p-4 rounded-xl border border-black/10 dark:border-white/10 font-mono text-sm bg-gray-50 dark:bg-[#252525] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        
        <button
          onClick={handleCreateEbook}
          disabled={loading || !topic.trim()}
          className="mt-4 px-6 py-3 bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414] rounded-xl flex items-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              {loadingStep}
            </>
          ) : (
            <>
              <FileText size={18} />
              Gerar Ebook
            </>
          )}
        </button>
      </div>

      {ebookData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden"
        >
          {/* Header do resultado */}
          <div className="p-6 border-b border-black/5 dark:border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <BookOpen size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{ebookData.title}</h3>
                  <p className="text-sm text-gray-500">Ebook gerado com sucesso</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleCreateEbook}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-[#252525] rounded-lg hover:bg-gray-200 dark:hover:bg-[#303030]"
                >
                  <RefreshCw size={16} /> Regenerar
                </button>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex gap-3">
            <button 
              onClick={downloadPDF} 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Download size={18} /> Baixar PDF
            </button>
            <button 
              onClick={() => setShowPreview(!showPreview)} 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-[#252525] rounded-xl hover:bg-gray-200 dark:hover:bg-[#303030] transition-colors"
            >
              <Eye size={18} /> {showPreview ? 'Ocultar' : 'Visualizar'} Conteúdo
            </button>
          </div>

          {/* Preview do conteúdo */}
          {showPreview && (
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Sumário</h4>
                <div className="bg-gray-50 dark:bg-[#252525] p-4 rounded-xl">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{ebookData.outline}</pre>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Conteúdo</h4>
                <div className="bg-gray-50 dark:bg-[#252525] p-4 rounded-xl">
                  <div className="prose dark:prose-invert max-w-none">
                    {ebookData.script.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-sm mb-3">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
