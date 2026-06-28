import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, CheckCircle2, Clock, Award, BookOpen, AlertTriangle, RotateCcw, Download, CalendarDays, Target, TrendingUp } from 'lucide-react';

const TABS = [
  { key: 'in_progress',    label: 'In Progress',    color: '#4F46E5', bg: '#EEF2FF' },
  { key: 'completed',      label: 'Completed',      color: '#10B981', bg: '#D1FAE5' },
  { key: 'assigned',       label: 'Assigned',       color: '#F59E0B', bg: '#FEF3C7' },
  { key: 'certifications', label: 'Certifications', color: '#7C3AED', bg: '#EDE9FE' },
];

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-black/[0.06] p-5 ${className}`}
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  );
}

export default function MyLearning() {
  const { userProgress, processes, certifications, isLoading } = useData();
  const [activeTab, setActiveTab] = useState('in_progress');

  const enriched = useMemo(() => userProgress.map(p => ({
    ...p, process: processes.find(pr => pr.id === p.process_id)
  })).filter(p => p.process), [userProgress, processes]);

  const inProgress = enriched.filter(p => p.status === 'in_progress');
  const completed  = enriched.filter(p => p.status === 'completed');
  const assigned   = enriched.filter(p => p.assigned_by && p.status !== 'completed');

  const stats = {
    completions: completed.length,
    hours: Math.round(userProgress.reduce((a, p) => a + (p.time_spent || 0), 0) / 60),
    certs: certifications.length,
    avgScore: completed.length > 0 ? Math.round(completed.reduce((a, p) => a + (p.quiz_score || 80), 0) / completed.length) : 0,
  };

  const counts = { in_progress: inProgress.length, completed: completed.length, assigned: assigned.length, certifications: certifications.length };

  if (isLoading) return (
    <div className="p-6 space-y-4 max-w-5xl mx-auto" style={{ background: 'var(--canvas)' }}>
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl bg-slate-100" />)}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--canvas)' }}>
      <div className="max-w-5xl mx-auto space-y-6">

        <div>
          <p className="label-xs mb-1">Learning</p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Learning</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Track your training progress and achievements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Completions',  value: stats.completions,                          icon: CheckCircle2, color: '#10B981', bg: '#D1FAE5' },
            { label: 'Hours Spent',  value: stats.hours,                                icon: Clock,        color: '#4F46E5', bg: '#EEF2FF' },
            { label: 'Certs Earned', value: stats.certs,                                icon: Award,        color: '#F59E0B', bg: '#FEF3C7' },
            { label: 'Avg Score',    value: stats.avgScore ? `${stats.avgScore}%` : 'N/A', icon: TrendingUp, color: '#7C3AED', bg: '#EDE9FE' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-black/[0.06] stat-accent-line flex items-center gap-3"
                 style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)', borderLeftColor: s.color }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1.5 rounded-2xl bg-slate-100 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center"
              style={activeTab === tab.key
                ? { background: '#fff', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: 'var(--text-muted)' }}>
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={activeTab === tab.key ? { background: tab.bg, color: tab.color } : { background: 'rgba(0,0,0,0.06)', color: '#64748B' }}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* In Progress */}
        {activeTab === 'in_progress' && (
          inProgress.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50"><Play className="w-7 h-7 text-slate-300" /></div>
              <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Nothing in progress</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Browse the process library to start learning</p>
              <Link to="/ProcessLibrary"><button className="btn-primary text-sm px-5 py-2 rounded-xl">Browse Processes</button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {inProgress.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-black/[0.06] p-5 transition-all hover:-translate-y-0.5"
                     style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}
                     onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)'}
                     onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)'}>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EEF2FF' }}>
                      <BookOpen className="w-5 h-5" style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>{item.process?.title}</h3>
                          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span className="capitalize">{item.process?.category?.replace('_', ' ')}</span>
                            <span>·</span>
                            <span>Step {(item.current_step || 0) + 1} of {item.process?.steps?.length || '?'}</span>
                            {item.due_date && (
                              <span className={`flex items-center gap-1 font-medium ${new Date(item.due_date) < new Date() ? 'text-red-500' : 'text-amber-600'}`}>
                                <CalendarDays className="w-3 h-3" />
                                {new Date(item.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link to={createPageUrl(`ProcessExecution?id=${item.process_id}`)}>
                          <button className="btn-primary flex-shrink-0 flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl">
                            <Play className="w-3 h-3" /> Continue
                          </button>
                        </Link>
                      </div>
                      <div className="mt-3">
                        <Progress value={item.completion_percentage || 0} className="h-1.5" />
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.completion_percentage || 0}% complete</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Completed */}
        {activeTab === 'completed' && (
          completed.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50"><CheckCircle2 className="w-7 h-7 text-slate-300" /></div>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>No completions yet</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Finish your first process to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completed.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-black/[0.06] p-5 flex items-center gap-4"
                     style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: '3px solid #10B981' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.process?.title}</h3>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Completed {item.completed_date ? new Date(item.completed_date).toLocaleDateString() : 'recently'}
                      {item.quiz_score ? ` · Score: ${item.quiz_score}%` : ''}
                    </div>
                  </div>
                  <Link to={createPageUrl(`ProcessExecution?id=${item.process_id}`)}>
                    <button className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg flex-shrink-0">
                      <RotateCcw className="w-3 h-3" /> Retake
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )
        )}

        {/* Assigned */}
        {activeTab === 'assigned' && (
          assigned.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50"><Target className="w-7 h-7 text-slate-300" /></div>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>No assigned training</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your supervisor will assign training here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assigned.map(item => {
                const overdue = item.due_date && new Date(item.due_date) < new Date();
                const soon    = item.due_date && !overdue && (new Date(item.due_date) - new Date()) < 7 * 86400000;
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-black/[0.06] p-5 flex items-center gap-4"
                       style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `3px solid ${overdue ? '#EF4444' : soon ? '#F59E0B' : '#E2E8F0'}` }}>
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: overdue ? '#EF4444' : soon ? '#F59E0B' : '#CBD5E1' }} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.process?.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {overdue && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#991B1B' }}>Overdue</span>}
                        {soon    && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>Due Soon</span>}
                        {item.due_date && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Due {new Date(item.due_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <Link to={createPageUrl(`ProcessExecution?id=${item.process_id}`)}>
                      <button className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl flex-shrink-0">
                        <Play className="w-3 h-3" /> Start
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Certifications */}
        {activeTab === 'certifications' && (
          certifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50"><Award className="w-7 h-7 text-slate-300" /></div>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>No certifications yet</h3>
              <p className="text-sm mb-4 mt-1" style={{ color: 'var(--text-muted)' }}>Complete learning paths to earn certifications</p>
              <Link to="/LearningPaths"><button className="btn-primary text-sm px-5 py-2 rounded-xl">View Paths</button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map(cert => (
                <div key={cert.id} className="bg-white rounded-2xl border border-black/[0.06] p-5 flex items-start gap-4 transition-all hover:-translate-y-0.5"
                     style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)', borderLeft: '3px solid #F59E0B' }}
                     onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)'}
                     onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)'}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FEF3C7' }}>
                    <Award className="w-6 h-6" style={{ color: '#F59E0B' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{cert.title}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cert.issuing_authority || 'Internal'}</p>
                    {cert.validity_period_months && (
                      <span className="inline-block mt-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>
                        Valid {cert.validity_period_months} months
                      </span>
                    )}
                  </div>
                  <button className="flex-shrink-0 btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}