import { useEffect } from "react";
import { motion } from "motion/react";
import { Facebook, X, ArrowRight } from "lucide-react";

interface Props {
  onView: () => void;
  onDismiss: () => void;
}

export default function FacebookAdNotification({ onView, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000); // Some após 8 segundos
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="fixed top-20 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-white dark:bg-[#1C1C1C] border border-black/10 dark:border-white/10 p-4 rounded-xl shadow-lg flex items-center justify-between gap-4 z-50 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      onClick={onView}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
          <Facebook className="text-blue-600 dark:text-blue-400" size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold dark:text-white">Novo Criativo: Meta Library</p>
          <p className="text-xs text-black/60 dark:text-white/60">Anúncio de alta performance detectado.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={(e) => { e.stopPropagation(); onDismiss(); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors dark:text-white">
          <X size={18} />
        </button>
      </div>
    </motion.div>
  );
}
