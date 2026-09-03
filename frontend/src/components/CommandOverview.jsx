import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

export default function CommandOverview() {
  const [commandState, setCommandState] = useState({
    active_event: null,
    pit_depth: 200.0,
    worker_density: 150,
    equipment_age: 8.0,
    pending_violations: 3,
    hazard_type: "Rock Deformation & Slope Shear",
    risk_score: 0.42,
    risk_level: "MODERATE",
    xai_breakdown: {
      base_value: 0.4,
      shap_values: [0.15, -0.02, 0.10, 0.15],
      feature_names: ["pit_depth", "worker_density", "equipment_age", "pending_violations"]
    },
    compliance_status: "MONITORING"
  });

  const fetchLiveState = async () => {
    try {
      const response = await axios.get('/api/v1/sync/command-state');
      if (response.data) {
        setCommandState(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch command overview state:", err);
    }
  };

  useEffect(() => {
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn text-cyan-400 font-mono">
      <div className="bg-[#081120] border border-cyan-900/60 p-5 rounded-lg shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Command Overview & Live Telemetry Hub</span>
          </h2>
          <p className="text-xs text-cyan-600 mt-1">Active Synced Event: {commandState.active_event || 'None (System Nominal)'}</p>
        </div>
        <div className={`px-4 py-2 rounded font-bold text-xs border ${
          commandState.risk_level === 'CRITICAL' ? 'bg-red-950/40 text-red-400 border-red-500' : 'bg-green-950/40 text-green-400 border-green-500'
        }`}>
          RISK LEVEL: {commandState.risk_level} ({Math.round(commandState.risk_score * 100)}%)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#081120] border border-cyan-900/60 p-4 rounded-lg">
          <p className="text-xs text-cyan-600">Pit Depth</p>
          <p className="text-xl font-bold text-white mt-1">{commandState.pit_depth} m</p>
        </div>
        <div className="bg-[#081120] border border-cyan-900/60 p-4 rounded-lg">
          <p className="text-xs text-cyan-600">Worker Density</p>
          <p className="text-xl font-bold text-white mt-1">{commandState.worker_density} units</p>
        </div>
        <div className="bg-[#081120] border border-cyan-900/60 p-4 rounded-lg">
          <p className="text-xs text-cyan-600">Equipment Age</p>
          <p className="text-xl font-bold text-white mt-1">{commandState.equipment_age} yrs</p>
        </div>
        <div className="bg-[#081120] border border-cyan-900/60 p-4 rounded-lg">
          <p className="text-xs text-cyan-600">Pending Violations</p>
          <p className="text-xl font-bold text-red-400 mt-1">{commandState.pending_violations}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#081120] border border-cyan-900/60 p-5 rounded-lg space-y-3">
          <h3 className="text-sm font-bold text-yellow-400 uppercase">Active Hazard Classification</h3>
          <p className="text-base font-bold text-white">{commandState.hazard_type}</p>
          <p className="text-xs text-cyan-500">DGMS Compliance Status: <span className="text-white font-bold">{commandState.compliance_status}</span></p>
        </div>

        <div className="bg-[#081120] border border-cyan-900/60 p-5 rounded-lg space-y-3">
          <h3 className="text-sm font-bold text-purple-400 uppercase flex items-center space-x-2">
            <Cpu className="w-4 h-4" />
            <span>SHAP Explainable AI Breakdown</span>
          </h3>
          <div className="space-y-2 text-xs">
            {commandState.xai_breakdown?.feature_names?.map((name, idx) => (
              <div key={idx} className="flex justify-between items-center bg-cyan-950/30 p-2 rounded border border-cyan-900/40">
                <span className="text-cyan-300">{name}</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {commandState.xai_breakdown.shap_values[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}