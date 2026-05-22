import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function FeedbackAnalytics({ feedbackRequests, processes, users }) {
  const [timeRange, setTimeRange] = useState('30d');
  const [viewType, setViewType] = useState('trends');

  const analytics = useMemo(() => {
    if (!feedbackRequests || feedbackRequests.length === 0) {
      return {
        timeSeriesData: [],
        categoryDistribution: [],
        typeDistribution: [],
        resolutionTimes: [],
        submitterStats: []
      };
    }

    // Filter by time range
    const now = new Date();
    const cutoffDate = new Date();
    if (timeRange === '7d') cutoffDate.setDate(now.getDate() - 7);
    else if (timeRange === '30d') cutoffDate.setDate(now.getDate() - 30);
    else if (timeRange === '90d') cutoffDate.setDate(now.getDate() - 90);
    else cutoffDate.setFullYear(now.getFullYear() - 1);

    const filteredFeedback = feedbackRequests.filter(
      feedback => new Date(feedback.created_date) >= cutoffDate
    );

    // Time series data
    const timeSeriesMap = {};
    filteredFeedback.forEach(feedback => {
      const date = new Date(feedback.created_date).toISOString().split('T')[0];
      timeSeriesMap[date] = (timeSeriesMap[date] || 0) + 1;
    });

    const timeSeriesData = Object.entries(timeSeriesMap)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString(),
        count
      }));

    // Category distribution
    const categoryMap = {};
    filteredFeedback.forEach(feedback => {
      const process = processes.find(p => p.id === feedback.process_id);
      const category = process?.category || 'uncategorized';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value
    }));

    // Type distribution
    const typeMap = {};
    filteredFeedback.forEach(feedback => {
      typeMap[feedback.feedback_type] = (typeMap[feedback.feedback_type] || 0) + 1;
    });

    const typeDistribution = Object.entries(typeMap).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value
    }));

    // Resolution times
    const resolvedFeedback = filteredFeedback.filter(f => 
      f.status === 'resolved' && f.resolved_date && f.created_date
    );

    const resolutionTimes = resolvedFeedback.map(feedback => {
      const created = new Date(feedback.created_date);
      const resolved = new Date(feedback.resolved_date);
      const days = (resolved - created) / (1000 * 60 * 60 * 24);
      return {
        id: feedback.id,
        title: feedback.title,
        days: Math.round(days),
        priority: feedback.priority
      };
    });

    // Submitter stats
    const submitterMap = {};
    filteredFeedback.forEach(feedback => {
      const user = users.find(u => u.id === feedback.created_by);
      const name = user?.full_name || 'Anonymous';
      submitterMap[name] = (submitterMap[name] || 0) + 1;
    });

    const submitterStats = Object.entries(submitterMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      timeSeriesData,
      categoryDistribution,
      typeDistribution,
      resolutionTimes,
      submitterStats
    };
  }, [feedbackRequests, processes, users, timeRange]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const getAverageResolutionTime = () => {
    if (analytics.resolutionTimes.length === 0) return 0;
    const sum = analytics.resolutionTimes.reduce((acc, item) => acc + item.days, 0);
    return Math.round(sum / analytics.resolutionTimes.length);
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trends">Trends</SelectItem>
              <SelectItem value="distribution">Distribution</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Feedback Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Resolution Rate</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Feedback</p>
                <p className="text-2xl font-bold text-slate-900">{feedbackRequests.length}</p>
              </div>
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Resolution</p>
                <p className="text-2xl font-bold text-slate-900">{getAverageResolutionTime()}d</p>
              </div>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round((feedbackRequests.filter(f => f.status === 'resolved').length / Math.max(feedbackRequests.length, 1)) * 100)}%
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical Issues</p>
                <p className="text-2xl font-bold text-slate-900">
                  {feedbackRequests.filter(f => f.priority === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {viewType === 'trends' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Feedback Volume Trends */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Feedback Volume Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Submitters */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.submitterStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {viewType === 'distribution' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Category Distribution */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Feedback by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Type Distribution */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Feedback by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.typeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {viewType === 'performance' && (
        <div className="space-y-6">
          {/* Resolution Times */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Resolution Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.resolutionTimes.slice(0, 10).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${
                          item.priority === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
                          item.priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {item.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">{item.days}d</div>
                      <div className="text-xs text-slate-500">resolution time</div>
                    </div>
                  </div>
                ))}

                {analytics.resolutionTimes.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No resolution data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}