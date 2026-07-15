import React, { useState } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Award, Star, TrendingUp, Shield, Edit3, Save, X, Zap } from 'lucide-react';

export default function Profile() {
  const { currentUser, userProgress, certifications, badges, ledgerEntries, isLoading, refetchData } = useData();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const startEdit = () => {
    setForm({ full_name: currentUser?.full_name || '' });
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(form);
      await refetchData();
      setEditing(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const completed = userProgress.filter(p => p.status === 'completed').length;
  const myLedger = (ledgerEntries || []).filter(e => e.user_id === currentUser?.id);
  const points = myLedger.reduce((sum, e) => sum + (e.points || 0), 0) || completed * 50;
  const level = Math.max(1, Math.floor(points / 1000) + 1);
  const nextLevelPoints = level * 1000;
  const levelProgress = Math.min((points % 1000) / 10, 100);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f1729] p-6 space-y-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 bg-slate-700 rounded-xl" />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          Profile
        </h1>

        <Card className="bg-[#1a2540] border border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl font-bold text-white">
                {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <Input value={form.full_name || ''} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      className="bg-[#0f1729] border-slate-600 text-white max-w-xs" placeholder="Full Name" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Save className="w-3 h-3 mr-1" />{saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="text-slate-400">
                        <X className="w-3 h-3 mr-1" />Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">{currentUser?.full_name || 'User'}</h2>
                      <p className="text-slate-400 text-sm mt-0.5">{currentUser?.email}</p>
                      <Badge className={`mt-2 text-xs ${currentUser?.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                        <Shield className="w-2.5 h-2.5 mr-1" />{currentUser?.role || 'user'}
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost" onClick={startEdit} className="text-slate-400 hover:text-white">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600/20 to-indigo-700/20 border border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Level {level} — {points} XP
              </h3>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {points} / {nextLevelPoints} XP
              </Badge>
            </div>
            <Progress value={levelProgress} className="h-3 bg-slate-700/50" />
            <p className="text-slate-400 text-xs mt-2">{Math.round(nextLevelPoints - (points % 1000))} XP to next level</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Processes Done', value: completed, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Certifications', value: certifications.length, icon: Award, color: 'text-amber-400' },
            { label: 'Total XP', value: points, icon: Star, color: 'text-blue-400' },
            { label: 'Current Level', value: level, icon: Zap, color: 'text-purple-400' },
          ].map((s, i) => (
            <Card key={i} className="bg-[#1a2540] border border-slate-700/50">
              <CardContent className="p-4 text-center">
                <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {badges.length > 0 && (
          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Earned Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badges.map(badge => (
                  <div key={badge.id} className="bg-[#0f1729] rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white text-sm font-medium">{badge.title}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{badge.points} XP</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {myLedger.length > 0 && (
          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-400" /> Points History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {myLedger.slice().reverse().map(entry => (
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                    <div>
                      <div className="text-white text-sm font-medium">{entry.reason}</div>
                      {entry.details && <div className="text-slate-500 text-xs">{entry.details}</div>}
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">+{entry.points} XP</span>
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