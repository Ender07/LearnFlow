import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Play, CheckCircle2, Clock, Award, BookOpen, AlertTriangle,
  RotateCcw, Download, CalendarDays, Target, TrendingUp
} from 'lucide-react';

export default function MyLearning() {
  const { userProgress, processes, certifications, isLoading } = useData();

  const enriched = useMemo(() => {
    return userProgress.map(p => ({
      ...p,
      process: processes.find(proc => proc.id === p.process_id)
    })).filter(p => p.process);
  }, [userProgress, processes]);

  const inProgress = enriched.filter(p => p.status === 'in_progress');
  const completed = enriched.filter(p => p.status === 'completed');
  const assigned = enriched.filter(p => p.assigned_by && p.status !== 'completed');

  const stats = {
    totalCompletions: completed.length,
    totalTime: Math.round(userProgress.reduce((a, p) => a + (p.time_spent || 0), 0) / 60),
    certsEarned: certifications.length,
    avgScore: completed.length > 0
      ? Math.round(completed.reduce((a, p) => a + (p.quiz_score || 80), 0) / completed.length)
      : 0,
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f1729] p-6 space-y-6">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 bg-slate-700 rounded-xl" />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            My Learning
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Track your training progress and achievements</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Completions', value: stats.totalCompletions, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Hours Spent', value: stats.totalTime, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Certs Earned', value: stats.certsEarned, icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Avg Score', value: stats.avgScore ? `${stats.avgScore}%` : 'N/A', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((s, i) => (
            <Card key={i} className="bg-[#1a2540] border border-slate-700/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
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

        {/* Tabs */}
        <Tabs defaultValue="in_progress">
          <TabsList className="bg-[#1a2540] border border-slate-700 w-full grid grid-cols-4">
            <TabsTrigger value="in_progress" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-xs md:text-sm">
              In Progress {inProgress.length > 0 && <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1">{inProgress.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 text-xs md:text-sm">
              Completed
            </TabsTrigger>
            <TabsTrigger value="assigned" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-slate-400 text-xs md:text-sm">
              Assigned
            </TabsTrigger>
            <TabsTrigger value="certifications" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400 text-xs md:text-sm">
              Certs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in_progress" className="mt-4">
            {inProgress.length === 0 ? (
              <EmptyState icon={Play} title="Nothing in progress" desc="Browse the process library to start learning">
                <Link to={createPageUrl('ProcessLibrary')}><Button className="bg-blue-600 hover:bg-blue-700 text-white mt-3">Browse Processes</Button></Link>
              </EmptyState>
            ) : (
              <div className="space-y-3">
                {inProgress.map(item => (
                  <Card key={item.id} className="bg-[#1a2540] border border-slate-700/50 hover:border-blue-500/50 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold mb-1 truncate">{item.process?.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                            <span className="capitalize">{item.process?.category?.replace('_', ' ')}</span>
                            <span>·</span>
                            <span>Step {(item.current_step || 0) + 1} of {item.process?.steps?.length || '?'}</span>
                            {item.due_date && (
                              <span className={`flex items-center gap-1 ${new Date(item.due_date) < new Date() ? 'text-rose-400' : 'text-amber-400'}`}>
                                <CalendarDays className="w-3 h-3" />
                                Due {new Date(item.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <Progress value={item.completion_percentage || 0} className="h-1.5 bg-slate-700" />
                          <div className="text-xs text-slate-400 mt-1">{item.completion_percentage || 0}% complete</div>
                        </div>
                        <Link to={createPageUrl(`ProcessExecution?id=${item.process_id}`)}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0">
                            <Play className="w-3 h-3 mr-1" /> Continue
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {completed.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="No completions yet" desc="Finish your first process to see it here" />
            ) : (
              <div className="space-y-3">
                {completed.map(item => (
                  <Card key={item.id} className="bg-[#1a2540] border border-slate-700/50">
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white font-semibold truncate">{item.process?.title}</h3>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Completed {item.completed_date ? new Date(item.completed_date).toLocaleDateString() : 'recently'}
                            {item.quiz_score && ` · Score: ${item.quiz_score}%`}
                          </div>
                        </div>
                      </div>
                      <Link to={createPageUrl(`ProcessExecution?id=${item.process_id}`)}>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:text-white flex-shrink-0">
                          <RotateCcw className="w-3 h-3 mr-1" /> Retake
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assigned" className="mt-4">
            {assigned.length === 0 ? (
              <EmptyState icon={Target} title="No assigned training" desc="Your supervisor will assign training here" />
            ) : (
              <div className="space-y-3">
                {assigned.map(item => {
                  const isOverdue = item.due_date && new Date(item.due_date) < new Date();
                  const isDueSoon = item.due_date && !isOverdue && (new Date(item.due_date) - new Date()) < 7 * 24 * 60 * 60 * 1000;
                  return (
                    <Card key={item.id} className={`bg-[#1a2540] border ${isOverdue ? 'border-rose-500/50' : isDueSoon ? 'border-amber-500/50' : 'border-slate-700/50'}`}>
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isOverdue ? 'text-rose-400' : isDueSoon ? 'text-amber-400' : 'text-slate-500'}`} />
                          <div className="min-w-0">
                            <h3 className="text-white font-semibold truncate">{item.process?.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              {isOverdue && <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">Overdue</Badge>}
                              {isDueSoon && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Due Soon</Badge>}
                              {item.due_date && <span className="text-xs text-slate-400">Due {new Date(item.due_date).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                        <Link to={createPageUrl(`ProcessExecution?id=${item.process_id}`)}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0">
                            <Play className="w-3 h-3 mr-1" /> Start
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="certifications" className="mt-4">
            {certifications.length === 0 ? (
              <EmptyState icon={Award} title="No certifications yet" desc="Complete learning paths to earn certifications">
                <Link to={createPageUrl('LearningPaths')}><Button className="bg-amber-600 hover:bg-amber-700 text-white mt-3">View Paths</Button></Link>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map(cert => (
                  <Card key={cert.id} className="bg-[#1a2540] border border-amber-500/30">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Award className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold mb-1">{cert.title}</h3>
                          <p className="text-slate-400 text-xs mb-2">{cert.issuing_authority || 'Internal'}</p>
                          {cert.validity_period_months && (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                              Valid {cert.validity_period_months} months
                            </Badge>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:text-white flex-shrink-0">
                          <Download className="w-3 h-3 mr-1" /> Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, children }) {
  return (
    <div className="text-center py-16">
      <Icon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
      <p className="text-slate-400 text-sm">{desc}</p>
      {children}
    </div>
  );
}