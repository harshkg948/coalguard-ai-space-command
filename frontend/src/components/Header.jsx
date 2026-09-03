import React from 'react';
import { ShieldAlert, Radio } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex justify-between items-center border-b border-cyan-900/60 pb-4 mb-6">
      <div className="flex items-center space-x-3">
        <ShieldAlert className="w-8 h-8 text-cyan-400 animate-pulse" />
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">CoalGuard AI // Space Command</h1>
          <p className="text-xs text-cyan-600">Autonomous Mine Safety, Spatial Risk Intelligence & Smart Governance[cite: 1]</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1 px-3 py-1 bg-cyan-950/40 border border-cyan-800/60 rounded">
          <Radio className="w-4 h-4 text-emerald-400 animate-ping" />
          <span className="text-emerald-400">LINK: SECURE (MESH ACTIVE)</span>
        </div>
        <div className="px-3 py-1 bg-red-950/40 border border-red-800/60 rounded text-red-400 font-bold">
          ZONE R02: NON-COMPLIANT[cite: 1]
        </div>
      </div>
    </header>
  );
}