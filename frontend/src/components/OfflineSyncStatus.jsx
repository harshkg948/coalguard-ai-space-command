import React, { useState, useEffect } from 'react';
import { Database, Wifi, Send, Smartphone, Sliders, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { getQueuedHazardLogs } from '../services/db';
import { syncOfflineEventQueue } from '../services/api';

export default function OfflineSyncStatus() {
  const [queuedLogs, setQueuedLogs] = useState([]);
  const [sampleMines, setSampleMines] = useState([]);
  const [selectedMineId, setSelectedMineId] = useState('IND_MINE_0001');
  const [zoneId, setZoneId] = useState('JHARKHAND-NORTH-01');
  const [inspectorId, setInspectorId] = useState('INS-409');
  const [pitDepth, setPitDepth] = useState(280.0);
  const [workerDensity, setWorkerDensity] = useState(210);
  const [equipmentAge, setEquipmentAge] = useState(18.0);
  const [pendingViolations, setPendingViolations] = useState(6);
  const [hazardType, setHazardType] = useState('Rock Deformation & Slope Shear');
  const [severity, setSeverity] = useState('CRITICAL');
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    loadQueuedLogs();
    fetchMinesList();
  }, []);

  const fetchMinesList = async () => {
    try {
      const res = await axios.get('/api/v1/sync/mines/sample');
      if (res.data && res.data.length > 0) {
        setSampleMines(res.data);
      }
    } catch (err) {
      console.error("Could not fetch mines list:", err);
    }
  };

  const loadQueuedLogs = async () => {
    try {
      const logs = await getQueuedHazardLogs();
      setQueuedLogs(logs || []);
    } catch (err) {
      console.error("IndexedDB error:", err);
    }
  };

  const handleLocalLogSubmit = async (e) => {
    e.preventDefault();
    const inspectionPayload = {
      event_id: selectedMineId,
      local_timestamp: new Date().toISOString(),
      inspector_id: inspectorId,
      zone_id: zoneId,
      pit_depth: pitDepth,
      worker_density: workerDensity,
      equipment_age: equipmentAge,
      pending_violations: pendingViolations,
      hazard_type: hazardType,
      severity: severity,
      sync_status: "PENDING_HEADQUARTERS_UPLOAD"
    };

    const { saveOfflineHazardLog } = await import('../services/db');
    await saveOfflineHazardLog(inspectionPayload);
    await loadQueuedLogs();
    setSyncStatus(`Inspection captured locally for ${selectedMineId} (IndexedDB PWA).`);
  };

  const handleSyncToServer = async () => {
    try {
      for (const log of queuedLogs) {
        await syncOfflineEventQueue({
          event_id: log.event_id,
          local_timestamp: log.local_timestamp,
          zone_id: log.zone_id,
          hazard_type: log.hazard_type,
          severity: log.severity,
          pit_depth: log.pit_depth || 280.0,
          worker_density: log.worker_density || 210,
          equipment_age: log.equipment_age || 18.0,
          pending_violations: log.pending_violations || 6
        });
      }

      indexedDB.deleteDatabase("CoalGuardOfflineDB");
      setQueuedLogs([]);
      setSyncStatus("SUCCESS: Real mine field telemetry synced to HQ & NetworkX Graph updated!");

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error("Sync error:", err);
      setSyncStatus("Sync failed: Check backend connection.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-200">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Offline Inspector Terminal (Real Mine Grounded)</h2>
            <p className="text-xs text-slate-400">Zero-connectivity underground data capture mapped to Indian Coal Mines dataset</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Wifi className="w-4 h-4" />
          <span>HQ Link Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleLocalLogSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-lg">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" /> Select Mine & Field Telemetry
            </span>
            <span className="text-xs text-slate-400">ID: {inspectorId}</span>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Select Target Mine (from CSV Dataset)</label>
            <select 
              value={selectedMineId} 
              onChange={(e) => {
                setSelectedMineId(e.target.value);
                setZoneId(`ZONE-${e.target.value}`);
              }} 
              className="w-full bg-slate-950 border border-slate-800 p-2.5 text-xs text-white rounded-lg focus:border-blue-500 outline-none font-mono"
            >
              {sampleMines.length === 0 ? (
                <option value="IND_MINE_0001">IND_MINE_0001 (Default)</option>
              ) : (
                sampleMines.map(m => (
                  <option key={m.mine_id} value={m.mine_id}>
                    {m.mine_id} — {m.state} ({m.mine_type}, Compliance: {m.compliance_rate}%)
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Zone Identifier</label>
              <input type="text" value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 text-white rounded-lg focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Inspector ID</label>
              <input type="text" value={inspectorId} onChange={(e) => setInspectorId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 text-white rounded-lg focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Pit Depth</span>
                <span className="text-white font-mono">{pitDepth}m</span>
              </div>
              <input type="range" min="50" max="400" step="5" value={pitDepth} onChange={(e) => setPitDepth(parseFloat(e.target.value))} className="w-full accent-blue-600 bg-slate-950 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Worker Density</span>
                <span className="text-white font-mono">{workerDensity}</span>
              </div>
              <input type="range" min="10" max="500" step="10" value={workerDensity} onChange={(e) => setWorkerDensity(parseInt(e.target.value))} className="w-full accent-blue-600 bg-slate-950 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Heavy Equipment Age</span>
                <span className="text-white font-mono">{equipmentAge} yrs</span>
              </div>
              <input type="range" min="1" max="30" step="0.5" value={equipmentAge} onChange={(e) => setEquipmentAge(parseFloat(e.target.value))} className="w-full accent-blue-600 bg-slate-950 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Pending Audit Violations</span>
                <span className="text-white font-mono">{pendingViolations}</span>
              </div>
              <input type="range" min="0" max="20" step="1" value={pendingViolations} onChange={(e) => setPendingViolations(parseInt(e.target.value))} className="w-full accent-blue-600 bg-slate-950 cursor-pointer" />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Observed Hazard Classification</label>
            <select value={hazardType} onChange={(e) => setHazardType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 text-xs text-white rounded-lg focus:border-blue-500 outline-none">
              <option value="Rock Deformation & Slope Shear">Rock Deformation & Slope Shear</option>
              <option value="Severe Water Seepage">Severe Water Seepage</option>
              <option value="Methane Gas Pocket Accumulation">Methane Gas Pocket Accumulation</option>
            </select>
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-all shadow-lg shadow-blue-600/20 cursor-pointer">
            Store Inspection Locally (IndexedDB PWA)
          </button>
        </form>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <span className="text-sm font-semibold text-white">Headquarters Sync Queue ({queuedLogs.length})</span>
              <span className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/20 text-[10px] font-medium">IndexedDB Secured</span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {queuedLogs.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Database className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-500 italic">No pending logs. Local storage is fully synchronized.</p>
                </div>
              ) : (
                queuedLogs.map(log => (
                  <div key={log.event_id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">Mine: {log.event_id}</span>
                      <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/25 font-medium">{log.severity}</span>
                    </div>
                    <p className="text-slate-400">{log.hazard_type}</p>
                    <div className="text-[10px] text-slate-500 flex gap-4">
                      <span>Depth: {log.pit_depth}m</span>
                      <span>Workers: {log.worker_density}</span>
                      <span>Violations: {log.pending_violations}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <button 
              onClick={handleSyncToServer}
              disabled={queuedLogs.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 text-xs transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Push Real Mine Data to Headquarters Server</span>
            </button>
            {syncStatus && <p className="text-xs text-emerald-400 text-center font-medium bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">{syncStatus}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}