import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Search, Shield, Clock, CheckCircle2, Lock, ChevronRight, Download } from 'lucide-react';

function GlassCard({ children, className = '', accent = false }) {
  return (
    <div className={`rounded-2xl ${className}`}
         style={{
           background: accent ? 'linear-gradient(135deg, rgba(0,100,220,0.2), rgba(60,30,140,0.16))' : 'rgba(12,18,42,0.7)',
           border: accent ? '1px solid rgba(0,140,255,0.25)' : '1px solid rgba(255,255,255,0.07)',
           backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
           boxShadow: '0 4px 32px rgba(0,0,0,0.35)',
         }}>
      {children}
    </div>
  );
}

export default function Certifications() {
  const { certifications, userProgress, isLoading } = useData();
  const [search, setSearch] = useState('');

  const completedIds = useMemo(() => new Set(userProgress.filter(p => p.status === 'completed').map(p => p.process_id)), [userProgress]);

  const certsWithStatus = useMemo(() => {
    return certifications.filter(c => c.title?.toLowerCase().includes(search.toLowerCase())).map(cert => {
      const req  = cert.required_processes || [];
      const earned = req.length === 0 || req.every(id => completedIds.has(id));
      const progress = req.length > 0 ? Math.round((req.filter(id => completedIds.has(id)).length / req.length) * 100) : 0;
      return { ...cert, earned, progress };
    });
  }, [certifications, completedIds, search]);

  const earned  = certsWithStatus.filter(c => c.earned);
  const notYet  = certsWithStatus.filter(c => !c.earned);

  if (isLoading) return (
    <div className="min-h-screen p-6 space-y-4" style={{ background: 'hsl(var(--background))' }}>
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: 'rgba(251,191,36,0.18)', border: '1px solid rgba(251,191,36,0.28)' }}>
                <Award className="w-5 h-5" style={{ color: '#fbbf24' }} />
              </div>
              Certifications
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {earned.length} earned · {notYet.length} available to earn
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search certifications…"
              className="pl-10 pr-4 py-2.5 rounded-xl text-sm w-72 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,128,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Earned',    value: earned.length,         color: '#fbbf24', glow: 'rgba(251,191,36,0.15)'  },
            { label: 'Available', value: notYet.length,         color: '#60b4ff', glow: 'rgba(96,180,255,0.12)' },
            { label: 'Total',     value: certifications.length, color: 'rgba(255,255,255,0.5)', glow: 'rgba(255,255,255,0.05)' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4 text-center"
                 style={{ background: s.glow, border: `1px solid ${s.color}25`, backdropFilter: 'blur(16px)' }}>
              <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {earned.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" style={{ color: '#34d399' }} />
              <span className="text-white font-semibold text-sm">Earned Certifications</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earned.map(cert => <CertCard key={cert.id} cert={cert} earned={true} />)}
            </div>
          </div>
        )}

        {notYet.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <span className="text-white font-semibold text-sm">Available to Earn</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notYet.map(cert => <CertCard key={cert.id} cert={cert} earned={false} />)}
            </div>
          </div>
        )}

        {certsWithStatus.length === 0 && (
          <div className="text-center py-16">
            <Award className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
            <h3 className="text-white font-semibold text-lg mb-1">No certifications found</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {search ? 'Try a different search term' : 'Certifications will appear here once created'}
            </p>
            <Link to={createPageUrl('LearningPaths')}>
              <button className="text-sm font-semibold px-5 py-2 rounded-xl transition-all"
                      style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                Browse Learning Paths
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function CertCard({ cert, earned }) {
  return (
    <div className="rounded-2xl p-5 transition-all duration-200"
         style={{
           background: earned
             ? 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.06))'
             : 'rgba(12,18,42,0.7)',
           border: earned ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(255,255,255,0.07)',
           backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
         }}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
             style={earned
               ? { background: 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(245,158,11,0.2))', border: '1px solid rgba(251,191,36,0.4)', boxShadow: '0 0 20px rgba(251,191,36,0.2)' }
               : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Award className="w-7 h-7" style={{ color: earned ? '#fbbf24' : 'rgba(255,255,255,0.25)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-white font-bold text-sm">{cert.title}</h3>
            {earned && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} />}
          </div>
          <p className="text-xs mb-3 line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{cert.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
              <Shield className="w-2.5 h-2.5" />{cert.issuing_authority || 'Internal'}
            </span>
            {cert.validity_period_months && (
              <span className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
                <Clock className="w-2.5 h-2.5" />{cert.validity_period_months}mo validity
              </span>
            )}
          </div>
          {earned ? (
            <button className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
              <Download className="w-3 h-3" /> Download Certificate
            </button>
          ) : cert.progress > 0 ? (
            <div>
              <div className="h-1 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: `${cert.progress}%`, background: 'linear-gradient(90deg, #0080ff, #60b4ff)', boxShadow: '0 0 8px rgba(0,128,255,0.4)' }} />
              </div>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{cert.progress}% complete</span>
            </div>
          ) : (
            <Link to={createPageUrl('LearningPaths')}>
              <button className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(0,128,255,0.18)', border: '1px solid rgba(0,128,255,0.3)', color: '#60b4ff' }}>
                Start Earning <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}