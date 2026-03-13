import { useState, useRef, ChangeEvent } from "react";
import { X, Search, Upload, ZoomIn, ZoomOut, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  currentSelectedUrl?: string | null;
  onSelect: (url: string) => void;
  onClose: () => void;
}

const INITIAL_IMAGES = [
  { url: "https://picsum.photos/seed/cake1/200/200", tags: ["cake", "food"] },
  { url: "https://picsum.photos/seed/cake2/200/200", tags: ["cake", "food"] },
  { url: "https://picsum.photos/seed/cake3/200/200", tags: ["cake", "food"] },
  { url: "https://picsum.photos/seed/cake4/200/200", tags: ["cake", "food"] },
  { url: "https://picsum.photos/seed/kitchen1/200/200", tags: ["kitchen", "home"] },
  { url: "https://picsum.photos/seed/kitchen2/200/200", tags: ["kitchen", "home"] },
];

export default function ImageLibrary({ currentSelectedUrl, onSelect, onClose }: Props) {
  const [images, setImages] = useState(INITIAL_IMAGES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredImages = images.filter((img) =>
    img.tags.some((tag) => tag.includes(searchQuery.toLowerCase()))
  );

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImages((prev) => [...prev, { url, tags: ["user-uploaded"] }]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#1C1C1C] rounded-2xl shadow-2xl w-full max-w-lg border border-black/10 dark:border-white/10 overflow-hidden"
      >
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
          <h3 className="font-serif italic text-lg dark:text-white">Biblioteca de Imagens</h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full dark:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar imagens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
            />
          </div>
          {currentSelectedUrl && (
            <img src={currentSelectedUrl} alt="Selected" className="w-10 h-10 object-cover rounded-lg border border-black/10 dark:border-white/10" referrerPolicy="no-referrer" />
          )}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-[#141414] dark:bg-[#E4E3E0] text-[#E4E3E0] dark:text-[#141414] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Upload size={16} /> Upload
          </button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
        </div>

        <div className="p-6 columns-2 sm:columns-3 gap-4 h-96 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img) => (
              <motion.div
                key={img.url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mb-4 break-inside-avoid"
              >
                <img 
                  src={img.url}
                  alt={img.tags.join(", ")}
                  className="w-full object-cover rounded-xl cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
                  onClick={() => { setSelectedImage(img.url); setZoom(1); }}
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          >
            <div className="relative max-w-4xl w-full flex flex-col items-center gap-4">
              <motion.img
                src={selectedImage}
                animate={{ scale: zoom }}
                className="max-h-[70vh] rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="flex gap-4 bg-white/10 backdrop-blur-md p-2 rounded-full">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 text-white hover:bg-white/20 rounded-full"><ZoomOut size={24} /></button>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-2 text-white hover:bg-white/20 rounded-full"><ZoomIn size={24} /></button>
                <button onClick={() => { onSelect(selectedImage); onClose(); }} className="p-2 text-white hover:bg-green-500/20 rounded-full"><Check size={24} /></button>
                <button onClick={() => setSelectedImage(null)} className="p-2 text-white hover:bg-red-500/20 rounded-full"><X size={24} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
