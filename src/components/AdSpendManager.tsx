import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { DollarSign, Plus, Trash2 } from 'lucide-react';

export default function AdSpendManager() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [newBudget, setNewBudget] = useState({ campaign: '', amount: 0 });

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'budgets'), where('uid', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const addBudget = async () => {
    if (!auth.currentUser || !newBudget.campaign) return;
    await addDoc(collection(db, 'budgets'), {
      uid: auth.currentUser.uid,
      ...newBudget,
      spent: 0,
      createdAt: new Date().toISOString(),
    });
    setNewBudget({ campaign: '', amount: 0 });
  };

  return (
    <div className="p-6">
      <h2 className="font-serif italic text-3xl mb-8">Gerenciador de Orçamento</h2>
      <div className="flex gap-4 mb-8">
        <input 
          type="text" placeholder="Nome da Campanha" 
          value={newBudget.campaign} onChange={(e) => setNewBudget({...newBudget, campaign: e.target.value})}
          className="p-2 rounded border bg-transparent"
        />
        <input 
          type="number" placeholder="Orçamento" 
          value={newBudget.amount} onChange={(e) => setNewBudget({...newBudget, amount: Number(e.target.value)})}
          className="p-2 rounded border bg-transparent"
        />
        <button onClick={addBudget} className="p-2 bg-emerald-500 text-white rounded"><Plus /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map(b => (
          <div key={b.id} className="p-4 bg-white dark:bg-[#1C1C1C] rounded-xl border">
            <h3 className="font-bold">{b.campaign}</h3>
            <p>Orçamento: R$ {b.amount}</p>
            <p>Gasto: R$ {b.spent}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
