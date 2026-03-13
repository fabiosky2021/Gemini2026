import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Zap, TrendingUp } from 'lucide-react';

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-black dark:text-white p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-5xl font-serif italic mb-6">Domine o Mercado Digital</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          O sistema definitivo para criar, automatizar e vender seus e-books com IA.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Zap, title: "Automação Total", desc: "Gere e-books e roteiros em segundos." },
            { icon: TrendingUp, title: "Vendas no Automático", desc: "Anúncios otimizados por IA." },
            { icon: CheckCircle, title: "Leads Qualificados", desc: "Encontre quem quer comprar." }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-gray-50 dark:bg-[#1C1C1C] rounded-xl border border-black/5 dark:border-white/10">
              <feature.icon className="mb-4 text-emerald-600" />
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-black text-white dark:bg-white dark:text-black p-12 rounded-2xl text-center">
          <h2 className="text-3xl font-bold mb-6">Comece sua jornada hoje</h2>
          <button className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors">
            Assinar Plano Mensal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
