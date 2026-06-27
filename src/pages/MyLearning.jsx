import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Play, CheckCircle2, Clock, Award, BookOpen, AlertTriangle,
  RotateCcw, Download, CalendarDays, Target, TrendingUp
} from 'lucide-react';

const TABS = [
  { key: 'in_progress',    label: 'In Progress',    color: '#00D4FF' },
  { key: 'completed',      label: 'Completed',      color: '#10B981' },
  { key: 'assigned',       label: 'Assigned',       color: '#F59E0B' },
  { key: 'certifications', label: 'Certifications', color: '#A78BFA' },
];

function GlassCard({ children, className = '', accent = false }) {
  return (
    <div className={`rounded-2xl ${className}`}
         style={{
           background: accent
             ? 'linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(124,58,237,0.05) 100%)'
             : 'rgba(255,255,255,0.04)',
           border: accent ? '1px solid rgba(0,212,255,0.18)' : '1px solid rgba(255,255,255,0.08)',
           backdropFilter: 'blur(16px)',
           WebkitBackdropFilter: 'blur(16px)',
         }}>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, children }) {
  return (
    <div className="text-center py-16">
      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
           style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Icon className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.2)' }} />
      </div>
      <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</p>
      {children}
    </div>
  );
}

export default function MyLearning() {
  const { userProgress, processes, certifications, isLoading } = useData();
  const [activeTab, setActiveTab] = React.useState('in_progress');

  const enriched = useMemo(() => userProgress.map(p => ({
    ...p, process: processes.find(pr => pr.id === p.process_id)
  })).filter(p => p.process), [userProgress, processes]);

  const inProgress    = enriched.filter(p => p.status === 'in_progress');
  const completed     = enriched.filter(p => p.status === 'completed');
  const assigned      = enriched.filter(p => p.assigned_by && p.status !== 'completed');

  const stats = {
    totalCompletions: completed.length,
    totalTime: Math.round(userProgress.reduce((a, p) => a + (p.time_spent || 0), 0) / 60),
    certsEarned: certifications.length,
    avgScore: completed.length > 0
      ? Math.round(completed.reduce((a, p) => a + (p.quiz_score || 80), 0) / completed.length) : 0,
  };

  if (isLoading) return (
    <div className="min-h-screen p-6 space-y-4" style={{ background: 'hsl(var(--background))' }}>
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
    </div>
  );

  const counts = { in_progress: inProgress.length, completed: completed.length, assigned: assigned.length, certifications: certifications.length };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <BookOpen className="w-5 h-5" style={{ color: '#10B981' }} />
            </div>
            My Learning
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Track your training progress and achievements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Completions',  value: stats.totalCompletions,                       icon: CheckCircle2, color: '#10B981' },
            { label: 'Hours Spent',  value: stats.totalTime,                              icon: Clock,        color: '#00D4FF' },
            { label: 'Certs Earned', value: stats.certsEarned,                            icon: Award,        color: '#F59E0B' },
            { label: 'Avg Score',    value: stats.avgScore ? `${stats.avgScore}%` : 'N/A', icon: TrendingUp,  color: '#A78BFA' },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-2xl flex items-center gap-3"
                 style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: `${s.color}15`, border: `1px solid ${s.color}28` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center"
              style={activeTab === tab.key
                ? { background: `${tab.color}18`, color: tab.color, border: `1px solid ${tab.color}30` }
                : { color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }}>
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: activeTab === tab.key ? `${tab.color}25` : 'rgba(255,255,255,0.08)', color: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.4)' }}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'in_progress' && (
          inProgress.length === 0 ? (
            <EmptyState icon={Play} title="Nothing in progress" desc="Browse the process library to start learning">
              <Link to={createPageUrl('ProcessLibrary')}>
                <button className="mt-4 btn-primary px-5 py-2 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg,#00D4FF,#0EA5E9,#7C3AED)', color: '#000' }}>
                  Browse Processes
                </button>
              </Link>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {inProgress.map(item => (
                <GlassCard key={item.id}>
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold mb-1 truncate">{item.process?.title}</h3>
                      <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <span className="capitalize">{item.process?.category?.replace('_', ' ')}</span>
                        <span>·</span>
                        <span>Step {(item.current_step || 0) + 1} of {item.process?.steps?.length || '?'}</span>
                        {item.due_date && (
                          <span className={`flex items-center gap-1 ${new Date(item.due_date) < new Date() ? 'text-red-400' : 'text-yellow-400'}`}>
                            <CalendarDays className="w-3 h-3" />
                            Due {new Date(item.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <Progress value={item.completion_percentage || 0} className="h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
                      <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.completion_percentage || 0}% complete</div>
                    </div>
                    <Link to={createPageUrl(`ProcessExecution?id=${item.process_id}`)}>
                      <button className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                              style={{ background: 'linear-gradient(135deg, #00D4FF, #0EA5E9)', color: '#000', boxShadow: '0 0 16px rgba(0,212,255,0.3)' }}>
                        <Play className="w-3 h-3" /> Continue
                      </button>
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          )
        )}

        {activeTab === 'completed' && (
          completed.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No completions yet" desc="Finish your first process to see it here" />
          ) : (
            <div className="space-y-3">
              {completed.map(item => (
                <GlassCard key={item.id}>
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                           style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">{item.process?.title}</h3>
                        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          Completed {item.completed_date ? new Date(item.completed_date).toLocaleDateString() : 'recently'}
                          {item.quiz_score && ` · Score: ${item.quiz_score}%`}
                        </div>
                      </div>
                    </div>
                    <Link to={createPageUrl(`ProcessExecution?id=${item.process_id}`)}>
                      <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}>
                        <RotateCcw className="w-3 h-3" /> Retake
                      </button>
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          )
        )}

        {activeTab === 'assigned' && (
          assigned.length === 0 ? (
            <EmptyState icon={Target} title="No assigned training" desc="Your supervisor will assign training here" />
          ) : (
            <div className="space-y-3">
              {assigned.map(item => {
                const isOverdue = item.due_date && new Date(item.due_date) < new Date();
                const isDueSoon = item.due_date && !isOverdue && (new Date(item.due_date) - new Date()) < 7 * 86400000;
                return (
                  <div key={item.id} className="p-5 rounded-2xl flex items-center justify-between gap-4 transition-all"
                       style={{
                         background: 'rgba(255,255,255,0.04)',
                         border: isOverdue ? '1px solid rgba(239,68,68,0.25)' : isDueSoon ? '1px solid rgba(234,179,8,0.25)' : '1px solid rgba(255,255,255,0.08)',
                         backdropFilter: 'blur(16px)',
                       }}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: isOverdue ? '#f87171' : isDueSoon ? '#facc15' : 'rgba(255,255,255,0.3)' }} />
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">{item.process?.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {isOverdue && <span className="badge-danger text-[11px] px-2 py-0.5 rounded-full font-medium">Overdue</span>}
                          {isDueSoon && <span className="badge-warning text-[11px] px-2 py-0.5 rounded-full font-medium">Due Soon</span>}
                          {item.due_date && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Due {new Date(item.due_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                    <Link to={createPageUrl(`ProcessExecution?id=${item.process_id}`)}>
                      <button className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
                              style={{ background: 'linear-gradient(135deg, #00D4FF, #0EA5E9)', color: '#000', boxShadow: '0 0 16px rgba(0,212,255,0.3)' }}>
                        <Play className="w-3 h-3" /> Start
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === 'certifications' && (
          certifications.length === 0 ? (
            <EmptyState icon={Award} title="No certifications yet" desc="Complete learning paths to earn certifications">
              <Link to={createPageUrl('LearningPaths')}>
                <button className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>
                  View Paths
                </button>
              </Link>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map(cert => (
                <div key={cert.id} className="p-5 rounded-2xl"
                     style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(234,88,12,0.05) 100%)', border: '1px solid rgba(245,158,11,0.2)', backdropFilter: 'blur(16px)' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(234,88,12,0.2))', border: '1px solid rgba(245,158,11,0.35)', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}>
                      <Award className="w-7 h-7" style={{ color: '#F59E0B' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold mb-1">{cert.title}</h3>
                      <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{cert.issuing_authority || 'Internal'}</p>
                      {cert.validity_period_months && (
                        <span className="badge-warning text-[11px] px-2 py-0.5 rounded-full font-medium">
                          Valid {cert.validity_period_months} months
                        </span>
                      )}
                    </div>
                    <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}