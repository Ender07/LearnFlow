import React, { useState, useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

export default function SupervisorDashboard() {
  const { currentUser, users, reviews, processes, userProgress, isLoading, refetchData } = useData();
  const [observations, setObservations] = useState({});
  const [ratings, setRatings] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const pending = useMemo(() => reviews.filter(r => r.review_status === 'pending'), [reviews]);

  const teamProgress = useMemo(() => {
    return users.map(u => {
      const uProgress = userProgress.filter(p => p.created_by_id === u.id);
      const completed = uProgress.filter(p => p.status === 'completed').length;
      const inProg = uProgress.filter(p => p.status === 'in_progress').length;
      const overdue = uProgress.filter(p => p.due_date && new Date(p.due_date) < new Date() && p.status !== 'completed').length;
      return { ...u, completed, inProg, overdue };
    });
  }, [users, userProgress]);

  const handleReview = async (review, status) => {
    setSubmitting(review.id);
    try {
      await base44.entities.SupervisorReview.update(review.id, {
        review_status: status,
        competency_rating: ratings[review.id] || 3,
        observations: observations[review.id] || '',
      });
      await refetchData();
    } catch (e) { console.error(e); }
    finally { setSubmitting(null); }
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'supervisor')) {
    return (
      <div className="min-h-screen bg-[#0f1729] flex items-center justify-center p-6">
        <Card className="bg-[#1a2540] border border-rose-500/30 max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">Access Restricted</h3>
            <p className="text-slate-400">This dashboard is only available to supervisors and administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f1729] p-6 space-y-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 bg-slate-700 rounded-xl" />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              Supervisor Dashboard
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Manage team training and reviews</p>
          </div>
          {pending.length > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm py-1.5 px-3">
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />{pending.length} Pending Reviews
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Team Members', value: users.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Pending Reviews', value: pending.length, icon: ClipboardCheck, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Total Completions', value: userProgress.filter(p => p.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Active Trainings', value: userProgress.filter(p => p.status === 'in_progress').length, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
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

        <Tabs defaultValue="reviews">
          <TabsList className="bg-[#1a2540] border border-slate-700 w-full grid grid-cols-2">
            <TabsTrigger value="reviews" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-400">
              Pending Reviews {pending.length > 0 && <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5">{pending.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-400">
              Team Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-4">
            {pending.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold">All caught up!</h3>
                <p className="text-slate-400 text-sm mt-1">No pending reviews</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map(review => {
                  const proc = processes.find(p => p.id === review.process_id);
                  return (
                    <Card key={review.id} className="bg-[#1a2540] border border-amber-500/20">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-white font-semibold">{proc?.title || 'Process Review'}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs capitalize">{review.review_type?.replace('_', ' ')}</Badge>
                              <span className="text-slate-400 text-xs">{new Date(review.created_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Pending</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-slate-400 text-xs mb-1 block">Competency Rating (1–5)</label>
                            <Select value={String(ratings[review.id] || '3')} onValueChange={v => setRatings(r => ({ ...r, [review.id]: Number(v) }))}>
                              <SelectTrigger className="bg-[#0f1729] border-slate-600 text-white h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1a2540] border-slate-600 text-white">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <SelectItem key={n} value={String(n)}>{n} — {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][n - 1]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-slate-400 text-xs mb-1 block">Observations (optional)</label>
                            <Textarea value={observations[review.id] || ''} onChange={e => setObservations(o => ({ ...o, [review.id]: e.target.value }))}
                              placeholder="Add observations..." className="bg-[#0f1729] border-slate-600 text-white text-sm resize-none h-9 py-1.5" />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button size="sm" onClick={() => handleReview(review, 'approved')} disabled={submitting === review.id} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Approve
                          </Button>
                          <Button size="sm" onClick={() => handleReview(review, 'requires_remediation')} disabled={submitting === review.id} className="bg-amber-600 hover:bg-amber-700 text-white">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />Needs Remediation
                          </Button>
                          <Button size="sm" onClick={() => handleReview(review, 'rejected')} disabled={submitting === review.id} variant="outline" className="border-rose-500/50 text-rose-400 hover:bg-rose-500/10">
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="team" className="mt-4">
            {teamProgress.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-white font-semibold">No team members</h3>
                <p className="text-slate-400 text-sm mt-1">Invite users to see their progress here</p>
              </div>
            ) : (
              <Card className="bg-[#1a2540] border border-slate-700/50">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left p-4 text-xs text-slate-400 font-medium">Member</th>
                          <th className="text-left p-4 text-xs text-slate-400 font-medium">Role</th>
                          <th className="text-center p-4 text-xs text-slate-400 font-medium">Completed</th>
                          <th className="text-center p-4 text-xs text-slate-400 font-medium">In Progress</th>
                          <th className="text-center p-4 text-xs text-slate-400 font-medium">Overdue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamProgress.map(u => (
                          <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">
                                  {u.full_name?.charAt(0) || 'U'}
                                </div>
                                <span className="text-white text-sm">{u.full_name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs capitalize">{u.role}</Badge>
                            </td>
                            <td className="p-4 text-center"><span className="text-emerald-400 font-semibold">{u.completed}</span></td>
                            <td className="p-4 text-center"><span className="text-blue-400 font-semibold">{u.inProg}</span></td>
                            <td className="p-4 text-center"><span className={`font-semibold ${u.overdue > 0 ? 'text-rose-400' : 'text-slate-500'}`}>{u.overdue}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}