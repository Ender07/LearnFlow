import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, MessageSquareWarning } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SafetyMonitor({ processes, userProgress, feedback }) {

  const ongoingHighRisk = useMemo(() => {
    return userProgress.filter(p => {
      const process = processes.find(proc => proc.id === p.process_id);
      return p.status === 'in_progress' && (process?.hazard_level === 'high' || process?.hazard_level === 'critical');
    });
  }, [userProgress, processes]);

  const recentSafetyFeedback = useMemo(() => {
    return feedback
      .filter(f => f.feedback_type === 'safety_concern')
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 5);
  }, [feedback]);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Ongoing High-Risk Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ongoingHighRisk.length > 0 ? ongoingHighRisk.map(p => {
              const process = processes.find(proc => proc.id === p.process_id);
              return (
                <div key={p.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-800">{process?.title}</p>
                    <p className="text-sm text-slate-600">User: {p.created_by.split('@')[0]}</p>
                  </div>
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {process?.hazard_level} Risk
                  </Badge>
                </div>
              );
            }) : <p className="text-slate-500 text-center py-4">No high-risk activities in progress.</p>}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-orange-500" />
            Recent Safety Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSafetyFeedback.length > 0 ? recentSafetyFeedback.map(f => (
              <div key={f.id} className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{f.created_by.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-800">{f.title}</p>
                  <p className="text-xs text-slate-500">
                    Reported {formatDistanceToNow(new Date(f.created_date), { addSuffix: true })}
                  </p>
                </div>
                <Badge variant={f.status === 'open' ? 'destructive' : 'secondary'} className="ml-auto">{f.status}</Badge>
              </div>
            )) : <p className="text-slate-500 text-center py-4">No recent safety concerns reported.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}