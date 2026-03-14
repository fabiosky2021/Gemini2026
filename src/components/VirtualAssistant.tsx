import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, X, Brain, Trash2, Download, Upload, Settings } from 'lucide-react';
import { callOpenRouter } from '../services/openRouterService';
import { memoryService } from '../services/memoryService';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

const SYSTEM_PROMPT = `Você é um assistente virtual inteligente do AdStudio Pro, uma plataforma de criação de anúncios e conteúdo.

Suas capacidades incluem:
- Ajudar com estratégias de marketing e anúncios
- Auxiliar na criação de ebooks e conteúdo
- Dar insights sobre campanhas publicitárias
- Ajudar com planejamento de conteúdo
- Responder dúvidas sobre a plataforma

Você tem memória de longo prazo e pode lembrar de conversas anteriores e preferências do usuário.
Seja sempre útil, conciso e proativo em suas respostas.`;

export default function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [memoryStats, setMemoryStats] = useState(memoryService.getStats());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMemoryStats(memoryService.getStats());
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = { 
      role: 'user', 
      content: input, 
      timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Adiciona à memória
    memoryService.addMemory(`Usuário: ${input}`, 'conversation');

    try {
      // Obtém contexto de memória
      const context = memoryService.getConversationContext(input);
      const memoryContext = memoryService.formatContextForLLM(context);

      // Prepara mensagens para o LLM
      const llmMessages = [
        { role: 'system', content: SYSTEM_PROMPT + (memoryContext ? `\n\n## Contexto da Memória\n${memoryContext}` : '') },
        ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: input }
      ];

      const response = await callOpenRouter(llmMessages, 'anthropic/claude-3.5-sonnet');
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response, 
        timestamp: Date.now() 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Adiciona resposta à memória
      memoryService.addMemory(`Assistente: ${response.substring(0, 200)}...`, 'conversation');
      
    } catch (error) {
      console.error('Error calling OpenRouter:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique se a chave VITE_OPENROUTER_API_KEY está configurada.', 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const clearAllMemory = () => {
    if (confirm('Tem certeza que deseja limpar toda a memória? Esta ação não pode ser desfeita.')) {
      memoryService.clearMemory();
      setMessages([]);
      setMemoryStats(memoryService.getStats());
    }
  };

  const exportMemory = () => {
    const data = memoryService.exportMemory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adstudio-memory-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importMemory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        memoryService.importMemory(content);
        setMemoryStats(memoryService.getStats());
        alert('Memória importada com sucesso!');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414] p-4 rounded-full shadow-lg relative"
        >
          <MessageSquare size={24} />
          {memoryStats.longTermCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              <Brain size={12} />
            </span>
          )}
        </motion.button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-white dark:bg-[#1C1C1C] w-96 h-[500px] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-[#141414] dark:bg-[#0A0A0A] text-white">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-blue-400" />
              <div>
                <h3 className="font-bold text-sm">Assistente Virtual</h3>
                <span className="text-xs text-gray-400">Memória: {memoryStats.longTermCount} entradas</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className="p-1 hover:bg-white/10 rounded"
                title="Configurações"
              >
                <Settings size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-3 bg-gray-100 dark:bg-[#252525] border-b border-black/10 dark:border-white/10 space-y-2">
              <div className="flex gap-2">
                <button 
                  onClick={exportMemory}
                  className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  <Download size={12} /> Exportar
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  <Upload size={12} /> Importar
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".json" 
                  onChange={importMemory} 
                  className="hidden" 
                />
              </div>
              <button 
                onClick={clearAllMemory}
                className="w-full flex items-center justify-center gap-1 text-xs bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                <Trash2 size={12} /> Limpar Toda Memória
              </button>
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                <Brain size={40} className="mx-auto mb-3 opacity-50" />
                <p>Olá! Sou seu assistente com memória infinita.</p>
                <p className="text-xs mt-2">Posso lembrar de nossas conversas anteriores.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-sm' 
                      : 'bg-gray-100 dark:bg-[#252525] text-[#141414] dark:text-[#E4E3E0] rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-[#252525] p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-black/10 dark:border-white/10">
            <div className="flex gap-2 items-end">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                className="flex-1 bg-gray-100 dark:bg-[#252525] border-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl p-3 resize-none max-h-24"
                placeholder="Digite sua mensagem..."
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
