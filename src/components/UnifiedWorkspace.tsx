import EbookCreator from './EbookCreator';
import CreativeGallery from './CreativeGallery';
import VirtualAssistant from './VirtualAssistant';
import PartnerBot from './PartnerBot';

export default function UnifiedWorkspace() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="lg:col-span-2">
        <EbookCreator />
      </div>
      <div className="bg-white dark:bg-[#1C1C1C] p-6 rounded-xl border border-black/5 dark:border-white/10">
        <h3 className="text-xl font-bold mb-4">Galeria de Ebooks</h3>
        <CreativeGallery />
      </div>
      <PartnerBot />
    </div>
  );
}
