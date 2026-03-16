import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FileText, Trash2 } from 'lucide-react';

export default function CreativeGallery() {
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'creatives'), where('uid', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h2 className="font-serif italic text-3xl mb-8">Galeria de Criativos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assets.map(asset => (
          <div key={asset.id} className="p-4 bg-white dark:bg-[#1C1C1C] rounded-xl border border-black/5 dark:border-white/10">
            <FileText className="mb-2 text-emerald-500" />
            <h3 className="font-bold">{asset.title}</h3>
            <p className="text-sm text-gray-500">{asset.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
