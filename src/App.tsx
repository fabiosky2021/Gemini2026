/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LayoutDashboard, Zap, BookOpen, Target, Bot, Image as ImageIcon, LogOut, Volume2, Mic, ShieldAlert, Flame } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import AdDashboard from './components/AdDashboard';
import CreativeStudio from './components/CreativeStudio';
import EbookCreator from './components/EbookCreator';
import Planner from './components/Planner';
import Gemini2026Orchestrator from './components/Gemini2026Orchestrator';
import ImageGenerator from './components/ImageGenerator';
import RankingNotification from './components/RankingNotification';
import DarkModeToggle from './components/DarkModeToggle';
import FacebookAdNotification from './components/FacebookAdNotification';
import CreativeGallery from './components/CreativeGallery';
import VirtualAssistant from './components/VirtualAssistant';
import WhatsAppChatbot from './components/WhatsAppChatbot';
import { AntonyVoiceGenerator } from './components/AntonyVoiceGenerator';
import ProfessionalBanner from './components/ProfessionalBanner';
import UnifiedWorkspace from './components/UnifiedWorkspace';
import SpyGeneralDashboard from './components/SpyGeneralDashboard';
import WarRoom from './components/WarRoom';
import Login from './components/Login';
import { NotificationProvider } from './contexts/NotificationContext';
import { SocketProvider } from './contexts/SocketContext';

export default function App() {
  return (
    <NotificationProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </NotificationProvider>
  );
}

function AppContent() {
  const [activeView, setActiveView] = useState<'dashboard' | 'studio' | 'ebook' | 'planner' | 'gemini2026' | 'image-gen' | 'gallery' | 'chatbot' | 'workspace' | 'antony-voice' | 'spy-general' | 'war-room'>('workspace');
  const [showNotification, setShowNotification] = useState(true);
  const [showFacebookNotification, setShowFacebookNotification] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowFacebookNotification(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E4E3E0] dark:bg-[#141414]">
        <Login />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] dark:bg-[#141414] text-[#141414] dark:text-[#E4E3E0] font-sans flex transition-colors duration-300">
      <AnimatePresence>
        {showNotification && (
          <div key="ranking-notification">
            <RankingNotification
              onView={() => { setActiveView('dashboard'); setShowNotification(false); }}
              onDismiss={() => setShowNotification(false)}
            />
          </div>
        )}
        {showFacebookNotification && (
          <div key="facebook-notification">
            <FacebookAdNotification
              onView={() => { setActiveView('dashboard'); setShowFacebookNotification(false); }}
              onDismiss={() => setShowFacebookNotification(false)}
            />
          </div>
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <nav className="w-64 border-r border-[#141414]/10 dark:border-[#E4E3E0]/10 p-6 flex flex-col gap-8">
        <h1 className="font-serif italic text-2xl">Gemini2026 Agent Studio</h1>
        <div className="flex flex-col gap-2 flex-grow">
          <button 
            onClick={() => setActiveView('workspace')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'workspace' ? 'bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <LayoutDashboard size={20} /> Workspace Unificado
          </button>
          <button 
            onClick={() => setActiveView('war-room')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'war-room' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <Flame size={20} /> Sala de Guerra (Lucro)
          </button>
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'dashboard' ? 'bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <LayoutDashboard size={20} /> Espionagem
          </button>
          <button 
            onClick={() => setActiveView('spy-general')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'spy-general' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <ShieldAlert size={20} /> Spy General NCP
          </button>
          <button 
            onClick={() => setActiveView('studio')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'studio' ? 'bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <Zap size={20} /> Remodelar Criativo
          </button>
          <button 
            onClick={() => setActiveView('image-gen')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'image-gen' ? 'bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <ImageIcon size={20} /> Gerador de Imagens
          </button>
          <button 
            onClick={() => setActiveView('gallery')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'gallery' ? 'bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <ImageIcon size={20} /> Galeria de Criativos
          </button>
          <button 
            onClick={() => setActiveView('ebook')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'ebook' ? 'bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <BookOpen size={20} /> Criar Ebook
          </button>
          <button 
            onClick={() => setActiveView('planner')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'planner' ? 'bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <Target size={20} /> Planejador
          </button>
          <button 
            onClick={() => setActiveView('gemini2026')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'gemini2026' ? 'bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <Bot size={20} /> Gemini2026
          </button>
          <button 
            onClick={() => setActiveView('chatbot')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'chatbot' ? 'bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <Volume2 size={20} /> Chatbot WhatsApp
          </button>
          <button 
            onClick={() => setActiveView('antony-voice')}
            className={`flex items-center gap-3 p-3 rounded-lg ${activeView === 'antony-voice' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <Mic size={20} /> Voz do Antony
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <DarkModeToggle />
          <button onClick={() => signOut(auth)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
            <LogOut size={20} /> Sair
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <ProfessionalBanner />
        {activeView === 'workspace' ? <UnifiedWorkspace /> :
         activeView === 'war-room' ? <WarRoom /> :
         activeView === 'dashboard' ? <AdDashboard /> : 
         activeView === 'spy-general' ? <SpyGeneralDashboard /> :
         activeView === 'studio' ? <CreativeStudio /> : 
         activeView === 'image-gen' ? <ImageGenerator /> : 
         activeView === 'ebook' ? <EbookCreator /> : 
         activeView === 'planner' ? <Planner /> : 
         activeView === 'gallery' ? <CreativeGallery /> :
         activeView === 'chatbot' ? <WhatsAppChatbot /> :
         activeView === 'antony-voice' ? <AntonyVoiceGenerator /> :
         <Gemini2026Orchestrator />}
      </main>
    </div>
  );
}
