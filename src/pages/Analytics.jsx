import React, { useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, CheckCircle2, Clock, Award, BarChart3 } from 'lucide-react';

const COLORS = ['#60b4ff', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#22d3ee'];

function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl ${className}`}
         style={{ background: 'rgba(12,18,42,0.7)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>
      {children}
    </div>
  );
}

const tooltipStyle = { backgroundColor: 'rgba(12,18,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(16px)' };

export default function Analytics() {
  const { processes, userProgress, users, isLoading } = useData();

  const stats = useMemo(() => {
    const completed    = userProgress.filter(p => p.status === 'completed').length;
    const inProg       = userProgress.filter(p => p.status === 'in_progress').length;
    const totalTime    = Math.round(userProgress.reduce((a, p) => a + (p.time_spent || 0), 0) / 60);
    const avgCompletion = userProgress.length > 0
      ? Math.round(userProgress.reduce((a, p) => a + (p.completion_percentage || 0), 0) / userProgress.length) : 0;
    return { completed, inProg, totalTime, avgCompletion };
  }, [userProgress]);

  const categoryData = useMemo(() => {
    const counts = {};
    userProgress.filter(p => p.status === 'completed').forEach(p => {
      const proc = processes.find(pr => pr.id === p.process_id);
      if (proc?.category) counts[proc.category] = (counts[proc.category] || 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({ name: cat.replace('_', ' '), completions: count }))
      .sort((a, b) => b.completions - a.completions).slice(0, 7);
  }, [userProgress, processes]);

  const difficultyData = useMemo(() => {
    const data = {};
    userProgress.forEach(p => {
      const proc = processes.find(pr => pr.id === p.process_id);
      if (!proc?.difficulty_level) return;
      if (!data[proc.difficulty_level]) data[proc.difficulty_level] = { name: proc.difficulty_level, completed: 0, in_progress: 0 };
      if (p.status === 'completed') data[proc.difficulty_level].completed++;
      else if (p.status === 'in_progress') data[proc.difficulty_level].in_progress++;
    });
    return ['beginner', 'intermediate', 'advanced', 'expert'].map(d => data[d] || { name: d, completed: 0, in_progress: 0 });
  }, [userProgress, processes]);

  const completionTrend = useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const day = d.toLocaleDateString('en', { weekday: 'short' });
      const count = userProgress.filter(p => p.completed_date && new Date(p.completed_date).toDateString() === d.toDateString()).length;
      return { day, completions: count };
    });
  }, [userProgress]);

  const hazardData = useMemo(() => {
    const counts = {};
    userProgress.filter(p => p.status === 'completed').forEach(p => {
      const proc = processes.find(pr => pr.id === p.process_id);
      const h = proc?.hazard_level || 'low';
      counts[h] = (counts[h] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [userProgress, processes]);

  if (isLoading) return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: 'hsl(var(--background))' }}>
      <Skeleton className="h-12 w-48 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(192,132,252,0.2)', border: '1px solid rgba(192,132,252,0.3)' }}>
              <BarChart3 className="w-5 h-5" style={{ color: '#c084fc' }} />
            </div>
            Analytics
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Training performance insights</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Completions', value: stats.completed, icon: CheckCircle2, color: '#34d399', glow: 'rgba(52,211,153,0.2)' },
            { label: 'In Progress', value: stats.inProg,    icon: TrendingUp,   color: '#60b4ff', glow: 'rgba(96,180,255,0.2)' },
            { label: 'Hours Trained', value: stats.totalTime, icon: Clock,      color: '#fbbf24', glow: 'rgba(251,191,36,0.2)' },
            { label: 'Avg Completion', value: `${stats.avgCompletion}%`, icon: Award, color: '#c084fc', glow: 'rgba(192,132,252,0.2)' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4 flex items-center gap-3"
                 style={{ background: 'rgba(12,18,42,0.75)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: s.glow, border: `1px solid ${s.color}30` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard>
            <div className="p-5">
              <div className="text-white font-semibold text-sm mb-4">Completions This Week</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={completionTrend}>
                  <defs>
                    <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0080ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0080ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="completions" stroke="#60b4ff" fill="url(#cGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5">
              <div className="text-white font-semibold text-sm mb-4">Completions by Category</div>
              {categoryData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Complete some processes to see data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="completions" fill="#60b4ff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5">
              <div className="text-white font-semibold text-sm mb-4">Progress by Difficulty</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                  <Bar dataKey="completed"   fill="#34d399" radius={[6, 6, 0, 0]} name="Completed" />
                  <Bar dataKey="in_progress" fill="#60b4ff" radius={[6, 6, 0, 0]} name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5">
              <div className="text-white font-semibold text-sm mb-4">Hazard Level Distribution</div>
              {hazardData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>No completed processes yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={hazardData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value"
                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}>
                      {hazardData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

        {users.length > 0 && (
          <GlassCard>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4" style={{ color: '#60b4ff' }} />
                <span className="text-white font-semibold text-base">Team Leaderboard</span>
              </div>
              <div className="space-y-2">
                {users.slice(0, 10).map((u, i) => (
                  <div key={u.id} className="flex items-center gap-4 p-3 rounded-xl transition-all"
                       style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                         style={i === 0 ? { background: 'rgba(251,191,36,0.3)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }
                                : i === 1 ? { background: 'rgba(148,163,184,0.2)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.3)' }
                                : i === 2 ? { background: 'rgba(180,100,50,0.2)', color: '#cd7f32', border: '1px solid rgba(180,100,50,0.3)' }
                                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{u.full_name}</div>
                      <div className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.3)' }}>{u.role}</div>
                    </div>
                    <div className="font-bold text-sm" style={{ color: '#fbbf24' }}>{u.gamification_points || 0} XP</div>
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