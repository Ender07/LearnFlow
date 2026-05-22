import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Check, X, Timer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformanceMetrics({ vrScenarios, userProgress, isLoading }) {
  const getScenarioTitle = (processId) => {
    const scenario = vrScenarios.find(s => s.id === processId);
    return scenario?.title || 'Unknown Scenario';
  };

  const performanceData = userProgress
    .filter(p => p.vr_simulation_results)
    .map(p => ({
      name: getScenarioTitle(p.process_id),
      score: p.vr_simulation_results.score || 0,
      errors: p.vr_simulation_results.errors || 0,
      time: p.vr_simulation_results.totalTime || 0,
    }))
    .slice(0, 5); // Show last 5 VR sessions

  return (
    <Card className="bg-slate-800/50 border-slate-700 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          VR Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-slate-400">Loading performance data...</p>
        ) : performanceData.length === 0 ? (
          <p className="text-center text-slate-400">No VR simulation data available yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-slate-300">Recent Session Scores</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#475569",
                    }}
                  />
                  <Bar dataKey="score" fill="rgba(167, 139, 250, 0.6)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4 text-slate-300">Latest Attempts</h3>
              <div className="space-y-3">
                {performanceData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <p className="font-medium text-slate-300">{item.name}</p>
                    <div className="flex gap-4">
                      <Badge variant="outline" className="border-green-400 text-green-400">
                        <Check className="w-3 h-3 mr-1" /> {item.score}%
                      </Badge>
                      <Badge variant="outline" className="border-red-400 text-red-400">
                        <X className="w-3 h-3 mr-1" /> {item.errors}
                      </Badge>
                      <Badge variant="outline" className="border-blue-400 text-blue-400">
                        <Timer className="w-3 h-3 mr-1" /> {Math.round(item.time)}s
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}