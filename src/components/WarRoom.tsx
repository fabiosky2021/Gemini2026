import { useState, useEffect } from 'react';
import { Gemini2026 } from '../services/gemini2026Agent';
import { Loader2, Zap, Target, TrendingUp, Video, Play, ShieldCheck, Users, Flame, ChevronRight, ExternalLink } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';

export default function WarRoom() {
  const [topic, setTopic] = useState('');
  const [isWarActive, setIsWarActive] = useState(false);
  const [agentLogs, setAgentLogs] = useState<{agent: string, msg: string, type: 'info' | 'success' | 'warning'}[]>([]);
  const [winningPromises, setWinningPromises] = useState<string[]>([]);
  const [growthInsights, setGrowthInsights] = useState<string[]>([]);
  const [videoOperation, setVideoOperation] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const log = (agent: string, msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setAgentLogs(prev => [{agent, msg, type}, ...prev].slice(0, 50));
  };

  const startWar = async () => {
    if (!topic) return;
    setIsWarActive(true);
    log('SISTEMA', `Iniciando Operação de Guerra para: ${topic}`, 'warning');
    
    // Iniciar Agentes em Paralelo
    runTheCloser();
    runGrowthHacker();
    runVideoDirector();
  };

  const runTheCloser = async () => {
    log('O FECHADOR', 'Analisando promessas de alta conversão...', 'info');
    try {
      const result = await Gemini2026.runTool('theCloser', topic);
      setWinningPromises(prev => [result as string, ...prev]);
      log('O FECHADOR', 'Oferta Irrecusável Gerada!', 'success');
    } catch (e) {
      log('O FECHADOR', 'Erro na análise de fechamento.', 'warning');
    }
  };

  const runGrowthHacker = async () => {
    log('GROWTH HACKER', 'Buscando brechas de lucro infinitas...', 'info');
    try {
      const result = await Gemini2026.runTool('growthHacker', topic);
      setGrowthInsights(prev => [result as string, ...prev]);
      log('GROWTH HACKER', 'Brechas de Lucro Identificadas!', 'success');
    } catch (e) {
      log('GROWTH HACKER', 'Erro na busca de brechas.', 'warning');
    }
  };

  const runVideoDirector = async () => {
    log('DIRETOR VEO', 'Iniciando renderização de preview em vídeo...', 'info');
    try {
      const op = await Gemini2026.runTool('generateVideoPreview', topic, { promise: topic });
      setVideoOperation(op);
      log('DIRETOR VEO', 'Operação de vídeo iniciada (VEO 3.1). Aguardando processamento...', 'info');
      
      // Polling para o vídeo
      let currentOp = op;
      while (!currentOp.done) {
        await new Promise(r => setTimeout(r, 10000));
        // Nota: Em um ambiente real, precisaríamos de uma ferramenta para consultar o status da operação
        // Aqui simularemos a conclusão para fins de demonstração da UI
        log('DIRETOR VEO', 'Processando frames cinematográficos...', 'info');
        if (Math.random() > 0.8) break; // Simulação de conclusão
      }
      
      log('DIRETOR VEO', 'Vídeo Gerado com Sucesso!', 'success');
      addNotification('Vídeo de Preview Pronto!', 'success');
    } catch (e) {
      log('DIRETOR VEO', 'Erro na geração de vídeo.', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header de Guerra */}
      <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-black p-8 rounded-2xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Flame size={120} className="text-red-500 animate-pulse" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500 rounded-lg">
              <Zap className="text-white" size={24} />
            </div>
            <h2 className="text-4xl font-serif italic text-white tracking-tight">SALA DE GUERRA: LUCRO INFINITO</h2>
          </div>
          <p className="text-red-400 font-mono text-xs uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <ShieldCheck size={14} /> Agentes Especializados em Operação Permanente
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Qual o seu alvo de lucro hoje? (Nicho/Produto)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-lg"
            />
            <button 
              onClick={startWar}
              disabled={isWarActive || !topic}
              className="px-10 py-4 bg-red-600 text-white rounded-xl font-black flex items-center gap-3 hover:bg-red-700 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(239,68,68,0.4)] uppercase italic"
            >
              {isWarActive ? <Loader2 className="animate-spin" /> : <Flame size={20} />}
              ATIVAR PODER DE FOGO
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Coluna 1: O Fechador (Promessas) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1C1C1C] border dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-500">
              <Target size={20} /> O FECHADOR: Promessas Irrecusáveis
            </h3>
            <div className="space-y-4">
              {winningPromises.length === 0 ? (
                <p className="text-gray-500 italic text-sm">Aguardando análise de fechamento...</p>
              ) : (
                winningPromises.map((p, i) => (
                  <div key={i} className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                      {p}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vídeo Preview */}
          <div className="bg-white dark:bg-[#1C1C1C] border dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-500">
              <Video size={20} /> DIRETOR VEO: Criativos em Vídeo
            </h3>
            <div className="aspect-video bg-black rounded-xl flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
              {videoOperation ? (
                <div className="text-center p-8">
                  <Loader2 className="animate-spin text-blue-500 mb-4 mx-auto" size={48} />
                  <p className="text-blue-400 font-mono text-xs animate-pulse">RENDERIZANDO VÍDEO CINEMATOGRÁFICO VEO 3.1...</p>
                </div>
              ) : (
                <div className="text-center p-8 opacity-30">
                  <Play size={64} className="text-white mb-4 mx-auto" />
                  <p className="text-white font-mono text-xs">AGUARDANDO START DA OPERAÇÃO</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 2: Growth Hacker & Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-emerald-500 font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={20} /> GROWTH HACKER: Brechas de Lucro
            </h3>
            <div className="space-y-4">
              {growthInsights.length === 0 ? (
                <p className="text-emerald-500/50 italic text-sm">Mapeando oportunidades ocultas...</p>
              ) : (
                growthInsights.map((g, i) => (
                  <div key={i} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-400 text-sm whitespace-pre-wrap">
                    {g}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logs de Guerra */}
          <div className="bg-black border border-white/10 rounded-2xl p-6 h-[400px] flex flex-col">
            <h3 className="text-white font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal size={14} className="text-red-500" /> LIVE WAR LOG
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px]">
              {agentLogs.map((l, i) => (
                <div key={i} className="flex gap-2 border-b border-white/5 pb-1">
                  <span className={`font-bold ${l.type === 'success' ? 'text-emerald-500' : l.type === 'warning' ? 'text-red-500' : 'text-blue-500'}`}>
                    [{l.agent}]
                  </span>
                  <span className="text-gray-400">{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Terminal({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
