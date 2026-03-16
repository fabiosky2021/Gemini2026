import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Loader2, Sparkles, Target } from 'lucide-react';
import AdDetailView from './AdDetailView';
import { CreativityRankingPopup } from './CreativityRankingPopup';
import { getMarketTrends, autonomousRemodel } from '../services/AutonomousAgentService';
import { jsPDF } from 'jspdf';

export default function AdDashboard() {
  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<'impressions' | 'date'>('impressions');
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: '', message: '' });
  const [autonomousProducts, setAutonomousProducts] = useState<any[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const runAutonomousLoop = async () => {
      const trends = await getMarketTrends();
      const products = await Promise.all(trends.map(autonomousRemodel));
      setAutonomousProducts(products);
      
      // Trigger popup only for real AI activity
      if (products.length > 0) {
        setPopupContent({
          title: "IA Gemini 2026 Ativa",
          message: `${products.length} novos produtos de alta conversão minerados agora.`
        });
        setShowPopup(true);
      }
    };
    runAutonomousLoop();
  }, []);

  // ... (restante do código original)

  const bookTopics = [
    { title: "Dominando o React", desc: "Aprenda a construir interfaces modernas e escaláveis com React 18+.", seed: "react" },
    { title: "IA para Criativos", desc: "Como integrar ferramentas de IA no seu fluxo de trabalho de design.", seed: "ai-design" },
    { title: "Marketing de Alta Conversão", desc: "Estratégias comprovadas para transformar cliques em vendas reais.", seed: "marketing" },
    { title: "Design Brutalista", desc: "Explore a estética crua e funcional do design moderno.", seed: "brutalist" },
    { title: "Arquitetura de Sistemas", desc: "Fundamentos para construir aplicações robustas e distribuídas.", seed: "architecture" },
    { title: "UX Writing", desc: "Escreva textos que guiam o usuário e aumentam a conversão.", seed: "ux-writing" },
    { title: "Segredos do Copywriting", desc: "Domine a arte da persuasão através de textos magnéticos.", seed: "copywriting" },
    { title: "Data Visualization", desc: "Transforme dados complexos em insights visuais claros.", seed: "data-viz" },
    { title: "SEO Avançado", desc: "Domine as buscas orgânicas e posicione seu conteúdo no topo.", seed: "seo" },
    { title: "Gestão de Tráfego Pago", desc: "Otimize seus investimentos em anúncios para ROI máximo.", seed: "traffic" },
    { title: "Psicologia do Consumidor", desc: "Entenda o que motiva seu cliente a tomar decisões de compra.", seed: "psychology" },
    { title: "Storytelling para Marcas", desc: "Crie narrativas poderosas que conectam sua marca ao público.", seed: "storytelling" },
    { title: "Design de Landing Pages", desc: "Construa páginas de alta conversão com foco em experiência.", seed: "landing-page" },
    { title: "Email Marketing Estratégico", desc: "Transforme sua lista de contatos em uma máquina de vendas.", seed: "email" },
    { title: "Growth Hacking", desc: "Táticas ágeis para escalar seu negócio de forma sustentável.", seed: "growth" },
    { title: "Branding Pessoal", desc: "Construa uma autoridade forte e reconhecida no mercado.", seed: "branding" }
  ];

  const ads = useMemo(() => Array.from({ length: 20 }, (_, i) => {
    const topic = bookTopics[i % bookTopics.length];
    return {
      id: i + 1,
      title: `Anúncio #${(i + 1).toString().padStart(2, '0')}`,
      description: `Livro: "${topic.title}" - ${topic.desc}`,
      coverSeed: topic.seed,
      impressions: parseFloat((Math.random() * 10).toFixed(1)),
      activeSince: new Date(2026, 0, Math.floor(Math.random() * 30) + 1),
    };
  }), []);

  const sortedAds = useMemo(() => {
    return [...ads].sort((a, b) => {
      if (sortBy === 'impressions') return b.impressions - a.impressions;
      return b.activeSince.getTime() - a.activeSince.getTime();
    });
  }, [ads, sortBy]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < sortedAds.length) {
        setLoading(true);
        setTimeout(() => {
          setVisibleCount(prev => Math.min(prev + 4, sortedAds.length));
          setLoading(false);
        }, 800); // Simula carregamento
      }
    });
    if (node) observer.current.observe(node);
  }, [visibleCount, sortedAds.length]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectFB = () => {
    setIsConnecting(true);
    const query = searchTerm || 'marketing digital';
    const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&q=${encodeURIComponent(query)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered`;
    
    setTimeout(() => {
      window.open(url, '_blank');
      setIsConnecting(false);
      alert("Conectado à Biblioteca de Anúncios do Facebook! Pesquisa aberta em nova aba.");
    }, 1000);
  };

  const filteredAds = useMemo(() => {
    return sortedAds.filter(ad => 
      ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedAds, searchTerm]);

  const generatePDF = (title: string, content: string) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxLineWidth = pageWidth - margin * 2;
      
      doc.setFontSize(22);
      doc.setTextColor(0, 100, 0);
      doc.text(title, margin, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
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
      
      doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  return (
    <div>
      {selectedAd && <AdDetailView ad={{...selectedAd, impressions: `${selectedAd.impressions}M`, activeSince: selectedAd.activeSince.toLocaleDateString()}} onClose={() => setSelectedAd(null)} />}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col">
          <h2 className="font-serif italic text-3xl">Biblioteca de Espionagem ({filteredAds.length})</h2>
          <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mt-1">Análise e Remodelagem de Criativos</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-64">
            <input 
              type="text"
              placeholder="Pesquisar nicho..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#1C1C1C] border border-black/10 dark:border-white/10 rounded-lg px-4 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={handleConnectFB}
              disabled={isConnecting}
              className="flex-1 md:flex-none bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
              Conectar Facebook Ads
            </button>
            <select 
              value={sortBy} 
              onChange={(e) => {
                setSortBy(e.target.value as 'impressions' | 'date');
                setVisibleCount(4);
              }}
              className="bg-white dark:bg-[#1C1C1C] border border-black/10 dark:border-white/10 rounded-lg px-4 py-2 text-sm dark:text-white"
            >
              <option value="impressions">Ordenar por Impressões</option>
              <option value="date">Ordenar por Data de Ativação</option>
            </select>
          </div>
        </div>
      </div>

      {autonomousProducts.length > 0 && (
        <div className="mb-12" id="vitrine-autonoma">
          <h3 className="font-serif italic text-2xl mb-6 flex items-center gap-2">
            <Sparkles className="text-emerald-500" /> Vitrine Autônoma (IA Gemini 2026)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {autonomousProducts.map((prod, i) => (
              <div key={i} className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex flex-col">
                <h4 className="font-bold text-lg mb-2">{prod.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">Preço sugerido: R$ {prod.price.toFixed(2)}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedAd({ id: 999 + i, title: prod.title, description: prod.content, impressions: '9.9', activeSince: new Date() })}
                    className="flex-1 py-2 border border-emerald-600 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-500/10"
                  >
                    Remodelar
                  </button>
                  <button 
                    onClick={() => generatePDF(prod.title, prod.content)}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                  >
                    Baixar PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAds.slice(0, visibleCount).map((ad, index) => (
          <div 
            key={ad.id} 
            ref={index === visibleCount - 1 ? lastElementRef : null}
            onClick={() => setSelectedAd(ad)} 
            className="cursor-pointer bg-white dark:bg-[#1C1C1C] rounded-xl shadow-sm border border-black/5 dark:border-white/10 hover:shadow-lg hover:border-black/20 dark:hover:border-white/20 transition-all overflow-hidden flex flex-col"
          >
            <img 
              src={`https://picsum.photos/seed/${ad.coverSeed}/400/300`} 
              alt={ad.title} 
              className="h-32 w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-mono text-xs uppercase opacity-50 mb-2">{ad.title}</h3>
              <p className="font-serif text-md mb-4 flex-1">{ad.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-mono mb-4">
                <span>{ad.impressions}M Views</span>
                <span>{ad.activeSince.toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedAd(ad); }}
                  className="flex-1 text-sm py-2 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Remodelar
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    const query = ad.description.split('"')[1] || ad.description;
                    const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&q=${encodeURIComponent(query)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered`;
                    window.open(url, '_blank');
                  }}
                  className="flex-1 text-sm py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-1"
                >
                  <Target size={14} /> Espionar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {loading && (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-gray-500" size={32} />
        </div>
      )}
      {showPopup && (
        <CreativityRankingPopup 
          title={popupContent.title}
          message={popupContent.message}
          onClose={() => setShowPopup(false)} 
          onClick={() => {
            setShowPopup(false);
            // Scroll to autonomous section
            const element = document.getElementById('vitrine-autonoma');
            element?.scrollIntoView({ behavior: 'smooth' });
          }} 
        />
      )}
    </div>
  );
}
