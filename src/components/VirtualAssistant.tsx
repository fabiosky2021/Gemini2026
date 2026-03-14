import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, X, Brain, Trash2, Download, Upload, Settings, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { callOpenRouter } from '../services/openRouterService';
import { memoryService } from '../services/memoryService';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Função para obter voz masculina em português
const getMaleVoice = (): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices();
  
  // Prioridade: vozes masculinas em português
  const malePortugueseVoices = voices.filter(v => 
    (v.lang.includes('pt') || v.lang.includes('PT')) && 
    (v.name.toLowerCase().includes('male') || 
     v.name.toLowerCase().includes('daniel') ||
     v.name.toLowerCase().includes('ricardo') ||
     v.name.toLowerCase().includes('luciano') ||
     v.name.toLowerCase().includes('google') && !v.name.toLowerCase().includes('female'))
  );
  
  if (malePortugueseVoices.length > 0) return malePortugueseVoices[0];
  
  // Fallback: qualquer voz em português
  const portugueseVoices = voices.filter(v => v.lang.includes('pt') || v.lang.includes('PT'));
  if (portugueseVoices.length > 0) return portugueseVoices[0];
  
  // Último fallback: primeira voz disponível
  return voices[0] || null;
};

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
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [maleVoice, setMaleVoice] = useState<SpeechSynthesisVoice | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMemoryStats(memoryService.getStats());
  }, [messages]);

  // Inicializa vozes quando disponíveis
  useEffect(() => {
    const loadVoices = () => {
      const voice = getMaleVoice();
      setMaleVoice(voice);
    };
    
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Inicializa reconhecimento de voz
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Função para falar texto com voz masculina
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !text) return;
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 0.85; // Tom mais grave para voz masculina
    utterance.volume = 1.0;
    
    if (maleVoice) {
      utterance.voice = maleVoice;
    }
    
    speechSynthesis.speak(utterance);
  }, [voiceEnabled, maleVoice]);

  // Função para alternar microfone
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

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
      
      // Fala a resposta com voz masculina
      speak(response);
      
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
                onClick={() => setVoiceEnabled(!voiceEnabled)} 
                className={`p-1 hover:bg-white/10 rounded ${voiceEnabled ? 'text-green-400' : 'text-gray-400'}`}
                title={voiceEnabled ? 'Desativar voz' : 'Ativar voz'}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
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

          {/* Input - Otimizado para digitação e voz */}
          <div className="p-3 border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#1A1A1A]">
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="w-full bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-full px-4 py-3 pr-24"
                  placeholder={isListening ? 'Ouvindo... fale agora' : 'Digite sua mensagem...'}
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={toggleListening}
                    className={`p-2 rounded-full transition-all ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse scale-110' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={isListening ? 'Parar' : 'Falar'}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs text-gray-400">
                {isListening ? 'Gravando...' : 'Enter para enviar'}
              </span>
              {voiceEnabled && (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <Volume2 size={10} /> Voz ativa
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
