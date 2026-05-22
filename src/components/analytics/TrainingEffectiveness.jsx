import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Zap } from 'lucide-react';

export default function TrainingEffectiveness({ analytics }) {
  if (!analytics || !analytics.processStats) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap />Process Effectiveness</CardTitle>
          <p className="text-sm text-slate-500">Comparing average score vs. completion rate for high-risk processes.</p>
        </CardHeader>
        <CardContent className="text-center py-8 text-slate-500">
          Not enough data to calculate training effectiveness.
        </CardContent>
      </Card>
    );
  }

  const effectivenessData = analytics.processStats.map(process => ({
    x: process.completionRate,
    y: process.avgScore,
    z: process.totalAttempts, // Size of bubble represents total attempts
    name: process.name
  }));
  
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Zap />Process Effectiveness</CardTitle>
        <p className="text-sm text-slate-500">Comparing average score vs. completion rate for all processes.</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="Completion Rate" unit="%" />
            <YAxis type="number" dataKey="y" name="Average Score" unit="%" />
            <ZAxis type="number" dataKey="z" name="Attempts" range={[100, 1000]}/>
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Processes" data={effectivenessData} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}