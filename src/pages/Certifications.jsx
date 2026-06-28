import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Search, CheckCircle2, Clock, BookOpen, ChevronRight, Download } from 'lucide-react';

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-black/[0.06] ${className}`}
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  );
}

export default function Certifications() {
  const { certifications, userProgress, processes, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const enriched = useMemo(() => certifications.map(cert => {
    const requiredProcs = cert.required_processes || [];
    const total   = requiredProcs.length;
    const done    = requiredProcs.filter(pid => userProgress.some(up => up.process_id === pid && up.status === 'completed')).length;
    const pct     = total > 0 ? Math.round((done / total) * 100) : (total === 0 ? 100 : 0);
    const earned  = pct === 100;
    return { ...cert, done, total, pct, earned };
  }), [certifications, userProgress]);

  const stats = {
    earned:    enriched.filter(c => c.earned).length,
    inProg:    enriched.filter(c => !c.earned && c.pct > 0).length,
    available: enriched.filter(c => !c.earned && c.pct === 0).length,
  };

  const filtered = enriched.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
    const matchTab = tab === 'all' || (tab === 'earned' && c.earned) || (tab === 'in_progress' && !c.earned && c.pct > 0) || (tab === 'available' && !c.earned && c.pct === 0);
    return matchQ && matchTab;
  });

  if (isLoading) return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto" style={{ background: 'var(--canvas)' }}>
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-slate-100" />)}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--canvas)' }}>
      <div className="max-w-6xl mx-auto space-y-6">

        <div>
          <p className="label-xs mb-1">Learning</p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Certifications</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Track and earn professional credentials</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Earned',     value: stats.earned,    color: '#10B981', bg: '#D1FAE5', icon: CheckCircle2 },
            { label: 'In Progress', value: stats.inProg,   color: '#4F46E5', bg: '#EEF2FF', icon: Clock },
            { label: 'Available',  value: stats.available, color: '#F59E0B', bg: '#FEF3C7', icon: Award },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-black/[0.06] stat-accent-line"
                 style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)', borderLeftColor: s.color }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className="text-3xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + tabs */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search certifications…" className="form-input pl-10" />
          </div>
          <div className="flex p-1 rounded-xl gap-1 bg-slate-100">
            {['all', 'earned', 'in_progress', 'available'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                style={tab === t
                  ? { background: '#fff', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { color: 'var(--text-muted)' }}>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50">
              <Award className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No certifications found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try a different search or tab</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(cert => (
              <div key={cert.id} className="bg-white rounded-2xl border border-black/[0.06] p-6 transition-all duration-200 hover:-translate-y-0.5"
                   style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)', borderLeftWidth: 3, borderLeftColor: cert.earned ? '#10B981' : cert.pct > 0 ? '#4F46E5' : '#E2E8F0' }}
                   onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)'}
                   onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)'}>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                       style={cert.earned
                         ? { background: '#D1FAE5', border: '1px solid rgba(16,185,129,0.25)' }
                         : cert.pct > 0
                         ? { background: '#EEF2FF', border: '1px solid rgba(79,70,229,0.2)' }
                         : { background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Award className="w-7 h-7" style={{ color: cert.earned ? '#10B981' : cert.pct > 0 ? '#4F46E5' : '#CBD5E1' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{cert.title}</h3>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{cert.issuing_authority || 'Internal'}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {cert.earned && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#D1FAE5', color: '#065F46' }}>
                            <CheckCircle2 className="w-3 h-3" /> Earned
                          </span>
                        )}
                        {cert.validity_period_months && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>
                            <Clock className="w-3 h-3" /> {cert.validity_period_months}mo
                          </span>
                        )}
                      </div>
                    </div>

                    {cert.description && (
                      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{cert.description}</p>
                    )}

                    {cert.total > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                          <span>{cert.done} of {cert.total} processes</span>
                          <span className="font-semibold">{cert.pct}%</span>
                        </div>
                        <Progress value={cert.pct} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {cert.earned ? (
                        <button className="btn-secondary flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg">
                          <Download className="w-3.5 h-3.5" /> Download Certificate
                        </button>
                      ) : (
                        <Link to={createPageUrl('LearningPaths')}>
                          <button className="btn-primary text-xs px-4 py-2 rounded-lg flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" /> {cert.pct > 0 ? 'Continue' : 'Start Learning'}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}