import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp } from 'lucide-react';

interface PopupProps {
  title: string;
  message: string;
  onClose: () => void;
  onClick: () => void;
}

export const CreativityRankingPopup: React.FC<PopupProps> = ({ title, message, onClose, onClick }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
        className="fixed bottom-6 right-6 z-50 bg-white/90 dark:bg-[#1C1C1C]/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-emerald-500/20 cursor-pointer w-72"
        onClick={onClick}
        onAnimationComplete={() => {
          // Auto-fade out after 5 seconds for important info
          setTimeout(onClose, 5000);
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={18} />
            <h4 className="font-bold text-sm uppercase tracking-wider">{title}</h4>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          {message}
        </p>
        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
          Clique para ver <TrendingUp size={10} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
