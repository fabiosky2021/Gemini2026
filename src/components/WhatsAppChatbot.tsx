import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Bot, User, Volume2 } from 'lucide-react';

export default function WhatsAppChatbot() {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([
    { text: 'Olá! Como posso ajudar você hoje?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Web Speech API setup
  const recognition = useRef<any>(null);
  const synth = window.speechSynthesis;
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = synth.getVoices();
      // Tentar encontrar uma voz masculina em português brasileiro
      const maleVoice = voices.find(v => 
        v.lang.includes('pt-BR') && 
        (v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('male'))
      ) || voices.find(v => v.lang.includes('pt-BR'));
      setVoice(maleVoice || null);
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.lang = 'pt-BR';
      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speak = async (text: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error("TTS failed");
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio();
      audio.src = audioUrl;
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        // Fallback to browser TTS if audio file fails
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        if (voice) utterance.voice = voice;
        synth.speak(utterance);
      };
      await audio.play().catch(err => {
        console.warn("Autoplay blocked or playback failed:", err);
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        if (voice) utterance.voice = voice;
        synth.speak(utterance);
      });
    } catch (error) {
      console.warn("ElevenLabs TTS error:", error);
      // Fallback to browser TTS if ElevenLabs fails
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      if (voice) utterance.voice = voice;
      synth.speak(utterance);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulação de resposta do bot (integrar com Gemini aqui)
    const botResponse = `Você disse: "${userMessage.text}". Como posso ajudar com isso?`;
    setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    speak(botResponse);
  };

  const toggleListen = () => {
    if (isListening) {
      recognition.current?.stop();
      setIsListening(false);
    } else {
      recognition.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#E5DDD5] dark:bg-[#0b141a] rounded-xl shadow-lg overflow-hidden">
      <div className="bg-[#075E54] dark:bg-[#202c33] p-4 text-white font-bold flex items-center gap-2">
        <Bot size={24} /> Chatbot Gemini2026
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-[#DCF8C6] dark:bg-[#005c4b]' : 'bg-white dark:bg-[#202c33]'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-[#F0F2F5] dark:bg-[#202c33] flex items-center gap-2">
        <button onClick={toggleListen} className={`p-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-200 dark:bg-[#374248]'}`}>
          <Mic size={20} className={isListening ? 'text-white' : ''} />
        </button>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 rounded-lg dark:bg-[#2a3942] dark:text-white"
          placeholder="Digite uma mensagem..."
        />
        <button onClick={handleSend} className="p-2 bg-[#00A884] text-white rounded-full">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
