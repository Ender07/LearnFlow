import React, { useState } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Award, CheckCircle2, Clock, Star, Edit2, Save, X, TrendingUp, BookOpen } from 'lucide-react';

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-black/[0.06] p-6 ${className}`}
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  );
}

export default function Profile() {
  const { currentUser, userProgress, certifications, isLoading, refetchData } = useData();
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState('');
  const [saving, setSaving]   = useState(false);

  const stats = {
    completed:  userProgress.filter(p => p.status === 'completed').length,
    inProgress: userProgress.filter(p => p.status === 'in_progress').length,
    hours:      Math.round(userProgress.reduce((a, p) => a + (p.time_spent || 0), 0) / 60),
  };

  const xp    = currentUser?.gamification_points || stats.completed * 50;
  const level = Math.ceil(stats.completed / 5) + 1;
  const xpToNext = level * 250;
  const xpPct  = Math.min(100, Math.round((xp / xpToNext) * 100));

  const handleEdit = () => { setName(currentUser?.full_name || ''); setEditing(true); };
  const handleSave = async () => {
    setSaving(true);
    try { await base44.auth.updateMe({ full_name: name }); await refetchData(); setEditing(false); }
    catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (isLoading) return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto" style={{ background: 'var(--canvas)' }}>
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl bg-slate-100" />)}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--canvas)' }}>
      <div className="max-w-4xl mx-auto space-y-6">

        <div>
          <p className="label-xs mb-1">Account</p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
        </div>

        {/* Profile header */}
        <Card>
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
                 style={{ background: 'var(--brand-primary)', boxShadow: '0 4px 16px rgba(79,70,229,0.35)' }}>
              {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2 mb-2">
                  <input value={name} onChange={e => setName(e.target.value)}
                         className="form-input text-lg font-bold max-w-xs"
                         style={{ color: 'var(--text-primary)' }} />
                  <button onClick={handleSave} disabled={saving}
                          className="btn-primary text-sm px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-secondary text-sm px-3 py-1.5 rounded-lg">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{currentUser?.full_name || 'User'}</h2>
                  <button onClick={handleEdit} className="btn-ghost p-1.5 rounded-lg">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{currentUser?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize"
                      style={currentUser?.role === 'admin'
                        ? { background: '#EEF2FF', color: '#3730A3' }
                        : { background: '#F1F5F9', color: '#475569' }}>
                  {currentUser?.role || 'user'}
                </span>
                <span className="inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>
                  Level {level}
                </span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-5 p-4 rounded-xl border border-slate-100" style={{ background: '#F8FAFC' }}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Level {level} — {xp} XP</span>
              <span style={{ color: 'var(--text-muted)' }}>{xpToNext} XP to Level {level + 1}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
              <div className="h-full rounded-full transition-all duration-500"
                   style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))' }} />
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Completed',   value: stats.completed,   icon: CheckCircle2, color: '#10B981', bg: '#D1FAE5' },
            { label: 'In Progress', value: stats.inProgress,  icon: BookOpen,     color: '#4F46E5', bg: '#EEF2FF' },
            { label: 'Hours',       value: stats.hours,        icon: Clock,        color: '#F59E0B', bg: '#FEF3C7' },
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

        {/* Certifications */}
        {certifications.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                <Award className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
              </div>
              <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Certifications</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifications.map(cert => (
                <div key={cert.id} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-amber-50/40">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FEF3C7' }}>
                    <Award className="w-5 h-5" style={{ color: '#F59E0B' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{cert.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{cert.issuing_authority || 'Internal'}</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Gamification */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EDE9FE' }}>
              <Star className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} />
            </div>
            <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Achievements</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'First Step',   earned: stats.completed >= 1,  emoji: '🚀', desc: 'Complete your first process' },
              { label: 'Quick Start',  earned: stats.completed >= 5,  emoji: '⚡', desc: 'Complete 5 processes' },
              { label: 'Dedicated',    earned: stats.completed >= 10, emoji: '🎯', desc: 'Complete 10 processes' },
              { label: 'Expert',       earned: stats.completed >= 25, emoji: '🏆', desc: 'Complete 25 processes' },
              { label: 'Certified',    earned: certifications.length >= 1, emoji: '🎓', desc: 'Earn a certification' },
              { label: 'Time Spent',   earned: stats.hours >= 10,     emoji: '⏰', desc: 'Train for 10+ hours' },
            ].map(a => (
              <div key={a.label} className="p-3 rounded-xl border text-center transition-all"
                   style={a.earned
                     ? { background: '#EDE9FE', border: '1px solid rgba(124,58,237,0.2)' }
                     : { background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                <div className="text-2xl mb-1" style={{ filter: a.earned ? 'none' : 'grayscale(1) opacity(0.35)' }}>{a.emoji}</div>
                <div className="text-xs font-semibold" style={{ color: a.earned ? '#5B21B6' : 'var(--text-muted)' }}>{a.label}</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}