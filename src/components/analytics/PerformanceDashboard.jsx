import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PerformanceDashboard({ analytics, users }) {
  
  const derivedData = useMemo(() => {
    if (!analytics || !analytics.userStats || !analytics.processStats || !analytics.learningTrends || !users) {
      return null;
    }

    const { learningTrends: dailyActivity, userStats, processStats } = analytics;

    const topPerformers = [...userStats]
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5)
      .map(u => {
        const user = users.find(usr => usr.email === u.email);
        return {
          id: user?.id,
          avatar_url: user?.avatar_url,
          ...u
        }
      });

    const riskAreas = [...processStats]
      .filter(p => p.completionRate < 70 || p.avgScore < 75)
      .sort((a, b) => a.effectiveness - b.effectiveness)
      .slice(0, 5);
      
    const departmentBreakdown = userStats.reduce((acc, user) => {
      if (!user.department) return acc;
      if (!acc[user.department]) {
        acc[user.department] = { completions: 0, scores: [], users: 0 };
      }
      acc[user.department].completions += user.completed;
      if (user.avgScore > 0) {
        acc[user.department].scores.push(user.avgScore);
      }
      acc[user.department].users += 1;
      return acc;
    }, {});
    
    const departmentData = Object.entries(departmentBreakdown).map(([name, data]) => {
      const avgScore = data.scores.length > 0
        ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        : 0;
      return { 
        name, 
        'Avg Score': avgScore.toFixed(1), 
        'Completions': data.completions 
      };
    });

    return { dailyActivity, topPerformers, riskAreas, departmentData };
  }, [analytics, users]);

  if (!derivedData) {
    return (
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="lg:col-span-2 h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const { dailyActivity, topPerformers, riskAreas, departmentData } = derivedData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp />Daily Activity</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyActivity} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateFormatted" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completions" stroke="#16a34a" name="Completions" />
              <Line type="monotone" dataKey="starts" stroke="#2563eb" name="New Starts" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck />Top Performers</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {topPerformers.map(user => (
            <div key={user.email} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar><AvatarImage src={user.avatar_url} /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                <div>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">{user.completed} completions</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp />Department Performance</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
             <BarChart data={departmentData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Avg Score" fill="#8884d8" />
                <Bar dataKey="Completions" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle />High-Risk Areas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {riskAreas.map(proc => (
            <div key={proc.id}>
              <p className="font-semibold text-sm truncate">{proc.name}</p>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Avg Score: <Badge variant="destructive">{Math.round(proc.avgScore)}%</Badge></span>
                <span>Completion: <Badge variant="secondary">{Math.round(proc.completionRate)}%</Badge></span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}