import { motion, AnimatePresence } from "motion/react";
import { Trophy, X, ArrowRight } from "lucide-react";

interface Props {
  onView: () => void;
  onDismiss: () => void;
}

export default function RankingNotification({ onView, onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="fixed top-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-white dark:bg-[#1C1C1C] border border-black/10 dark:border-white/10 p-4 rounded-xl shadow-lg flex items-center justify-between gap-4 z-50"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
          <Trophy className="text-yellow-600 dark:text-yellow-400" size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold dark:text-white">Novo Ranking: Criativos de Bolos</p>
          <p className="text-xs text-black/60 dark:text-white/60">Veja o que está performando agora.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onView} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors dark:text-white">
          <ArrowRight size={18} />
        </button>
        <button onClick={onDismiss} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors dark:text-white">
          <X size={18} />
        </button>
      </div>
    </motion.div>
  );
}
