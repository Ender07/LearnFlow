import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CalendarDays, RefreshCw, Clock, Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const RISK_COLOR = (r) => r >= 70 ? 'text-red-400' : r >= 40 ? 'text-yellow-400' : 'text-green-400';
const RISK_BG = (r) => r >= 70 ? 'bg-red-500/10 border-red-500/20' : r >= 40 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-green-500/10 border-green-500/20';

export default function WorkloadLevelingPanel() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSchedule = async () => {
    setLoading(true);
    try {
      // Pull compliance gaps + user progress data
      const [userProgress, users, certifications] = await Promise.all([
        base44.entities.UserProgress.filter({ status: 'in_progress' }),
        base44.entities.User.list(),
        base44.entities.Certification.list(),
      ]);

      const expiringProgress = userProgress.filter(p => {
        if (!p.cert_expiry_date) return false;
        const daysLeft = Math.ceil((new Date(p.cert_expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 90 && daysLeft > 0;
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a workforce scheduling AI. Given the following list of training sessions that must be completed for compliance, generate an optimal weekly schedule that:
1. Avoids clustering too many trainings on the same day (max 3 per day)
2. Prioritizes high-risk (near-expiry) certifications first
3. Suggests mornings (8-11am) for complex technical training, afternoons for refreshers
4. Staggers team members so production is not disrupted (no more than 2 people per department in training at once)

Today is ${new Date().toDateString()}. There are ${users.length} team members.

Pending training needs: ${JSON.stringify(expiringProgress.slice(0, 20).map(p => ({
  user: users.find(u => u.id === p.created_by_id)?.full_name || 'Unknown',
  cert: certifications.find(c => c.id === p.certification_id)?.title || 'Certification',
  days_left: p.cert_expiry_date ? Math.ceil((new Date(p.cert_expiry_date) - new Date()) / 86400000) : 60,
})))}

Return a 2-week schedule with specific day assignments, time slots, risk rationale, and production impact notes.`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            production_impact_score: { type: 'number' },
            sessions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day_offset: { type: 'number' },
                  time_slot: { type: 'string' },
                  user_name: { type: 'string' },
                  training_title: { type: 'string' },
                  risk_score: { type: 'number' },
                  rationale: { type: 'string' },
                  duration_hours: { type: 'number' },
                }
              }
            },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setSchedule(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Group sessions by day_offset for calendar view
  const byDay = {};
  (schedule?.sessions || []).forEach(s => {
    const key = s.day_offset ?? 0;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(s);
  });
  const dayKeys = Object.keys(byDay).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
            Predictive Workload Leveling
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">AI-generated training schedule that balances compliance needs with production capacity</p>
        </div>
        <Button
          onClick={generateSchedule}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 text-white border-0"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
          {loading ? 'Optimizing…' : 'Generate Schedule'}
        </Button>
      </div>

      {!schedule && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700">
          <CalendarDays className="w-12 h-12 text-slate-600 mb-4" />
          <div className="text-slate-400 text-sm text-center max-w-sm">
            Generate an AI-optimized 2-week training schedule that prevents compliance gaps without disrupting production.
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mr-3" />
          <div>
            <div className="text-white text-sm font-medium">Optimizing schedule…</div>
            <div className="text-slate-500 text-xs">Balancing compliance, production, and team capacity</div>
          </div>
        </div>
      )}

      {schedule && !loading && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:col-span-2">
              <div className="text-slate-300 text-sm">{schedule.summary}</div>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex flex-col items-center justify-center">
              <div className="text-cyan-400 text-3xl font-bold">{schedule.production_impact_score ?? '—'}</div>
              <div className="text-slate-400 text-xs text-center mt-1">Production Impact Score<br/><span className="text-slate-600">(lower = better)</span></div>
            </div>
          </div>

          {/* Recommendations */}
          {schedule.recommendations?.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
              <div className="text-blue-400 font-medium text-sm mb-2">Scheduling Recommendations</div>
              {schedule.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-300 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  {r}
                </div>
              ))}
            </div>
          )}

          {/* Calendar view */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-semibold">2-Week Schedule</span>
              <Badge className="bg-slate-700 text-slate-300 border-slate-600 text-xs">{schedule.sessions?.length || 0} sessions</Badge>
            </div>
            <div className="divide-y divide-slate-700/40">
              {dayKeys.map(day => {
                const date = new Date();
                date.setDate(date.getDate() + day);
                const dayLabel = `${DAYS[date.getDay()]} ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                return (
                  <div key={day} className="p-4">
                    <div className="text-slate-300 text-xs font-semibold mb-3 uppercase tracking-wide">{dayLabel}</div>
                    <div className="space-y-2">
                      {byDay[day].map((s, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${RISK_BG(s.risk_score)}`}>
                          <div className="flex-shrink-0 text-center min-w-[52px]">
                            <div className="text-white text-xs font-semibold">{s.time_slot}</div>
                            <div className="text-slate-500 text-xs">{s.duration_hours}h</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white text-sm font-medium">{s.training_title}</span>
                              <span className={`text-xs font-bold ${RISK_COLOR(s.risk_score)}`}>Risk {s.risk_score}%</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Users className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-400 text-xs">{s.user_name}</span>
                            </div>
                            {s.rationale && (
                              <div className="text-slate-500 text-xs mt-1 italic">{s.rationale}</div>
                            )}
                          </div>
                          <Clock className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}