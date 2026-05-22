import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Eye, TrendingUp, Award, AlertTriangle } from 'lucide-react';

export default function Benchmarking({ analytics }) {
  const [benchmarkType, setBenchmarkType] = useState('industry');
  
  if (!analytics) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Performance Benchmarking</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-slate-500">
          No benchmarking data available.
        </CardContent>
      </Card>
    );
  }

  // Simulated industry benchmarks (in a real app, this would come from external data)
  const industryBenchmarks = {
    engagementRate: 75,
    averageScore: 82,
    completionRate: 88,
    timeToCompletion: 45
  };

  const comparisonData = [
    {
      metric: 'Engagement Rate',
      current: analytics.engagementRate,
      benchmark: industryBenchmarks.engagementRate,
      unit: '%'
    },
    {
      metric: 'Average Score',
      current: analytics.averageScore,
      benchmark: industryBenchmarks.averageScore,
      unit: '%'
    },
    {
      metric: 'Completion Rate',
      current: analytics.processStats.length > 0 
        ? Math.round(analytics.processStats.reduce((acc, p) => acc + p.completionRate, 0) / analytics.processStats.length)
        : 0,
      benchmark: industryBenchmarks.completionRate,
      unit: '%'
    }
  ];

  const radarData = comparisonData.map(item => ({
    metric: item.metric,
    current: item.current,
    benchmark: item.benchmark
  }));

  const getPerformanceIndicator = (current, benchmark) => {
    const ratio = current / benchmark;
    if (ratio >= 1.1) return { status: 'excellent', color: 'bg-green-100 text-green-800', icon: Award };
    if (ratio >= 0.9) return { status: 'good', color: 'bg-blue-100 text-blue-800', icon: TrendingUp };
    if (ratio >= 0.7) return { status: 'needs improvement', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { status: 'critical', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
  };

  return (
    <div className="space-y-6">
      {/* Benchmark Selection */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Performance Benchmarking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Compare against:</span>
            <Select value={benchmarkType} onValueChange={setBenchmarkType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industry">Industry Average</SelectItem>
                <SelectItem value="peers">Similar Organizations</SelectItem>
                <SelectItem value="historical">Historical Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {comparisonData.map((item) => {
              const indicator = getPerformanceIndicator(item.current, item.benchmark);
              const difference = item.current - item.benchmark;
              
              return (
                <Card key={item.metric} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">{item.metric}</h3>
                      <indicator.icon className="w-5 h-5 text-slate-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Current</span>
                        <span className="text-xl font-bold text-slate-900">{item.current}{item.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Benchmark</span>
                        <span className="text-lg text-slate-600">{item.benchmark}{item.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Difference</span>
                        <span className={`text-sm font-semibold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {difference >= 0 ? '+' : ''}{difference}{item.unit}
                        </span>
                      </div>
                    </div>
                    
                    <Badge className={`mt-4 ${indicator.color}`}>
                      {indicator.status}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Visual Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Performance vs Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#3B82F6" name="Current Performance" />
                <Bar dataKey="benchmark" fill="#94A3B8" name="Industry Benchmark" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Current" dataKey="current" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData.map((item) => {
              const difference = item.current - item.benchmark;
              if (difference < 0) {
                return (
                  <div key={item.metric} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Improve {item.metric}</h4>
                    <p className="text-sm text-yellow-700">
                      Your {item.metric.toLowerCase()} is {Math.abs(difference)}{item.unit} below the industry benchmark. 
                      Consider implementing targeted improvement strategies to close this gap.
                    </p>
                  </div>
                );
              }
              return null;
            }).filter(Boolean)}
            
            {comparisonData.every(item => item.current >= item.benchmark) && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Excellent Performance!</h4>
                <p className="text-sm text-green-700">
                  Your organization is performing at or above industry benchmarks across all key metrics. 
                  Continue monitoring and consider sharing best practices with peers.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}