import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2, Clock, Award, Play, ChevronRight,
  TrendingUp, Star, BookOpen, Route, Bell, Trophy,
  Zap, Target, BarChart3, User
} from 'lucide-react';

function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-black/[0.06] ${hover ? 'transition-all duration-200 cursor-pointer hover:-translate-y-0.5' : ''} ${className}`}
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={hover ? e => { e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10), 0 24px 48px rgba(0,0,0,0.06)'; } : undefined}
      onMouseLeave={hover ? e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)'; } : undefined}
    >
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { currentUser, processes, userProgress, learningPaths, certifications, notifications, isLoading } = useData();

  const stats = useMemo(() => {
    const completed  = userProgress.filter(p => p.status === 'completed').length;
    const inProgress = userProgress.filter(p => p.status === 'in_progress').length;
    const hoursSpent = Math.round(userProgress.reduce((a, p) => a + (p.time_spent || 0), 0) / 60) || completed * 2;
    return { completed, inProgress, certsEarned: certifications.length, hoursSpent };
  }, [userProgress, certifications]);

  const inProgressProcesses = useMemo(() => userProgress
    .filter(p => p.status === 'in_progress').slice(0, 3)
    .map(p => ({ ...p, process: processes.find(pr => pr.id === p.process_id) }))
    .filter(p => p.process),
  [userProgress, processes]);

  const recentActivity = useMemo(() => userProgress
    .filter(p => p.status === 'completed' && p.completed_date)
    .sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date))
    .slice(0, 5)
    .map(p => ({ ...p, process: processes.find(pr => pr.id === p.process_id) }))
    .filter(p => p.process),
  [userProgress, processes]);

  const pathsWithProgress = useMemo(() => learningPaths.slice(0, 3).map(path => {
    const pathProcs = (path.process_sequence || []).map(id => processes.find(p => p.id === id)).filter(Boolean);
    const done = pathProcs.filter(p => userProgress.some(up => up.process_id === p.id && up.status === 'completed')).length;
    return { ...path, total: pathProcs.length, done, pct: pathProcs.length > 0 ? Math.round((done / pathProcs.length) * 100) : 0 };
  }), [learningPaths, processes, userProgress]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser?.full_name?.split(' ')[0] || 'there';
  const unread = notifications.filter(n => !n.is_read).length;

  if (isLoading) return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <Skeleton className="h-10 w-64 rounded-xl bg-slate-100" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-slate-100" />)}
      </div>
    </div>
  );

  const KPI_DATA = [
    { label: 'Processes Completed', value: stats.completed,   icon: CheckCircle2, color: '#10B981', bg: '#D1FAE5' },
    { label: 'In Progress',          value: stats.inProgress,  icon: Play,         color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Certifications',       value: stats.certsEarned, icon: Award,        color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Hours Trained',        value: stats.hoursSpent,  icon: Clock,        color: '#8B5CF6', bg: '#EDE9FE' },
  ];

  const QUICK_LINKS = [
    { label: 'Process Library', icon: BookOpen,   href: 'ProcessLibrary',      color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Learning Paths',  icon: Route,       href: 'LearningPaths',       color: '#8B5CF6', bg: '#EDE9FE' },
    { label: 'Certifications',  icon: Award,       href: 'Certifications',      color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Analytics',       icon: BarChart3,   href: 'Analytics',           color: '#10B981', bg: '#D1FAE5' },
    { label: 'Notifications',   icon: Bell,        href: 'Notifications',       color: '#EF4444', bg: '#FEE2E2' },
    { label: 'Profile',         icon: User,        href: 'Profile',             color: '#64748B', bg: '#F1F5F9' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--canvas)' }}>
      <div className="max-w-7xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="label-xs mb-1">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {greeting}, {firstName} 👋
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {stats.completed} processes completed · {stats.inProgress} in progress
            </p>
          </div>
          {unread > 0 && (
            <Link to="/Notifications">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:-translate-y-0.5"
                   style={{ background: '#FEE2E2', border: '1px solid rgba(239,68,68,0.2)', color: '#991B1B',
                            boxShadow: '0 2px 8px rgba(239,68,68,0.12)' }}>
                <Bell className="w-4 h-4" />
                {unread} unread
              </div>
            </Link>
          )}
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {KPI_DATA.map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-black/[0.06] stat-accent-line transition-all duration-200 cursor-default"
                 style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)', borderLeftColor: kpi.color }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background: kpi.bg }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
                <TrendingUp className="w-4 h-4" style={{ color: '#CBD5E1' }} />
              </div>
              <div className="text-3xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{kpi.value}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Continue learning */}
            {inProgressProcesses.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EEF2FF' }}>
                      <Play className="w-3.5 h-3.5" style={{ color: '#4F46E5' }} />
                    </div>
                    <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Continue Learning</h3>
                  </div>
                  <Link to="/MyLearning">
                    <button className="btn-ghost text-sm px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {inProgressProcesses.map(({ process, completion_percentage, current_step }) => (
                    <Link key={process.id} to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
                      <div className="flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 transition-all duration-150 hover:border-indigo-200 hover:bg-indigo-50/40 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EEF2FF' }}>
                          <BookOpen className="w-5 h-5" style={{ color: '#4F46E5' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate mb-1" style={{ color: 'var(--text-primary)' }}>{process.title}</div>
                          <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                            Step {(current_step || 0) + 1} of {process.steps?.length || '?'}
                          </div>
                          <Progress value={completion_percentage || 0} className="h-1.5" />
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold" style={{ color: '#4F46E5' }}>{completion_percentage || 0}%</div>
                          <ChevronRight className="w-4 h-4 mt-1 ml-auto" style={{ color: '#CBD5E1' }} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Learning paths */}
            {pathsWithProgress.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EDE9FE' }}>
                      <Route className="w-3.5 h-3.5" style={{ color: '#8B5CF6' }} />
                    </div>
                    <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Learning Paths</h3>
                  </div>
                  <Link to="/LearningPaths">
                    <button className="btn-ghost text-sm px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {pathsWithProgress.map(path => (
                    <div key={path.id} className="p-4 rounded-xl border border-slate-100">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{path.title}</div>
                          <div className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>
                            {path.target_role?.replace('_', ' ')}
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={path.pct === 100
                                ? { background: '#D1FAE5', color: '#065F46' }
                                : { background: '#EEF2FF', color: '#4338CA' }}>
                          {path.pct === 100 ? '✓ Done' : `${path.done}/${path.total}`}
                        </span>
                      </div>
                      <Progress value={path.pct} className="h-1.5 mb-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{path.pct}% complete</span>
                        <Link to={createPageUrl(`LearningPathDetails?id=${path.id}`)}>
                          <button className="btn-ghost text-xs px-2 py-1 rounded-lg font-medium">
                            {path.pct > 0 ? 'Continue' : 'Start'} →
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Quick access */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                  <Zap className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                </div>
                <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Quick Access</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {QUICK_LINKS.map(item => (
                  <Link key={item.href} to={createPageUrl(item.href)}>
                    <div className="p-3 rounded-xl border border-slate-100 text-center transition-all duration-150 hover:border-indigo-200 hover:-translate-y-0.5 cursor-pointer"
                         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
                         onMouseEnter={e => { e.currentTarget.style.background = item.bg; e.currentTarget.style.borderColor = 'transparent'; }}
                         onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                           style={{ background: item.bg }}>
                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <div className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Recent activity */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                  <Trophy className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                </div>
                <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
              </div>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#F8FAFC' }}>
                    <Target className="w-6 h-6" style={{ color: '#CBD5E1' }} />
                  </div>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>No activity yet</p>
                  <Link to="/ProcessLibrary">
                    <button className="btn-primary text-xs px-4 py-2 rounded-lg">Browse Processes</button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#D1FAE5' }}>
                        <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.process?.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Completed · +50 XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Notifications preview */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EEF2FF' }}>
                    <Bell className="w-3.5 h-3.5" style={{ color: '#4F46E5' }} />
                  </div>
                  <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                  {unread > 0 && (
                    <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                          style={{ background: '#EF4444' }}>{unread}</span>
                  )}
                </div>
                <Link to="/Notifications">
                  <button className="btn-ghost text-[11px] px-2 py-1 rounded-lg">View all</button>
                </Link>
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>All caught up!</p>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 4).map(n => (
                    <div key={n.id} className="p-3 rounded-xl text-xs border transition-colors"
                         style={!n.is_read
                           ? { background: '#EEF2FF', border: '1px solid rgba(79,70,229,0.15)' }
                           : { background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                      <div className="font-medium mb-0.5" style={{ color: n.is_read ? '#94A3B8' : '#0F172A' }}>{n.message}</div>
                      <div style={{ color: '#CBD5E1' }}>{new Date(n.created_date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Certs */}
            {certifications.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border"
                   style={{ borderLeftWidth: 3, borderLeftColor: '#F59E0B', borderColor: '#FEF3C7',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4" style={{ color: '#F59E0B' }} />
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Certifications</span>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Keep your credentials current.</p>
                <Link to="/Certifications">
                  <button className="w-full text-xs font-semibold py-2 rounded-xl border transition-all hover:-translate-y-0.5"
                          style={{ background: '#FEF3C7', border: '1px solid rgba(245,158,11,0.3)', color: '#92400E' }}>
                    View Certifications
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}