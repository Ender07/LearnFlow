import React, { useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, CheckCircle2, Clock, Award, BarChart3 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

export default function Analytics() {
  const { processes, userProgress, users, isLoading } = useData();

  const stats = useMemo(() => {
    const completed = userProgress.filter(p => p.status === 'completed').length;
    const inProg = userProgress.filter(p => p.status === 'in_progress').length;
    const totalTime = Math.round(userProgress.reduce((a, p) => a + (p.time_spent || 0), 0) / 60);
    const avgCompletion = userProgress.length > 0
      ? Math.round(userProgress.reduce((a, p) => a + (p.completion_percentage || 0), 0) / userProgress.length)
      : 0;
    return { completed, inProg, totalTime, avgCompletion };
  }, [userProgress]);

  const categoryData = useMemo(() => {
    const counts = {};
    userProgress.filter(p => p.status === 'completed').forEach(p => {
      const proc = processes.find(pr => pr.id === p.process_id);
      if (proc?.category) counts[proc.category] = (counts[proc.category] || 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({ name: cat.replace('_', ' '), completions: count })).sort((a, b) => b.completions - a.completions).slice(0, 7);
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
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const day = d.toLocaleDateString('en', { weekday: 'short' });
      const count = userProgress.filter(p => {
        if (!p.completed_date) return false;
        return new Date(p.completed_date).toDateString() === d.toDateString();
      }).length;
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
    <div className="min-h-screen bg-[#0f1729] p-6 space-y-6">
      <Skeleton className="h-12 w-48 bg-slate-700" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 bg-slate-700 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Analytics
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Training performance insights</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Completions', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'In Progress', value: stats.inProg, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Hours Trained', value: stats.totalTime, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Avg Completion', value: `${stats.avgCompletion}%`, icon: Award, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((s, i) => (
            <Card key={i} className="bg-[#1a2540] border border-slate-700/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Completions This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={completionTrend}>
                  <defs>
                    <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2540', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="completions" stroke="#3b82f6" fill="url(#cGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Completions by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Complete some processes to see data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a2540', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="completions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Progress by Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2540', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="in_progress" fill="#3b82f6" radius={[4, 4, 0, 0]} name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Hazard Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {hazardData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No completed processes yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={hazardData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {hazardData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a2540', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {users.length > 0 && (
          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Team Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.slice(0, 10).map((u, i) => (
                  <div key={u.id} className="flex items-center gap-4 p-3 rounded-lg bg-[#0f1729]">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-orange-700 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{u.full_name}</div>
                      <div className="text-slate-400 text-xs capitalize">{u.role}</div>
                    </div>
                    <div className="text-amber-400 font-bold text-sm">{u.gamification_points || 0} XP</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}