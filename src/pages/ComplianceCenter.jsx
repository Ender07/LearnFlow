import React, { useState, useRef } from 'react';
import { predictiveComplianceEngine } from '@/functions/predictiveComplianceEngine';
import { regulatoryWatchdog } from '@/functions/regulatoryWatchdog';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle, Upload, Brain, CheckCircle, XCircle, Clock, TrendingUp, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const STATUS_CONFIG = {
  compliant: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: CheckCircle },
  needs_review: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: AlertTriangle },
  non_compliant: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
};

export default function ComplianceCenter() {
  const [complianceData, setComplianceData] = useState(null);
  const [watchdogResult, setWatchdogResult] = useState(null);
  const [loadingCompliance, setLoadingCompliance] = useState(false);
  const [loadingWatchdog, setLoadingWatchdog] = useState(false);
  const [regulationName, setRegulationName] = useState('');
  const [activeTab, setActiveTab] = useState('predictive');
  const fileInputRef = useRef(null);

  const runComplianceEngine = async () => {
    setLoadingCompliance(true);
    try {
      const res = await predictiveComplianceEngine({});
      setComplianceData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCompliance(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingWatchdog(true);
    setWatchdogResult(null);
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const res = await regulatoryWatchdog({ file_url: uploadRes.file_url, regulation_name: regulationName || file.name });
      setWatchdogResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWatchdog(false);
    }
  };

  const riskColor = (score) => {
    if (score >= 75) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-[#0f1729] p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Compliance Center</h1>
            <p className="text-slate-400 text-sm">Predictive gap forecasting & autonomous regulatory monitoring</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700 mb-8 w-fit">
        {[
          { id: 'predictive', label: 'Predictive Modeling', icon: TrendingUp },
          { id: 'watchdog', label: 'Regulatory Watchdog', icon: Brain },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Predictive Compliance Tab */}
      {activeTab === 'predictive' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg">Certification Gap Forecast</h2>
              <p className="text-slate-400 text-sm">Scan all certifications expiring within 90 days and auto-assign renewal training</p>
            </div>
            <Button
              onClick={runComplianceEngine}
              disabled={loadingCompliance}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              {loadingCompliance ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
              {loadingCompliance ? 'Analyzing...' : 'Run Forecast'}
            </Button>
          </div>

          {!complianceData && !loadingCompliance && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700">
              <TrendingUp className="w-12 h-12 text-slate-600 mb-4" />
              <div className="text-slate-400 text-sm text-center max-w-sm">
                Run the predictive engine to forecast certification gaps and automatically assign renewal training to at-risk team members.
              </div>
            </div>
          )}

          {complianceData && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'At Risk', value: complianceData.total_at_risk, color: 'text-red-400', icon: AlertTriangle },
                  { label: 'Auto-Assigned', value: complianceData.auto_assigned_count, color: 'text-blue-400', icon: CheckCircle },
                  { label: 'Avg Risk Score', value: `${complianceData.gaps?.[0] ? Math.round(complianceData.gaps.reduce((s, g) => s + g.risk_score, 0) / complianceData.gaps.length) : 0}%`, color: 'text-yellow-400', icon: TrendingUp },
                  { label: 'Processes Scanned', value: complianceData.gaps?.length || 0, color: 'text-green-400', icon: Shield },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-slate-400 text-xs">{stat.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Gap list */}
              {complianceData.gaps?.length > 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-700">
                    <h3 className="text-white font-semibold">Certification Gaps</h3>
                  </div>
                  <div className="divide-y divide-slate-700/50">
                    {complianceData.gaps.map((gap, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-slate-700/20">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {gap.user_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">{gap.user_name}</div>
                            <div className="text-slate-400 text-xs">{gap.certification_title} · {gap.process_title}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-slate-400 text-xs mb-1">Risk Score</div>
                            <div className={`text-sm font-bold ${riskColor(gap.risk_score)}`}>{gap.risk_score}%</div>
                          </div>
                          <div className="text-right">
                            <div className="text-slate-400 text-xs mb-1">Expires</div>
                            <div className={`text-sm font-medium ${gap.days_until_expiry <= 0 ? 'text-red-400' : gap.days_until_expiry <= 30 ? 'text-yellow-400' : 'text-white'}`}>
                              {gap.days_until_expiry <= 0 ? 'Expired' : `${gap.days_until_expiry}d`}
                            </div>
                          </div>
                          <div className="w-16">
                            <Progress value={gap.risk_score} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-green-500/5 border border-green-500/20 rounded-2xl">
                  <CheckCircle className="w-10 h-10 text-green-400 mb-3" />
                  <div className="text-green-400 font-semibold">All certifications are current!</div>
                  <div className="text-slate-400 text-sm">No gaps detected within the next 90 days.</div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Regulatory Watchdog Tab */}
      {activeTab === 'watchdog' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-white font-semibold text-lg">Regulatory Watchdog</h2>
            <p className="text-slate-400 text-sm">Upload a regulation PDF to automatically audit all published processes for compliance</p>
          </div>

          {/* Upload area */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-medium mb-1">Regulation Name (optional)</label>
              <input
                type="text"
                value={regulationName}
                onChange={(e) => setRegulationName(e.target.value)}
                placeholder="e.g. OSHA 1910.147 Lockout/Tagout"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loadingWatchdog}
              className="w-full flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingWatchdog ? (
                <>
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                  <span className="text-blue-400 text-sm font-medium">Analyzing regulation & auditing all processes…</span>
                  <span className="text-slate-500 text-xs">This may take a minute</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-500" />
                  <span className="text-slate-400 text-sm">Click to upload regulation document</span>
                  <span className="text-slate-600 text-xs">PDF, DOC, DOCX, or TXT</span>
                </>
              )}
            </button>
          </div>

          {/* Watchdog results */}
          {watchdogResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Requirements Found', value: watchdogResult.requirements_extracted, color: 'text-blue-400' },
                  { label: 'Processes Audited', value: watchdogResult.processes_audited, color: 'text-slate-300' },
                  { label: 'Processes Flagged', value: watchdogResult.processes_flagged, color: watchdogResult.processes_flagged > 0 ? 'text-red-400' : 'text-green-400' },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
                    <div className="text-slate-400 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Flagged processes */}
              {watchdogResult.audit_results?.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-white font-semibold">Flagged Processes</h3>
                  </div>
                  <div className="divide-y divide-slate-700/50">
                    {watchdogResult.audit_results.map((result, i) => {
                      const cfg = STATUS_CONFIG[result.status] || STATUS_CONFIG.needs_review;
                      return (
                        <div key={i} className={`p-5 ${cfg.bg} border-l-4 ${result.status === 'non_compliant' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                              <span className="text-white font-medium text-sm">{result.process_title}</span>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cfg.bg} ${cfg.color} border`}>
                              {result.status?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {result.conflicts?.map((c, j) => (
                            <div key={j} className="text-slate-300 text-xs mb-1">• {c.description}</div>
                          ))}
                          {result.suggested_update && (
                            <div className="mt-2 text-slate-400 text-xs italic">→ {result.suggested_update}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {watchdogResult.processes_flagged === 0 && (
                <div className="flex flex-col items-center justify-center py-12 bg-green-500/5 border border-green-500/20 rounded-2xl">
                  <CheckCircle className="w-10 h-10 text-green-400 mb-3" />
                  <div className="text-green-400 font-semibold">All processes are compliant!</div>
                  <div className="text-slate-400 text-sm">No conflicts found with "{watchdogResult.regulation_name}"</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}