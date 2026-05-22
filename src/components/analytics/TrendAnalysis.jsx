import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TrendAnalysis({ analytics }) {
  if (!analytics || !analytics.weeklyTrends) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8 text-slate-500">
            Insufficient data for trend analysis.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { weeklyTrends } = analytics;
  
  // Calculate trend indicators
  const geteTrendIndicator = (current, previous) => {
    if (current > previous) return { icon: TrendingUp, color: 'text-green-500', direction: 'up' };
    if (current < previous) return { icon: TrendingDown, color: 'text-red-500', direction: 'down' };
    return { icon: Minus, color: 'text-slate-500', direction: 'stable' };
  };

  const completionsTrend = geteTrendIndicator(
    weeklyTrends[weeklyTrends.length - 1]?.completions || 0,
    weeklyTrends[weeklyTrends.length - 2]?.completions || 0
  );

  const scoreTrend = geteTrendIndicator(
    weeklyTrends[weeklyTrends.length - 1]?.avgScore || 0,
    weeklyTrends[weeklyTrends.length - 2]?.avgScore || 0
  );

  const usersTrend = geteTrendIndicator(
    weeklyTrends[weeklyTrends.length - 1]?.activeUsers || 0,
    weeklyTrends[weeklyTrends.length - 2]?.activeUsers || 0
  );

  return (
    <div className="space-y-6">
      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completion Trend</p>
                <p className="text-2xl font-bold text-slate-900">
                  {weeklyTrends[weeklyTrends.length - 1]?.completions || 0}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <completionsTrend.icon className={`w-5 h-5 ${completionsTrend.color}`} />
                <Badge variant={completionsTrend.direction === 'up' ? 'default' : completionsTrend.direction === 'down' ? 'destructive' : 'secondary'}>
                  {completionsTrend.direction}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Score Trend</p>
                <p className="text-2xl font-bold text-slate-900">
                  {weeklyTrends[weeklyTrends.length - 1]?.avgScore || 0}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                <scoreTrend.icon className={`w-5 h-5 ${scoreTrend.color}`} />
                <Badge variant={scoreTrend.direction === 'up' ? 'default' : scoreTrend.direction === 'down' ? 'destructive' : 'secondary'}>
                  {scoreTrend.direction}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Engagement Trend</p>
                <p className="text-2xl font-bold text-slate-900">
                  {weeklyTrends[weeklyTrends.length - 1]?.activeUsers || 0}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <usersTrend.icon className={`w-5 h-5 ${usersTrend.color}`} />
                <Badge variant={usersTrend.direction === 'up' ? 'default' : usersTrend.direction === 'down' ? 'destructive' : 'secondary'}>
                  {usersTrend.direction}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Training Completions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="completions" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Performance Score Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgScore" stroke="#10B981" strokeWidth={3} name="Average Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Engagement Trend */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>User Engagement Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeUsers" stroke="#8B5CF6" strokeWidth={3} name="Active Users" />
              <Line type="monotone" dataKey="completions" stroke="#F59E0B" strokeWidth={2} name="Completions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}