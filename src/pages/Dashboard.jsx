import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2, Clock, Award, Zap, Play, AlertTriangle,
  ChevronRight, TrendingUp, Star, BookOpen, Route, Target,
  Bell, Trophy, Flame
} from 'lucide-react';

/* ── Reusable glass card ── */
function GlassCard({ children, className = '', style = {}, accent = false }) {
  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${className}`}
      style={{
        background: accent
          ? 'linear-gradient(135deg, rgba(0,100,220,0.22), rgba(60,30,140,0.18))'
          : 'rgba(12,18,42,0.7)',
        border: accent ? '1px solid rgba(0,140,255,0.3)' : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: accent
          ? '0 4px 32px rgba(0,0,0,0.4), 0 0 40px rgba(0,100,220,0.1)'
          : '0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
        ...style,
      }}
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
    const hoursSpent = Math.round(userProgress.reduce((acc, p) => acc + (p.time_spent || 0), 0) / 60) || completed * 2;
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-36 w-full rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      </div>
    );
  }

  const xp    = currentUser?.gamification_points || stats.completed * 50;
  const level = currentUser?.gamification_level  || Math.ceil(stats.completed / 5) + 1;

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Hero Banner ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-7 md:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(0,80,200,0.55) 0%, rgba(40,10,100,0.55) 60%, rgba(10,15,40,0.7) 100%)',
            border: '1px solid rgba(0,140,255,0.25)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 60px rgba(0,80,200,0.15)',
          }}
        >
          {/* Dot grid */}
          <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
          {/* Glow orb */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle, rgba(0,120,255,0.2) 0%, transparent 70%)' }} />

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4" style={{ color: '#ffaa40' }} />
                <span className="text-sm font-medium" style={{ color: 'rgba(180,210,255,0.8)' }}>Welcome to LearnFlow</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">
                Hello, {currentUser?.full_name?.split(' ')[0] || 'Operator'}
              </h1>
              <p className="text-sm capitalize" style={{ color: 'rgba(180,210,255,0.6)' }}>
                {currentUser?.role || 'user'} · {stats.completed} processes completed
              </p>
            </div>

            <div className="flex items-center gap-3">
              {[
                { label: 'XP Points', value: xp, color: '#ffaa40' },
                { label: 'Level',     value: `Lv.${level}`, color: '#40ffaa' },
              ].map(s => (
                <div key={s.label}
                     className="text-center rounded-xl px-5 py-3"
                     style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                  <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'rgba(180,210,255,0.55)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Processes Done', value: stats.completed,   icon: CheckCircle2, accent: '#34d399', glow: 'rgba(52,211,153,0.25)' },
            { label: 'In Progress',    value: stats.inProgress,   icon: Play,          accent: '#60b4ff', glow: 'rgba(96,180,255,0.25)' },
            { label: 'Certifications', value: stats.certsEarned, icon: Award,         accent: '#fbbf24', glow: 'rgba(251,191,36,0.25)' },
            { label: 'Hours Trained',  value: stats.hoursSpent,  icon: Clock,         accent: '#c084fc', glow: 'rgba(192,132,252,0.25)' },
          ].map((kpi, i) => (
            <div key={i} className="rounded-2xl p-5 transition-all duration-200 group cursor-default"
                 style={{
                   background: 'rgba(12,18,42,0.75)',
                   border: '1px solid rgba(255,255,255,0.07)',
                   backdropFilter: 'blur(16px)',
                   boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
                 }}
                 onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${kpi.accent}44`; e.currentTarget.style.boxShadow = `0 4px 32px rgba(0,0,0,0.4), 0 0 20px ${kpi.glow}`; }}
                 onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.35)'; }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                   style={{ background: `${kpi.accent}18`, border: `1px solid ${kpi.accent}30` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.accent }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: kpi.accent }}>{kpi.value}</div>
              <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Continue learning */}
            {inProgressProcesses.length > 0 && (
              <GlassCard>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Play className="w-4 h-4" style={{ color: '#60b4ff' }} />
                    <span className="text-white font-semibold text-sm">Continue Where You Left Off</span>
                  </div>
                  <div className="space-y-2">
                    {inProgressProcesses.map(({ process, completion_percentage, current_step }) => (
                      <Link key={process.id} to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
                        <div className="flex items-center gap-4 p-3.5 rounded-xl transition-all duration-150 group"
                             style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                             onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,128,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,128,255,0.2)'; }}
                             onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                               style={{ background: 'rgba(0,128,255,0.15)', border: '1px solid rgba(0,128,255,0.25)' }}>
                            <BookOpen className="w-4 h-4" style={{ color: '#60b4ff' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                              {process.title}
                            </div>
                            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              Step {(current_step || 0) + 1} of {process.steps?.length || '?'}
                            </div>
                            <Progress value={completion_percentage || 0} className="h-1 mt-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold" style={{ color: '#34d399' }}>{completion_percentage || 0}%</div>
                            <ChevronRight className="w-4 h-4 mt-1 ml-auto transition-colors" style={{ color: 'rgba(255,255,255,0.25)' }} />
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
                </div>
              </GlassCard>
            )}

            {/* Learning paths */}
            {pathsWithProgress.length > 0 && (
              <GlassCard>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4" style={{ color: '#c084fc' }} />
                      <span className="text-white font-semibold text-sm">Your Learning Paths</span>
                    </div>
                    <Link to={createPageUrl('LearningPaths')}>
                      <button className="text-xs font-medium flex items-center gap-1 transition-colors"
                              style={{ color: 'rgba(255,255,255,0.35)' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#60b4ff'}
                              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                        View All <ChevronRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {pathsWithProgress.map(path => (
                      <div key={path.id} className="p-4 rounded-xl"
                           style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-white font-medium text-sm">{path.title}</div>
                            <div className="text-xs mt-0.5 capitalize" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              {path.target_role?.replace('_', ' ')}
                            </div>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={path.pct === 100
                                  ? { background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }
                                  : { background: 'rgba(96,180,255,0.12)', color: '#60b4ff', border: '1px solid rgba(96,180,255,0.2)' }}>
                            {path.pct === 100 ? 'Complete' : `${path.done}/${path.total}`}
                          </span>
                        </div>
                        <Progress value={path.pct} className="h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{path.pct}% complete</span>
                          <Link to={createPageUrl(`LearningPathDetails?id=${path.id}`)}>
                            <button className="text-xs font-medium transition-colors" style={{ color: '#60b4ff' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#a0d4ff'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#60b4ff'}>
                              {path.pct > 0 ? 'Continue' : 'Start'} →
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Quick Access */}
            <GlassCard>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4" style={{ color: '#fbbf24' }} />
                  <span className="text-white font-semibold text-sm">Quick Access</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: 'Process Library', icon: BookOpen, href: 'ProcessLibrary', color: '#60b4ff' },
                    { label: 'Learning Paths',  icon: Route,     href: 'LearningPaths',  color: '#c084fc' },
                    { label: 'Certifications',  icon: Award,     href: 'Certifications', color: '#fbbf24' },
                    { label: 'Analytics',       icon: TrendingUp, href: 'Analytics',     color: '#34d399' },
                    { label: 'Notifications',   icon: Bell,      href: 'Notifications',  color: '#f87171' },
                    { label: 'Profile',         icon: Star,      href: 'Profile',        color: '#94a3b8' },
                  ].map(item => (
                    <Link key={item.href} to={createPageUrl(item.href)}>
                      <div className="p-3 rounded-xl text-center transition-all duration-150 cursor-pointer group"
                           style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                           onMouseEnter={e => { e.currentTarget.style.background = `${item.color}10`; e.currentTarget.style.borderColor = `${item.color}30`; }}
                           onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 transition-transform duration-150 group-hover:scale-110"
                             style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                          <item.icon className="w-4 h-4" style={{ color: item.color }} />
                        </div>
                        <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.label}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* ── Right panel ── */}
          <div className="space-y-5">

            {/* Recent Activity */}
            <GlassCard>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4" style={{ color: '#fbbf24' }} />
                  <span className="text-white font-semibold text-sm">Recent Activity</span>
                </div>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-6">
                    <Target className="w-9 h-9 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
                    <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Start a process to see activity</p>
                    <Link to={createPageUrl('ProcessLibrary')}>
                      <button className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-150"
                              style={{ background: 'rgba(0,128,255,0.2)', border: '1px solid rgba(0,128,255,0.3)', color: '#60b4ff' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,128,255,0.3)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,128,255,0.2)'}>
                        Browse Processes
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                             style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.2)' }}>
                          <CheckCircle2 className="w-4 h-4" style={{ color: '#34d399' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate">{item.process?.title}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Completed · +50 XP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Notifications */}
            <GlassCard>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" style={{ color: '#60b4ff' }} />
                    <span className="text-white font-semibold text-sm">Notifications</span>
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: 'linear-gradient(135deg, #ff4466, #cc1133)' }}>
                        {notifications.filter(n => !n.is_read).length}
                      </span>
                    )}
                  </div>
                  <Link to={createPageUrl('Notifications')}>
                    <button className="text-[11px] font-medium transition-colors"
                            style={{ color: 'rgba(255,255,255,0.3)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#60b4ff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                      View all
                    </button>
                  </Link>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-xs text-center py-3" style={{ color: 'rgba(255,255,255,0.25)' }}>No notifications</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.slice(0, 4).map(n => (
                      <div key={n.id} className="p-2.5 rounded-lg text-xs"
                           style={!n.is_read
                             ? { background: 'rgba(0,128,255,0.1)', border: '1px solid rgba(0,128,255,0.2)' }
                             : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="font-medium" style={{ color: n.is_read ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.85)' }}>
                          {n.message}
                        </div>
                        <div className="mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          {new Date(n.created_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Cert reminder */}
            {certifications.length > 0 && (
              <GlassCard accent>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" style={{ color: '#fbbf24' }} />
                    <span className="font-semibold text-sm" style={{ color: '#fde68a' }}>Certification Reminders</span>
                  </div>
                  <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Keep your certifications current to maintain qualification status.
                  </p>
                  <Link to={createPageUrl('Certifications')}>
                    <button className="w-full text-xs font-semibold py-2 rounded-xl transition-all duration-150"
                            style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.35)', color: '#fbbf24' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.2)'}>
                      View Certifications
                    </button>
                  </Link>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}