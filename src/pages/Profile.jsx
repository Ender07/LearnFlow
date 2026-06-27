import React, { useState } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Award, Star, TrendingUp, Shield, Edit3, Save, X, Zap } from 'lucide-react';

function GlassCard({ children, accent = false, className = '' }) {
  return (
    <div className={`rounded-2xl ${className}`}
         style={{
           background: accent
             ? 'linear-gradient(135deg, rgba(0,100,220,0.22), rgba(60,30,140,0.18))'
             : 'rgba(12,18,42,0.7)',
           border: accent ? '1px solid rgba(0,140,255,0.3)' : '1px solid rgba(255,255,255,0.07)',
           backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
           boxShadow: '0 4px 32px rgba(0,0,0,0.35)',
         }}>
      {children}
    </div>
  );
}

export default function Profile() {
  const { currentUser, userProgress, certifications, badges, isLoading, refetchData } = useData();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({});

  const startEdit = () => { setForm({ full_name: currentUser?.full_name || '' }); setEditing(true); };
  const save = async () => {
    setSaving(true);
    try { await base44.auth.updateMe(form); await refetchData?.(); setEditing(false); }
    catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const completed = userProgress.filter(p => p.status === 'completed').length;
  const level     = currentUser?.gamification_level || Math.ceil(completed / 5) + 1;
  const points    = currentUser?.gamification_points || completed * 50;
  const levelPct  = Math.min((points % 1000) / 10, 100);

  if (isLoading) return (
    <div className="min-h-screen p-6 space-y-4" style={{ background: 'hsl(var(--background))' }}>
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-4xl mx-auto space-y-5">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(148,163,184,0.15)', border: '1px solid rgba(148,163,184,0.2)' }}>
            <User className="w-5 h-5" style={{ color: '#94a3b8' }} />
          </div>
          Profile
        </h1>

        {/* Identity card */}
        <GlassCard>
          <div className="p-6 flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl font-bold text-white"
                 style={{ background: 'linear-gradient(135deg, #0060cc, #4020aa)', boxShadow: '0 0 24px rgba(0,96,204,0.4)' }}>
              {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <input value={form.full_name || ''} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="px-3 py-2 rounded-xl text-sm text-white outline-none w-full max-w-xs"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(0,128,255,0.4)' }} />
                  <div className="flex gap-2">
                    <button onClick={save} disabled={saving}
                      className="text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                      style={{ background: 'rgba(0,128,255,0.25)', border: '1px solid rgba(0,128,255,0.4)', color: '#60b4ff' }}>
                      <Save className="w-3 h-3" />{saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)}
                      className="text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                      <X className="w-3 h-3" />Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{currentUser?.full_name || 'User'}</h2>
                    <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{currentUser?.email}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium mt-2 px-2.5 py-1 rounded-full"
                          style={currentUser?.role === 'admin'
                            ? { background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.25)', color: '#c084fc' }
                            : { background: 'rgba(96,180,255,0.12)', border: '1px solid rgba(96,180,255,0.2)', color: '#60b4ff' }}>
                      <Shield className="w-2.5 h-2.5" />{currentUser?.role || 'user'}
                    </span>
                  </div>
                  <button onClick={startEdit} className="p-2 rounded-lg transition-all"
                          style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* XP / Level */}
        <GlassCard accent>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: '#fbbf24' }} />
                <span className="text-white font-semibold">Level {level}</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                {points} / {level * 1000} XP
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all"
                   style={{ width: `${levelPct}%`, background: 'linear-gradient(90deg, #0080ff, #60b4ff)', boxShadow: '0 0 10px rgba(0,128,255,0.5)' }} />
            </div>
            <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {Math.round(level * 1000 - (points % 1000))} XP to next level
            </p>
          </div>
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Processes Done', value: completed,              icon: TrendingUp, color: '#34d399' },
            { label: 'Certifications', value: certifications.length, icon: Award,      color: '#fbbf24' },
            { label: 'Total XP',       value: points,                icon: Star,       color: '#60b4ff' },
            { label: 'Current Level',  value: level,                 icon: Zap,        color: '#c084fc' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4 text-center"
                 style={{ background: 'rgba(12,18,42,0.75)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}>
              <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: s.color }} />
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {badges && badges.length > 0 && (
          <GlassCard>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4" style={{ color: '#fbbf24' }} />
                <span className="text-white font-semibold">Earned Badges</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badges.map(badge => (
                  <div key={badge.id} className="rounded-xl p-4 text-center"
                       style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
                         style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(245,158,11,0.2))', border: '1px solid rgba(251,191,36,0.35)' }}>
                      <Award className="w-6 h-6" style={{ color: '#fbbf24' }} />
                    </div>
                    <div className="text-white text-sm font-medium">{badge.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{badge.points} XP</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}