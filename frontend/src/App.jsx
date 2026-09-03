import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Cpu, Sliders, Radio, RefreshCw, Layers, Database, FileText, CheckCircle2, Globe } from 'lucide-react';
import GeoViewDashboard from './components/GeoViewDashboard';
import OfflineSyncStatus from './components/OfflineSyncStatus';
import AuditComplianceView from './components/AuditComplianceView';
import LiveTelemetryStream from './components/LiveTelemetryStream';
import axios from 'axios';

export default function CoalGuardCommandCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [pitDepth, setPitDepth] = useState(245.0);
  const [workerDensity, setWorkerDensity] = useState(180);
  const [equipmentAge, setEquipmentAge] = useState(15.5);
  const [pendingViolations, setPendingViolations] = useState(4);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeEventMeta, setActiveEventMeta] = useState(null);

  // Poll backend global state continuously so Offline Push, GIS, Telemetry & Audit sync instantly
  const fetchLiveCommandState = async () => {
    try {
      const response = await axios.get('/api/v1/sync/command-state');
      if (response.data) {
        const data = response.data;
        setPitDepth(data.pit_depth);
        setWorkerDensity(data.worker_density);
        setEquipmentAge(data.equipment_age);
        setPendingViolations(data.pending_violations);
        setActiveEventMeta(data);

        setSimulationResult({
          simulated_risk_score: data.risk_score,
          risk_classification: data.risk_level,
          dgms_code: data.dgms_code,
          predicted_deformation_velocity_mm_h: data.deformation_velocity,
          affected_area_sq_m: data.affected_area,
          triggered_cluster_nodes: data.triggered_nodes,
          shap_attributions: data.xai_breakdown.feature_names.map((name, idx) => ({
            feature: name,
            impact: data.xai_breakdown.impacts[idx],
            color: idx === 0 ? "bg-red-500" : (idx === 1 ? "bg-amber-500" : "bg-blue-500"),
            description: `Google Earth Engine & Spatial Telemetry Weight for ${name}`
          }))
        });
      }
    } catch (err) {
      console.error("Global state fetch error:", err);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/sync/offline-queue', {
        event_id: `SIM-EVT-${Math.floor(Math.random() * 90000 + 10000)}`,
        pit_depth: pitDepth,
        worker_density: workerDensity,
        equipment_age: equipmentAge,
        pending_violations: pendingViolations,
        hazard_type: "Manual Scenario Control Simulation"
      });
      if (res.data) {
        await fetchLiveCommandState();
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCommandState();
    const interval = setInterval(fetchLiveCommandState, 2500); // Live polling loop
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 space-y-6 selection:bg-blue-600 selection:text-white">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-600/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase">CoalGuard AI // Space Command</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" /> Google Earth Engine & DGMS Smart Governance Engine Active
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'overview', label: 'Command Overview', icon: Activity },
            { id: 'telemetry', label: 'IoT Telemetry', icon: Radio },
            { id: 'xai', label: 'Explainable AI', icon: Cpu },
            { id: 'gis', label: 'GIS & GEE Mesh', icon: Layers },
            { id: 'offline', label: 'Offline Hub', icon: Database },
            { id: 'audit', label: 'Audit Trail', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Emergency Critical Safety Warning Banner (Triggers automatically when Risk > 7.0) */}
      {simulationResult && simulationResult.simulated_risk_score > 7.0 && (
        <div className="max-w-7xl mx-auto bg-red-950/80 border-2 border-red-500/80 p-4 rounded-xl flex items-center justify-between shadow-lg shadow-red-900/30 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600 rounded-lg text-white font-bold">
              <ShieldAlert className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">CRITICAL SAFETY WARNING // DGMS PROTOCOL ACTIVATED</h2>
              <p className="text-xs text-red-200">Risk score exceeded safe threshold ({simulationResult.simulated_risk_score}/10). Immediate evacuation & slope stabilization protocol enforced.</p>
            </div>
          </div>
          <span className="text-xs bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg border border-red-400 uppercase font-mono">
            {simulationResult.dgms_code || 'SEC-44-B-VIOLATION'}
          </span>
        </div>
      )}

      <main className="max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <GeoViewDashboard eventMeta={activeEventMeta} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-5 shadow-xl">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Predictive Scenario Controls</h2>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-400 flex justify-between mb-1">
                      <span>PIT DEPTH</span>
                      <span className="text-white font-mono">{pitDepth}m</span>
                    </label>
                    <input type="range" min="50" max="400" step="5" value={pitDepth} onChange={(e) => setPitDepth(parseFloat(e.target.value))} className="w-full accent-blue-600 bg-slate-950 cursor-pointer" />
                  </div>

                  <div>
                    <label className="text-slate-400 flex justify-between mb-1">
                      <span>WORKER HEADCOUNT</span>
                      <span className="text-white font-mono">{workerDensity}</span>
                    </label>
                    <input type="range" min="10" max="500" step="10" value={workerDensity} onChange={(e) => setWorkerDensity(parseInt(e.target.value))} className="w-full accent-blue-600 bg-slate-950 cursor-pointer" />
                  </div>

                  <div>
                    <label className="text-slate-400 flex justify-between mb-1">
                      <span>HEAVY EQUIPMENT AGE</span>
                      <span className="text-white font-mono">{equipmentAge} yrs</span>
                    </label>
                    <input type="range" min="1" max="30" step="0.5" value={equipmentAge} onChange={(e) => setEquipmentAge(parseFloat(e.target.value))} className="w-full accent-blue-600 bg-slate-950 cursor-pointer" />
                  </div>

                  <div>
                    <label className="text-slate-400 flex justify-between mb-1">
                      <span>PENDING AUDIT VIOLATIONS</span>
                      <span className="text-white font-mono">{pendingViolations}</span>
                    </label>
                    <input type="range" min="0" max="20" step="1" value={pendingViolations} onChange={(e) => setPendingViolations(parseInt(e.target.value))} className="w-full accent-blue-600 bg-slate-950 cursor-pointer" />
                  </div>

                  <button 
                    onClick={runSimulation}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg uppercase tracking-wider text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'Evaluating Model...' : 'Execute Simulation'}</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span>Real-Time Model Inference & Risk Matrix</span>
                    </h3>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/25 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live Backend Synced
                    </span>
                  </div>

                  {simulationResult && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-slate-400 uppercase text-[10px] font-medium">Risk Assessment Score</span>
                        <div className="text-3xl font-black text-white my-3 font-mono">
                          {simulationResult.simulated_risk_score} <span className="text-xs font-normal text-slate-400">/ 10</span>
                        </div>
                        <span className="text-[10px] text-red-400 font-semibold bg-red-500/10 px-2 py-1 rounded w-max border border-red-500/20">
                          {simulationResult.risk_classification}
                        </span>
                      </div>

                      <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-slate-400 uppercase text-[10px] font-medium">Deformation Velocity</span>
                        <div className="text-2xl font-bold text-white my-3 font-mono">
                          {simulationResult.predicted_deformation_velocity_mm_h} <span className="text-xs font-normal text-slate-400">mm/h</span>
                        </div>
                        <span className="text-[10px] text-slate-300">Impact Zone: {simulationResult.affected_area_sq_m} sq m</span>
                      </div>

                      <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-slate-400 uppercase text-[10px] font-medium">Mesh Node Clusters</span>
                        <div className="text-xs font-bold text-white my-2 flex flex-wrap gap-1 max-h-16 overflow-y-auto font-mono">
                          {simulationResult.triggered_cluster_nodes?.map(node => (
                            <span key={node} className="bg-slate-900 text-blue-400 px-2 py-0.5 rounded text-[10px] border border-slate-800">
                              {node}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono">Code: {simulationResult.dgms_code}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && <LiveTelemetryStream eventMeta={activeEventMeta} />}
        
        {activeTab === 'xai' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <Cpu className="w-5 h-5 text-blue-400" />
                <div>
                  <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Explainable AI (SHAP) Workspace</h2>
                  <p className="text-xs text-slate-400">Transparent feature attributions resolving model opacity</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 rounded-lg font-medium">
                TreeExplainer Active
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {simulationResult?.shap_attributions?.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between font-semibold text-white">
                    <span>{item.feature}</span>
                    <span className="text-blue-400 font-mono">+{item.impact}% Weight</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full transition-all duration-500 rounded-full`} style={{ width: `${Math.min(100, item.impact * 2.2)}%` }}></div>
                  </div>
                  <p className="text-slate-400 text-[11px]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gis' && <GeoViewDashboard eventMeta={activeEventMeta} />}
        {activeTab === 'offline' && <OfflineSyncStatus />}
        {activeTab === 'audit' && <AuditComplianceView eventMeta={activeEventMeta} />}
      </main>
    </div>
  );
}