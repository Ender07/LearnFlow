import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2, Clock, Award, Zap, Play, AlertTriangle,
  ChevronRight, TrendingUp, Star, BookOpen, Route, Target,
  Bell, Trophy, Flame
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser, processes, userProgress, learningPaths, certifications, notifications, isLoading } = useData();

  const stats = useMemo(() => {
    const completed = userProgress.filter(p => p.status === 'completed').length;
    const inProgress = userProgress.filter(p => p.status === 'in_progress').length;
    const certsEarned = certifications.length;
    const hoursSpent = Math.round(userProgress.reduce((acc, p) => acc + (p.time_spent || 0), 0) / 60) || completed * 2;
    return { completed, inProgress, certsEarned, hoursSpent };
  }, [userProgress, certifications]);

  const inProgressProcesses = useMemo(() => {
    return userProgress
      .filter(p => p.status === 'in_progress')
      .slice(0, 3)
      .map(p => ({ ...p, process: processes.find(proc => proc.id === p.process_id) }))
      .filter(p => p.process);
  }, [userProgress, processes]);

  const recentActivity = useMemo(() => {
    return userProgress
      .filter(p => p.status === 'completed' && p.completed_date)
      .sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date))
      .slice(0, 5)
      .map(p => ({ ...p, process: processes.find(proc => proc.id === p.process_id) }))
      .filter(p => p.process);
  }, [userProgress, processes]);

  const pathsWithProgress = useMemo(() => {
    return learningPaths.slice(0, 3).map(path => {
      const pathProcs = (path.process_sequence || []).map(id => processes.find(p => p.id === id)).filter(Boolean);
      const done = pathProcs.filter(p => userProgress.some(up => up.process_id === p.id && up.status === 'completed')).length;
      return { ...path, total: pathProcs.length, done, pct: pathProcs.length > 0 ? Math.round((done / pathProcs.length) * 100) : 0 };
    });
  }, [learningPaths, processes, userProgress]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-32 w-full rounded-2xl bg-slate-700" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-slate-700" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-amber-400" />
                <span className="text-blue-200 text-sm font-medium">Welcome to LearnFlow</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                Hello, {currentUser?.full_name?.split(' ')[0] || 'Operator'}!
              </h1>
              <p className="text-blue-200 text-sm md:text-base capitalize">
                {currentUser?.role || 'user'} · {stats.completed} processes completed
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold text-amber-400">{currentUser?.gamification_points || stats.completed * 50}</div>
                <div className="text-xs text-blue-200">XP Points</div>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold text-emerald-400">Lv.{currentUser?.gamification_level || Math.ceil(stats.completed / 5) + 1}</div>
                <div className="text-xs text-blue-200">Level</div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Processes Done', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
            { label: 'In Progress', value: stats.inProgress, icon: Play, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
            { label: 'Certifications', value: stats.certsEarned, icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
            { label: 'Hours Trained', value: stats.hoursSpent, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
          ].map((kpi, i) => (
            <Card key={i} className={`bg-[#1a2540] border ${kpi.border} shadow-lg`}>
              <CardContent className="p-4 md:p-5">
                <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className={`text-2xl md:text-3xl font-bold ${kpi.color} mb-1`}>{kpi.value}</div>
                <div className="text-xs text-slate-400 font-medium">{kpi.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Continue Where You Left Off */}
            {inProgressProcesses.length > 0 && (
              <Card className="bg-[#1a2540] border border-slate-700/50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Play className="w-4 h-4 text-blue-400" />
                    Continue Where You Left Off
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {inProgressProcesses.map(({ process, completion_percentage, current_step }) => (
                    <Link key={process.id} to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
                      <div className="flex items-center gap-4 p-3 rounded-xl bg-[#0f1729] hover:bg-slate-800/50 transition-colors group">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">{process.title}</div>
                          <div className="text-slate-400 text-xs mt-1">Step {(current_step || 0) + 1} of {process.steps?.length || '?'}</div>
                          <Progress value={completion_percentage || 0} className="h-1 mt-2 bg-slate-700" />
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-emerald-400 text-sm font-semibold">{completion_percentage || 0}%</div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors mt-1" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Learning Paths Progress */}
            {pathsWithProgress.length > 0 && (
              <Card className="bg-[#1a2540] border border-slate-700/50 shadow-lg">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Route className="w-4 h-4 text-purple-400" />
                    Your Learning Paths
                  </CardTitle>
                  <Link to={createPageUrl('LearningPaths')}>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs">
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pathsWithProgress.map(path => (
                    <div key={path.id} className="p-4 rounded-xl bg-[#0f1729]">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-white font-medium text-sm">{path.title}</div>
                          <div className="text-slate-400 text-xs mt-1 capitalize">{path.target_role?.replace('_', ' ')}</div>
                        </div>
                        <Badge className={`text-xs ${path.pct === 100 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                          {path.pct === 100 ? 'Complete' : `${path.done}/${path.total}`}
                        </Badge>
                      </div>
                      <Progress value={path.pct} className="h-1.5 bg-slate-700" />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-slate-400 text-xs">{path.pct}% complete</span>
                        <Link to={createPageUrl(`LearningPathDetails?id=${path.id}`)}>
                          <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 text-xs p-1 h-auto">
                            {path.pct > 0 ? 'Continue' : 'Start'} →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Access */}
            <Card className="bg-[#1a2540] border border-slate-700/50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Quick Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Process Library', icon: BookOpen, href: 'ProcessLibrary', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Learning Paths', icon: Route, href: 'LearningPaths', color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    { label: 'Certifications', icon: Award, href: 'Certifications', color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Analytics', icon: TrendingUp, href: 'Analytics', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Notifications', icon: Bell, href: 'Notifications', color: 'text-rose-400', bg: 'bg-rose-400/10' },
                    { label: 'Profile', icon: Star, href: 'Profile', color: 'text-slate-400', bg: 'bg-slate-400/10' },
                  ].map(item => (
                    <Link key={item.href} to={createPageUrl(item.href)}>
                      <div className="p-3 rounded-xl bg-[#0f1729] hover:bg-slate-800/50 transition-colors text-center group cursor-pointer">
                        <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="text-xs text-slate-300 group-hover:text-white transition-colors">{item.label}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card className="bg-[#1a2540] border border-slate-700/50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-6">
                    <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">Start a process to see activity</p>
                    <Link to={createPageUrl('ProcessLibrary')}>
                      <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs">Browse Processes</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-xs font-medium truncate">{item.process?.title}</div>
                          <div className="text-slate-500 text-xs">Completed · +50 XP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#1a2540] border border-slate-700/50 shadow-lg">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  Notifications
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="bg-rose-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </CardTitle>
                <Link to={createPageUrl('Notifications')}>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs p-0 h-auto">View all</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-4">No notifications</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.slice(0, 4).map(n => (
                      <div key={n.id} className={`p-2 rounded-lg text-xs ${!n.is_read ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-slate-800/30'}`}>
                        <div className={`font-medium ${!n.is_read ? 'text-white' : 'text-slate-300'}`}>{n.message}</div>
                        <div className="text-slate-500 mt-0.5">{new Date(n.created_date).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {certifications.length > 0 && (
              <Card className="bg-amber-500/10 border border-amber-500/30 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-semibold text-sm">Certification Reminders</span>
                  </div>
                  <p className="text-slate-300 text-xs">Keep your certifications current to maintain qualification status.</p>
                  <Link to={createPageUrl('Certifications')}>
                    <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-white text-xs w-full">View Certifications</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}