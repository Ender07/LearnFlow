import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Download, RefreshCw, Filter, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const EVENT_CONFIG = {
  failed_login_attempt: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: AlertTriangle },
  suspicious_activity: { color: 'text-orange-400', bg: 'bg-orange-500/10', icon: AlertTriangle },
  unauthorized_access_attempt: { color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
  data_breach_attempt: { color: 'text-red-500', bg: 'bg-red-600/10', icon: XCircle },
  compliance_scan: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Shield },
  certification_gap: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
  supervisor_review: { color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle },
  process_flagged: { color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
  regulatory_scan: { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Lock },
};

const SEVERITY_COLORS = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function AuditConsole() {
  const [securityEvents, setSecurityEvents] = useState([]);
  const [complianceReports, setComplianceReports] = useState([]);
  const [supervisorReviews, setSupervisorReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | security | compliance | reviews
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [se, cr, sr, us] = await Promise.all([
        base44.entities.SecurityEvent.list('-created_date', 50),
        base44.entities.ComplianceReport.list('-created_date', 30),
        base44.entities.SupervisorReview.list('-created_date', 30),
        base44.entities.User.list(),
      ]);
      setSecurityEvents(se);
      setComplianceReports(cr);
      setSupervisorReviews(sr);
      setUsers(us);
      setLoading(false);
    };
    load();
  }, []);

  // Merge all events into unified timeline
  const allEvents = useMemo(() => {
    const sec = securityEvents.map(e => ({
      id: `sec_${e.id}`,
      type: e.event_type,
      category: 'security',
      severity: e.severity,
      timestamp: e.created_date,
      summary: `${e.event_type?.replace(/_/g, ' ')} detected`,
      detail: e.event_details ? JSON.stringify(e.event_details).slice(0, 80) : '',
      status: e.status,
      user: users.find(u => u.id === e.user_id)?.full_name,
    }));

    const comp = complianceReports.map(r => ({
      id: `comp_${r.id}`,
      type: 'compliance_scan',
      category: 'compliance',
      severity: r.compliance_status === 'non_compliant' ? 'high' : r.compliance_status === 'partial_compliance' ? 'medium' : 'low',
      timestamp: r.created_date,
      summary: `${r.report_type?.replace(/_/g, ' ')} — ${r.compliance_status?.replace(/_/g, ' ')}`,
      detail: r.recommendations?.slice(0, 2).join('; ') || '',
      status: r.compliance_status,
    }));

    const reviews = supervisorReviews.map(r => ({
      id: `rev_${r.id}`,
      type: 'supervisor_review',
      category: 'reviews',
      severity: r.review_status === 'rejected' ? 'high' : r.review_status === 'requires_remediation' ? 'medium' : 'low',
      timestamp: r.created_date,
      summary: `Supervisor review — ${r.review_type?.replace(/_/g, ' ')}`,
      detail: r.observations?.slice(0, 80) || '',
      status: r.review_status,
      user: users.find(u => u.id === r.trainee_id)?.full_name,
    }));

    return [...sec, ...comp, ...reviews]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [securityEvents, complianceReports, supervisorReviews, users]);

  const filtered = useMemo(() => {
    return allEvents.filter(e => {
      if (filter !== 'all' && e.category !== filter) return false;
      if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
      return true;
    });
  }, [allEvents, filter, severityFilter]);

  const stats = useMemo(() => ({
    critical: allEvents.filter(e => e.severity === 'critical').length,
    high: allEvents.filter(e => e.severity === 'high').length,
    security: securityEvents.length,
    compliance: complianceReports.length,
  }), [allEvents, securityEvents, complianceReports]);

  const exportCSV = () => {
    const rows = [
      ['Timestamp', 'Category', 'Type', 'Severity', 'Summary', 'Status', 'User'],
      ...filtered.map(e => [
        new Date(e.timestamp).toISOString(),
        e.category, e.type, e.severity || '', e.summary, e.status || '', e.user || '',
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `audit_log_${Date.now()}.csv`; a.click();
  };

  const EventIcon = ({ type }) => {
    const cfg = EVENT_CONFIG[type] || { color: 'text-slate-400', bg: 'bg-slate-500/10', icon: Shield };
    return (
      <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            Audit Console
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Tamper-proof unified log of all security events, compliance scans, and supervisor actions</p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white flex-shrink-0">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical Events', value: stats.critical, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'High Severity', value: stats.high, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
          { label: 'Security Events', value: stats.security, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Compliance Scans', value: stats.compliance, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'security', label: 'Security' },
            { id: 'compliance', label: 'Compliance' },
            { id: 'reviews', label: 'Reviews' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1">
          {['all', 'critical', 'high', 'medium', 'low'].map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${severityFilter === s ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-slate-500 text-xs ml-auto">{filtered.length} events</span>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-700/30 rounded-xl h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700">
          <CheckCircle className="w-10 h-10 text-green-400 mb-3" />
          <div className="text-slate-400 text-sm">No events match your filters</div>
        </div>
      ) : (
        <div className="bg-slate-800/30 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="divide-y divide-slate-700/40">
            {filtered.map((event) => (
              <div key={event.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-700/20 transition-colors">
                <EventIcon type={event.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-0.5">
                    <span className="text-white text-sm font-medium">{event.summary}</span>
                    {event.severity && (
                      <Badge className={`text-xs border capitalize ${SEVERITY_COLORS[event.severity] || 'bg-slate-600/20 text-slate-400 border-slate-600'}`}>
                        {event.severity}
                      </Badge>
                    )}
                    {event.status && (
                      <Badge className="text-xs bg-slate-700/50 text-slate-400 border-slate-600 capitalize">
                        {event.status.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                  {event.user && <div className="text-slate-500 text-xs">User: {event.user}</div>}
                  {event.detail && <div className="text-slate-500 text-xs mt-0.5 truncate">{event.detail}</div>}
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-slate-500 text-xs">{new Date(event.timestamp).toLocaleDateString()}</div>
                  <div className="text-slate-600 text-xs">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}