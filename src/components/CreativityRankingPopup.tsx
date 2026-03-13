import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp } from 'lucide-react';

interface PopupProps {
  onClose: () => void;
  onClick: () => void;
}

export const CreativityRankingPopup: React.FC<PopupProps> = ({ onClose, onClick }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
        className="fixed bottom-6 right-6 z-50 bg-white dark:bg-[#1C1C1C] p-4 rounded-xl shadow-2xl border border-black/10 dark:border-white/10 cursor-pointer w-80"
        onClick={onClick}
        onAnimationComplete={() => {
          // Auto-fade out after 5 seconds
          setTimeout(onClose, 5000);
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 text-emerald-600">
            <TrendingUp size={20} />
            <h4 className="font-bold">Novo Ranking de Criatividade</h4>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-black">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Veja o que está vendendo agora na Biblioteca de Anúncios.
        </p>
      </motion.div>
    </AnimatePresence>
  );
};
