import { useState } from "react";
import { X, BarChart2, Zap, Share2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Ad {
  id: number;
  title: string;
  description: string;
  impressions: string;
  activeSince: string;
}

interface Props {
  ad: Ad;
  onClose: () => void;
}

export default function AdDetailView({ ad, onClose }: Props) {
  const [showToast, setShowToast] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + `/ad/${ad.id}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-[60]"
          >
            <Check size={16} /> Link copiado!
          </motion.div>
        )}
      </AnimatePresence>
      <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl shadow-2xl w-full max-w-2xl border border-black/10 dark:border-white/10 overflow-hidden">
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
          <h2 className="font-serif italic text-2xl dark:text-white">{ad.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full dark:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-[#2A2A2A] rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-600 font-mono">
            AD PREVIEW
          </div>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg">
              <p className="text-xs uppercase font-mono opacity-50 dark:text-white">Métricas de Performance</p>
              <div className="flex justify-between mt-2 dark:text-white">
                <span>Impressões:</span>
                <span className="font-mono font-bold">{ad.impressions}</span>
              </div>
              <div className="flex justify-between mt-1 dark:text-white">
                <span>Ativo desde:</span>
                <span className="font-mono font-bold">{ad.activeSince}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414] rounded-lg flex items-center justify-center gap-2">
                <Zap size={18} /> Remodelar
              </button>
              <button onClick={handleShare} className="p-3 border border-black/10 dark:border-white/10 rounded-lg dark:text-white">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10">
          <p className="font-serif text-lg dark:text-white">{ad.description}</p>
        </div>
      </div>
    </div>
  );
}
