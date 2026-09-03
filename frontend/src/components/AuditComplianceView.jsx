import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Table } from 'lucide-react';

export default function AuditComplianceView({ eventMeta }) {
  const [downloadingMd, setDownloadingMd] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [reportGenerated, setReportGenerated] = useState('');

  const eventId = eventMeta?.active_event || 'INIT-AUDIT-001';
  const zoneId = eventMeta?.zone_id || 'ZONE-ALPHA-04';
  const dgmsCode = eventMeta?.dgms_code || 'SEC-44-B-SLOPE-INSTABILITY';
  const status = eventMeta?.compliance_status || 'CRITICAL_NON_COMPLIANT';
  const violations = eventMeta?.pending_violations ?? 4;
  const riskScore = eventMeta?.risk_score || 7.4;

  const handleGenerateMarkdown = () => {
    setDownloadingMd(true);
    setTimeout(() => {
      setDownloadingMd(false);
      setReportGenerated('Markdown');

      const reportContent = `
==================================================
COALGUARD AI // OFFICIAL DGMS COMPLIANCE AUDIT REPORT
==================================================
Generated Timestamp: ${new Date().toISOString()}
Monitored Zone: ${zoneId}
Reference Event ID: ${eventId}
--------------------------------------------------
COMPLIANCE METRICS:
- Risk Assessment Score: ${riskScore} / 10
- DGMS Regulation Code: ${dgmsCode}
- Governance Status: ${status}
- Accumulated Audit Violations: ${violations}
--------------------------------------------------
SAFETY PROTOCOL DIRECTIVE:
${riskScore > 7.0 ? 'CRITICAL ALERT: Immediate slope stabilization and underground evacuation enforced under DGMS safety bylaws.' : 'System nominal. Routine geotechnical monitoring active.'}
==================================================
      `.trim();

      const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CoalGuard_DGMS_Audit_Report_${eventId}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  const handleGenerateCsv = () => {
    setDownloadingCsv(true);
    setTimeout(() => {
      setDownloadingCsv(false);
      setReportGenerated('CSV');

      // CSV Header and Row structure for Excel/Spreadsheet compatibility
      const csvContent = [
        "Event_ID,Zone_ID,Timestamp,Risk_Score,Compliance_Status,DGMS_Code,Pending_Violations,Directive_Status",
        `"${eventId}","${zoneId}","${new Date().toISOString()}","${riskScore}","${status}","${dgmsCode}","${violations}","${riskScore > 7.0 ? 'EVACUATION_ENFORCED' : 'NOMINAL'}"`
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CoalGuard_Audit_Data_${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-200">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">DGMS Audit Trail & Smart Governance</h2>
            <p className="text-xs text-slate-400">Automated regulatory compliance logging and multi-format report exports</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 font-mono text-xs">
          <button
            onClick={handleGenerateMarkdown}
            disabled={downloadingMd}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center space-x-2 shadow-lg shadow-amber-600/20 cursor-pointer"
          >
            <Download className={`w-4 h-4 ${downloadingMd ? 'animate-bounce' : ''}`} />
            <span>{downloadingMd ? 'Exporting...' : 'Export Markdown'}</span>
          </button>

          <button
            onClick={handleGenerateCsv}
            disabled={downloadingCsv}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center space-x-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Table className={`w-4 h-4 ${downloadingCsv ? 'animate-bounce' : ''}`} />
            <span>{downloadingCsv ? 'Exporting...' : 'Export CSV (Excel)'}</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-5 shadow-xl font-mono text-xs">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <span className="text-sm font-semibold text-white uppercase tracking-wider">Active Regulatory Audit Log</span>
          <span className={`px-3 py-1 rounded border font-bold text-[10px] ${
            status === 'CRITICAL_NON_COMPLIANT' 
              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block uppercase text-[10px]">Event & Location Reference</span>
            <p className="text-white font-bold text-sm">{zoneId} // {eventId}</p>
            <p className="text-slate-400 text-[11px]">Timestamp: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block uppercase text-[10px]">DGMS Statutory Code</span>
            <p className="text-amber-400 font-bold text-sm">{dgmsCode}</p>
            <p className="text-slate-400 text-[11px]">Pending Audit Violations: <span className="text-white font-bold">{violations}</span></p>
          </div>
        </div>

        {reportGenerated && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center space-x-3 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Official Audit Report Successfully Exported as {reportGenerated}!</p>
              <p className="text-[10px] text-emerald-300 mt-0.5">File successfully compiled and downloaded to local machine for regulatory inspection.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}