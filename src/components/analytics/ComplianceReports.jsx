import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ComplianceReports({ analytics, processes }) {
  if (!analytics || !analytics.processStats) {
    return (
      <Card>
        <CardHeader><CardTitle>Compliance Status</CardTitle></CardHeader>
        <CardContent>No compliance data available.</CardContent>
      </Card>
    );
  }

  const safetyProcesses = processes.filter(p => p.category === 'safety' || p.hazard_level === 'high' || p.hazard_level === 'critical');
  
  const safetyCompliance = analytics.processStats
    .filter(p => p.category === 'safety')
    .reduce((acc, p) => acc + p.completionRate, 0) / 
    analytics.processStats.filter(p => p.category === 'safety').length || 0;

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldCheck />Compliance Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Overall Safety Compliance</h4>
            <span className="font-bold text-lg">{Math.round(safetyCompliance)}%</span>
          </div>
          <Progress value={safetyCompliance} />
        </div>
        <div>
            <h4 className="font-semibold mb-3">Safety-Critical Processes</h4>
            <div className="space-y-3">
                {safetyProcesses.map(p => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <p className="font-medium">{p.title}</p>
                            <Badge variant={p.hazard_level === 'high' ? "destructive" : "secondary"}>{p.hazard_level}</Badge>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}