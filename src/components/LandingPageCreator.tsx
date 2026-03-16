import { useState } from 'react';
import { Gemini2026 } from '../services/gemini2026Agent';
import { Loader2, Layout, CheckCircle, Play, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

export default function LandingPageCreator({ topic, ebookData }: { topic: string, ebookData?: any }) {
  const [loading, setLoading] = useState(false);
  const [lpData, setLpData] = useState<any>(null);
  const { addNotification } = useNotifications();

  const generateLP = async () => {
    setLoading(true);
    try {
      const data = await Gemini2026.runTool('generateLandingPage', topic, ebookData);
      setLpData(data);
      addNotification('Landing Page gerada com sucesso!', 'success');
    } catch (error) {
      console.error(error);
      addNotification('Erro ao gerar Landing Page.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-[#141414] rounded-xl shadow-md mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif italic flex items-center gap-2">
          <Layout size={24} /> Gerador de Landing Page de Vendas
        </h2>
        <button
          onClick={generateLP}
          disabled={loading || !topic}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          Gerar Página de Vendas Real
        </button>
      </div>

      {lpData ? (
        <div className="border dark:border-white/10 rounded-xl overflow-hidden bg-gray-50 dark:bg-[#0A0A0A]">
          {/* Preview da Landing Page */}
          <div className="p-8 text-center border-b dark:border-white/10 bg-white dark:bg-[#141414]">
            <h1 className="text-4xl font-bold mb-4 text-black dark:text-white leading-tight">{lpData.headline}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">{lpData.subheadline}</p>
            <div className="aspect-video bg-black rounded-xl mb-8 flex items-center justify-center text-white flex-col gap-4">
              <Play size={48} />
              <p className="text-sm font-mono text-gray-500">VSL SCRIPT: {lpData.vsl_script?.substring(0, 50)}...</p>
            </div>
            <button className="px-10 py-4 bg-emerald-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2 mx-auto">
              <ShoppingCart size={24} /> {lpData.cta_text}
            </button>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">O que você vai aprender:</h3>
              <ul className="space-y-4">
                {lpData.benefits?.map((benefit: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={20} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              {lpData.sections?.map((section: any, i: number) => (
                <div key={i}>
                  <h4 className="font-bold text-lg mb-2">{section.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-zinc-900 text-center text-xs text-gray-500">
            Landing Page gerada automaticamente pelo Agente Gemini2026. Pronta para exportar.
          </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed rounded-xl text-gray-400">
          Clique em "Gerar Página de Vendas Real" para criar a estrutura de conversão para o seu ebook.
        </div>
      )}
    </div>
  );
}
