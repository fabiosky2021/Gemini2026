import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, ExternalLink, X } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const QUICK_LINKS = [
  { title: "Dashboard de Vendas", url: "#" },
  { title: "Biblioteca de Anúncios", url: "#" },
  { title: "Relatório de Parto", url: "#" },
];

// Inicialização do SDK (o GEMINI_API_KEY é injetado automaticamente pela plataforma)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      // Usando o ID do modelo fornecido pelo usuário
      const response = await ai.models.generateContent({
        model: "756315936814219", 
        contents: input,
      });
      
      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "Sem resposta." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Erro ao conectar com o assistente." }]);
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
            <h3 className="font-bold">Assistente Virtual</h3>
            <button onClick={() => setIsOpen(false)}><X size={18} /></button>
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
