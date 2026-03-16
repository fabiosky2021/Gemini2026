import { useState, useEffect } from 'react';
import { Gemini2026 } from '../services/gemini2026Agent';
import { Loader2, ShieldAlert, Brain, Database, Terminal, Zap, Search, ChevronRight } from 'lucide-react';
import ncpMemory from '../data/ncpMemory.json';
import { useNotifications } from '../contexts/NotificationContext';

export default function SpyGeneralDashboard() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [memory, setMemory] = useState(ncpMemory);
  const { addNotification } = useNotifications();

  const runSpyGeneral = async () => {
    if (!topic) return;
    setLoading(true);
    addNotification('Iniciando Missão SPY GERAL: Evolução NCP em curso...', 'info');
    try {
      const data = await Gemini2026.runTool('spyGeneral', topic);
      setResult(data as string);
      addNotification('Memória Autônoma Evoluída!', 'success');
    } catch (error) {
      console.error(error);
      addNotification('Falha na Missão SPY GERAL.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-2xl border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Brain size={120} className="text-emerald-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="text-emerald-500 animate-pulse" size={24} />
            <h2 className="text-3xl font-serif italic text-white">ADS SPY GEMINI2026: AGENTE AUTÔNOMO</h2>
          </div>
          <p className="text-emerald-500/70 font-mono text-xs uppercase tracking-[0.2em] mb-8">
            Tecnologia NCP: Evolução de Memória Autônoma Ativada
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Digite o Nicho para Varredura Profunda..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button 
              onClick={runSpyGeneral}
              disabled={loading || !topic}
              className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-3 hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
              EXECUTAR SPY GERAL
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Resultados */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="bg-white dark:bg-[#141414] border dark:border-white/10 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Terminal size={20} className="text-emerald-500" /> Relatório de Inteligência NCP
              </h3>
              <div className="prose dark:prose-invert max-w-none font-sans text-sm leading-relaxed whitespace-pre-wrap">
                {result}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed dark:border-white/5 rounded-2xl text-gray-500">
              <Search size={48} className="mb-4 opacity-20" />
              <p>Aguardando comando para varredura de mercado...</p>
            </div>
          )}
        </div>

        {/* Painel de Memória NCP */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Database size={16} className="text-emerald-500" /> Repositório de Prompts NCP
            </h3>
            <div className="space-y-3">
              {memory.globalPrompts.map((p) => (
                <div key={p.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-emerald-400">{p.name}</span>
                    <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{p.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-emerald-500 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Zap size={16} /> Histórico Artificial
            </h3>
            <div className="text-[10px] font-mono text-emerald-500/70 space-y-2">
              <div className="flex justify-between border-b border-emerald-500/10 pb-1">
                <span>STATUS:</span>
                <span className="text-emerald-400">EVOLUINDO</span>
              </div>
              <div className="flex justify-between border-b border-emerald-500/10 pb-1">
                <span>MEMÓRIA:</span>
                <span className="text-emerald-400">98.4% SINCRONIZADA</span>
              </div>
              <div className="flex justify-between">
                <span>AGENTE:</span>
                <span className="text-emerald-400">GEMINI 2026 NCP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
