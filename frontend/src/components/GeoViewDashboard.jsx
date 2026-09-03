import React, { useState } from 'react';
import { Globe, Layers, GitCommit, Activity, ShieldAlert, MapPin, Grid, Compass } from 'lucide-react';

export default function GeoViewDashboard({ eventMeta }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'radar'

  const currentZone = eventMeta?.zone_id || 'ZONE-ALPHA-04';
  const riskLevel = eventMeta?.risk_level || 'CRITICAL';
  const riskScore = eventMeta?.risk_score || 7.4;
  const pitDepth = eventMeta?.pit_depth || 245.0;
  const deformationVel = eventMeta?.deformation_velocity || 1.2;
  const triggeredNodes = eventMeta?.triggered_nodes || ["R17", "R18", "R19", "R25"];

  // Complete array representing all spatial monitoring nodes across the pit mesh with mock X/Y coordinates for radar plot
  const allNodes = [
    { id: "R01", sector: "Bench North-1", baseline_m: 50, x: 25, y: 15 },
    { id: "R02", sector: "Bench North-2", baseline_m: 65, x: 45, y: 15 },
    { id: "R03", sector: "Bench North-3", baseline_m: 80, x: 65, y: 15 },
    { id: "R04", sector: "Bench North-4", baseline_m: 95, x: 85, y: 15 },
    { id: "R09", sector: "Bench East-1", baseline_m: 110, x: 85, y: 35 },
    { id: "R10", sector: "Bench East-2", baseline_m: 125, x: 85, y: 55 },
    { id: "R11", sector: "Bench East-3", baseline_m: 140, x: 85, y: 75 },
    { id: "R12", sector: "Bench East-4", baseline_m: 155, x: 85, y: 90 },
    { id: "R17", sector: "Shear Zone Alpha", baseline_m: 170, x: 65, y: 75 },
    { id: "R18", sector: "Shear Zone Alpha", baseline_m: 185, x: 50, y: 75 },
    { id: "R19", sector: "Shear Zone Alpha", baseline_m: 200, x: 35, y: 75 },
    { id: "R20", sector: "Bench West-1", baseline_m: 215, x: 15, y: 75 },
    { id: "R24", sector: "Deep Pit Floor", baseline_m: 230, x: 35, y: 50 },
    { id: "R25", sector: "Deep Pit Floor", baseline_m: 245, x: 55, y: 50 },
    { id: "R28", sector: "Sump Perimeter", baseline_m: 260, x: 45, y: 35 },
    { id: "R32", sector: "Haul Road Ramp", baseline_m: 275, x: 15, y: 35 }
  ];

  return (
    <div className="space-y-6">
      {/* Top GEE & Spatial Status Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-xl gap-4 text-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Google Earth Engine (GEE) & Spatial GIS Mesh</h3>
            <p className="text-xs text-slate-400">Active Zone: <span className="text-blue-400 font-mono font-bold">{currentZone}</span> | Max Depth: {pitDepth}m</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
            Velocity: {deformationVel} mm/h
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
            Risk: {riskLevel} ({riskScore}/10)
          </span>
        </div>
      </div>

      {/* NetworkX Spatial Topology Mesh & Node Points Visualisation */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-5 shadow-xl text-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-3 gap-3">
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Layers className="w-4 h-4 text-blue-400" /> NetworkX Spatial Topology & All Node Points Visualisation
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time graph connectivity mapping across 16 primary geotechnical sensors</p>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'radar' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Spatial Radar Map</span>
            </button>
          </div>
        </div>

        {/* CONDITION 1: GRID MATRIX VISUALISATION */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
            {allNodes.map((node) => {
              const isTriggered = triggeredNodes.includes(node.id) || (riskScore > 7.0 && node.baseline_m >= 170);
              return (
                <div 
                  key={node.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between font-mono ${
                    isTriggered 
                      ? 'bg-red-950/40 border-red-500/60 shadow-md shadow-red-500/10 animate-pulse' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold ${isTriggered ? 'text-red-400' : 'text-slate-300'}`}>
                      [{node.id}]
                    </span>
                    <GitCommit className={`w-3.5 h-3.5 ${isTriggered ? 'text-red-400' : 'text-slate-600'}`} />
                  </div>
                  
                  <div className="space-y-1 my-1">
                    <span className="text-[9px] text-slate-400 block truncate">{node.sector}</span>
                    <span className={`text-[11px] font-bold block ${isTriggered ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isTriggered ? 'HIGH SHEAR' : 'NOMINAL'}
                    </span>
                  </div>

                  <div className="text-[9px] text-slate-500 border-t border-slate-800/80 pt-1.5 flex justify-between">
                    <span>Elev: {node.baseline_m}m</span>
                    <span className={isTriggered ? 'text-red-300 font-bold' : 'text-slate-400'}>
                      {isTriggered ? `${(deformationVel * 1.2).toFixed(1)}mm` : '0.1mm'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CONDITION 2: SPATIAL RADAR / SCATTER MAP VISUALISATION */}
        {viewMode === 'radar' && (
          <div className="relative w-full h-80 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden font-mono flex items-center justify-center">
            {/* Background Radar Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-48 h-48 rounded-full border border-blue-500 absolute"></div>
              <div className="w-32 h-32 rounded-full border border-blue-500 absolute"></div>
              <div className="w-16 h-16 rounded-full border border-blue-500 absolute"></div>
              <div className="w-full h-[1px] bg-blue-500 absolute"></div>
              <div className="h-full w-[1px] bg-blue-500 absolute"></div>
            </div>

            {/* Absolute Plotted Nodes representing Pit Topography */}
            <div className="relative w-full h-full">
              {allNodes.map((node) => {
                const isTriggered = triggeredNodes.includes(node.id) || (riskScore > 7.0 && node.baseline_m >= 170);
                return (
                  <div
                    key={node.id}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      isTriggered 
                        ? 'bg-red-600 text-white border-red-400 animate-ping shadow-lg shadow-red-600/50' 
                        : 'bg-slate-900 text-blue-400 border-blue-500/50 hover:scale-125'
                    }`}>
                      {node.id}
                    </div>

                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded border border-slate-700 shadow-xl whitespace-nowrap z-50">
                      <p className="font-bold text-blue-400">{node.id} - {node.sector}</p>
                      <p>Status: {isTriggered ? 'CRITICAL SHEAR' : 'STABLE'}</p>
                      <p>Elevation: {node.baseline_m}m</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
              Interactive 2D Spatial Plane (Hover nodes for telemetry)
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-4 px-1 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Stable Mesh Node
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-ping"></span> Critical Shear / Triggered Node
            </span>
          </div>
          <span className="text-slate-500">Total Active Graph Edges: 48 Connections</span>
        </div>
      </div>
    </div>
  );
}