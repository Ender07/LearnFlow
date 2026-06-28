import React, { useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Users, Award, BookOpen, CheckCircle2 } from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-black/[0.06] ${className}`}
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color, bg }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>{title}</h3>
    </div>
  );
}

export default function Analytics() {
  const { processes, userProgress, users, isLoading } = useData();

  const stats = useMemo(() => {
    const completed   = userProgress.filter(p => p.status === 'completed').length;
    const inProgress  = userProgress.filter(p => p.status === 'in_progress').length;
    const totalTime   = Math.round(userProgress.reduce((a, p) => a + (p.time_spent || 0), 0) / 60);
    const completionRate = userProgress.length > 0 ? Math.round((completed / userProgress.length) * 100) : 0;
    return { completed, inProgress, totalTime, completionRate };
  }, [userProgress]);

  const categoryData = useMemo(() => {
    const map = {};
    processes.forEach(p => {
      const cat = p.category?.replace('_', ' ') || 'Uncategorized';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [processes]);

  const difficultyData = useMemo(() => {
    const map = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    processes.forEach(p => { if (map[p.difficulty_level] !== undefined) map[p.difficulty_level]++; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [processes]);

  const trendData = useMemo(() => {
    const months = [...Array(6)].map((_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - 5 + i);
      return { month: d.toLocaleString('en', { month: 'short' }), completions: 0, started: 0 };
    });
    userProgress.forEach(p => {
      if (p.completed_date) {
        const m = new Date(p.completed_date).toLocaleString('en', { month: 'short' });
        const found = months.find(mo => mo.month === m);
        if (found) found.completions++;
      }
    });
    return months;
  }, [userProgress]);

  const leaderboard = useMemo(() => users
    .filter(u => u.gamification_points > 0 || userProgress.some(p => p.created_by_id === u.id))
    .map(u => ({
      ...u,
      completions: userProgress.filter(p => p.created_by_id === u.id && p.status === 'completed').length,
    }))
    .sort((a, b) => (b.gamification_points || 0) - (a.gamification_points || 0))
    .slice(0, 10),
  [users, userProgress]);

  if (isLoading) return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" style={{ background: 'var(--canvas)' }}>
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl bg-slate-100" />)}
    </div>
  );

  const KPIs = [
    { label: 'Total Completions', value: stats.completed,       icon: CheckCircle2, color: '#10B981', bg: '#D1FAE5' },
    { label: 'In Progress',        value: stats.inProgress,      icon: BookOpen,     color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Hours Trained',      value: stats.totalTime,       icon: TrendingUp,   color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Completion Rate',    value: `${stats.completionRate}%`, icon: BarChart3, color: '#8B5CF6', bg: '#EDE9FE' },
  ];

  const tooltipStyle = {
    contentStyle: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 13 },
    cursor: { fill: 'rgba(79,70,229,0.04)' },
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--canvas)' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <p className="label-xs mb-1">Team</p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Platform-wide training metrics</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {KPIs.map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-black/[0.06] stat-accent-line"
                 style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)', borderLeftColor: kpi.color }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: kpi.bg }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div className="text-3xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{kpi.value}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        <Card>
          <SectionHeader icon={TrendingUp} title="Completion Trend (6 months)" color="#4F46E5" bg="#EEF2FF" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="completionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="completions" stroke="#4F46E5" strokeWidth={2} fill="url(#completionsGrad)" name="Completions" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Category distribution */}
          <Card>
            <SectionHeader icon={BookOpen} title="By Category" color="#8B5CF6" bg="#EDE9FE" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Processes">
                  {categoryData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Difficulty pie */}
          <Card>
            <SectionHeader icon={BarChart3} title="Difficulty Distribution" color="#F59E0B" bg="#FEF3C7" />
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={difficultyData} cx="50%" cy="50%" outerRadius={80} innerRadius={50}
                     dataKey="value" nameKey="name" paddingAngle={3}>
                  {difficultyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: '#475569' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <Card>
            <SectionHeader icon={Users} title="Team Leaderboard" color="#10B981" bg="#D1FAE5" />
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <table className="data-table w-full">
                <thead>
                  <tr><th>#</th><th>Member</th><th>Completions</th><th>XP Points</th><th>Role</th></tr>
                </thead>
                <tbody>
                  {leaderboard.map((u, i) => (
                    <tr key={u.id}>
                      <td>
                        <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
                          i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                        }`}>
                          {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                               style={{ background: 'var(--brand-primary)' }}>
                            {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.full_name || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td><span className="font-semibold" style={{ color: '#10B981' }}>{u.completions}</span></td>
                      <td><span className="font-bold" style={{ color: '#F59E0B' }}>{u.gamification_points || 0}</span></td>
                      <td>
                        <span className={`inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}