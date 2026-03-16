import React from 'react';

export default function ProfessionalBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-red-900 via-zinc-900 to-black rounded-xl p-6 mb-8 shadow-lg text-white flex items-center justify-between border border-red-500/20">
      <div>
        <h1 className="font-serif italic text-3xl mb-1">Gemini2026 Agent Studio <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full not-italic ml-2">v4.0 - WAR ROOM ACTIVE</span></h1>
        <p className="font-mono text-xs opacity-80 uppercase tracking-wider">Sala de Guerra • Lucro Infinito • VEO Video Preview • NCP Memory</p>
      </div>
      <div className="hidden md:flex gap-4 opacity-50 text-xs font-mono">
        <div className="flex flex-col items-end">
          <span>WAR ROOM: OPERATIONAL</span>
          <span>VEO 3.1: READY</span>
        </div>
      </div>
    </div>
  );
}
