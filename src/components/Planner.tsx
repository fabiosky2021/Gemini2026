import { useState } from 'react';
import { callOpenRouter } from '../services/openRouterService';

export default function Planner() {
  const [goal, setGoal] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const response = await callOpenRouter([
        { role: 'system', content: 'You are an expert business planner.' },
        { role: 'user', content: `Create a detailed plan and objectives for: ${goal}` }
      ]);
      setPlan(response.choices[0].message.content);
    } catch (error) {
      console.error(error);
      setPlan('Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-[#141414] rounded-xl shadow-md">
      <h2 className="text-2xl font-serif italic mb-4">Planejador de Objetivos</h2>
      <input
        type="text"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Digite seu objetivo..."
        className="w-full p-3 mb-4 border rounded-lg dark:bg-[#1E1E1E] dark:border-white/10"
      />
      <button
        onClick={handleGeneratePlan}
        disabled={loading}
        className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg"
      >
        {loading ? 'Gerando...' : 'Gerar Plano'}
      </button>
      {plan && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-[#1E1E1E] rounded-lg whitespace-pre-wrap">
          {plan}
        </div>
      )}
    </div>
  );
}
