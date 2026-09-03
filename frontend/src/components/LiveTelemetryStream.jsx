import React from 'react';
import { Radio } from 'lucide-react';

export default function LiveTelemetryStream({ eventMeta }) {
  const eventId = eventMeta?.active_event || 'EVT-LIVE-8849';
  const zoneId = eventMeta?.zone_id || 'ZONE-ALPHA-04';
  const hazard = eventMeta?.hazard_type || 'Rock Deformation & Slope Shear';

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-xl text-slate-200">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Live IoT Sensor Telemetry Stream
        </h3>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Streaming Live
        </span>
      </div>
      <div className="space-y-3 text-xs font-mono">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-white font-bold text-sm">{zoneId} // {eventId}</span>
            <p className="text-slate-400 mt-1">{hazard}</p>
          </div>
          <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20 text-[10px] font-bold">
            ACTIVE STREAM
          </span>
        </div>
      </div>
    </div>
  );
}