import { useState } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Send, X, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { generateContentWithRetry } from "../utils/geminiRetry";

const PARTNER_INSTRUCTION = `Você é o "Parceiro Bot", um colega de trabalho autônomo, inteligente e extremamente ágil.
Sua missão é agilizar o trabalho do usuário, fornecendo soluções diretas, links úteis e ideias práticas.

Suas diretrizes:
1. Seja proativo: não espere o usuário perguntar, sugira melhorias.
2. Seja direto: forneça respostas rápidas e links diretos para ferramentas ou recursos.
3. Seja inteligente: entenda o contexto do projeto e ajude a resolver problemas.
4. Seja um parceiro: aja como um colega de trabalho que quer ver o projeto crescer.

Se o usuário precisar de algo, forneça a solução e o link para a ferramenta ou recurso necessário imediatamente.`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function PartnerBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user' as const, text: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    try {
      const context = newMessages.slice(-4).map(m => `${m.role}: ${m.text}`).join('\n');
      
      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.1-pro-preview", 
        contents: context,
        config: { systemInstruction: PARTNER_INSTRUCTION }
      });
      
      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "Estou aqui para ajudar!" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Erro ao conectar com o parceiro." }]);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg"
        >
          <BrainCircuit size={24} />
        </motion.button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1C1C1C] w-80 h-96 rounded-2xl shadow-2xl border border-blue-500/20 flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-blue-500/20 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
            <h3 className="font-bold flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <BrainCircuit size={18} /> Parceiro Bot
            </h3>
            <button onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === 'user' ? 'text-right text-blue-500' : 'text-left'}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-blue-500/20">
            <div className="flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                placeholder="O que vamos desenrolar hoje?"
              />
              <button onClick={handleSend} className="text-blue-600"><Send size={18} /></button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
