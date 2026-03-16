import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, ExternalLink, X, Zap, Cpu, WifiOff } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import localKnowledge from '../data/localKnowledge.json';

const QUICK_LINKS = [
  { title: "Facebook Ad Library", url: "https://www.facebook.com/ads/library" },
  { title: "Automação de Atendimento", url: "#" },
  { title: "Gerenciador de Gastos", url: "#" },
];

const SYSTEM_INSTRUCTION = `Você é o Assistente Virtual do "Gemini2026 Agent Studio", uma plataforma completa de criação e automação.
Seu objetivo é ser autônomo, proativo e conhecer profundamente todas as ferramentas disponíveis para ajudar o usuário a desenvolver seus projetos.

O sistema possui as seguintes capacidades:
1. Espionagem (AdDashboard): Monitoramento de anúncios e criativos.
2. Remodelar Criativo (CreativeStudio): Ferramenta para editar e melhorar criativos.
3. Gerador de Imagens (ImageGenerator): Criação de imagens via IA.
4. Galeria de Criativos (CreativeGallery): Armazenamento e organização de criativos.
5. Criar Ebook (EbookCreator): Geração de conteúdo para ebooks.
6. Planejador (Planner): Organização de campanhas e tarefas.
7. Gemini2026 (Orchestrator): Agente autônomo de criação de conteúdo.
8. Chatbot Voz/Texto (WhatsAppChatbot): Automação de atendimento.

Sua função é:
- Sugerir fluxos de trabalho combinando essas ferramentas (ex: "Vamos gerar uma imagem no ImageGenerator, depois criar um ebook sobre o tema e planejar a campanha no Planner?").
- Ajudar o usuário a ter ideias criativas baseadas no que ele está desenvolvendo.
- Explicar como usar cada ferramenta do sistema.
- Ser técnico, focado em ROI, mas também criativo e estratégico.

Seja proativo: se o usuário pedir algo, sugira como ele pode usar outras ferramentas do sistema para potencializar o resultado.`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isEconomyMode, setIsEconomyMode] = useState(true); // Modo econômico por padrão

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user' as const, text: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    try {
      // Limita o contexto para economizar tokens (envia apenas as últimas 4 mensagens)
      const context = newMessages.slice(-4).map(m => `${m.role}: ${m.text}`).join('\n');
      
      const model = isEconomyMode ? "gemini-3-flash-preview" : "gemini-3.1-pro-preview";
      
      const response = await ai.models.generateContent({
        model: model, 
        contents: context,
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      
      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "Sem resposta." }]);
    } catch (error) {
      console.warn("Assistente offline ou erro de conexão. Usando base local.", error);
      const fallback = localKnowledge.products[0];
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `[MODO OFFLINE] Estou com dificuldades de conexão, mas posso te ajudar com informações locais: ${fallback.title} - ${fallback.description}` 
      }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="bg-black dark:bg-white text-white dark:text-black p-4 rounded-full shadow-lg"
        >
          <MessageSquare size={24} />
        </motion.button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1C1C1C] w-80 h-96 rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              Assistente {isEconomyMode ? <Zap size={14} className="text-yellow-500"/> : <Cpu size={14} className="text-blue-500"/>}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setIsEconomyMode(!isEconomyMode)} className="text-xs p-1 rounded bg-gray-200 dark:bg-gray-700">
                {isEconomyMode ? 'Modo Econômico' : 'Modo Performance'}
              </button>
              <button onClick={() => setIsOpen(false)}><X size={18} /></button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === 'user' ? 'text-right text-blue-500' : 'text-left'}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-black/10 dark:border-white/10">
            <div className="flex gap-2 mb-2">
              {QUICK_LINKS.map(link => (
                <a key={link.title} href={link.url} className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded flex items-center gap-1">
                  {link.title} <ExternalLink size={10} />
                </a>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                placeholder="Pergunte algo..."
              />
              <button onClick={handleSend}><Send size={18} /></button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
