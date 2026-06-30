import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp 
} from 'lucide-react';
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
  Cell
} from 'recharts';

export default function FeedbackOverview({ feedback = [], processes }) {
  const stats = useMemo(() => {
    const total = feedback.length;
    const open = feedback.filter(f => f.status === 'open').length;
    const inReview = feedback.filter(f => f.status === 'in_review').length;
    const resolved = feedback.filter(f => f.status === 'resolved').length;
    const critical = feedback.filter(f => f.priority === 'critical').length;

    return { total, open, inReview, resolved, critical };
  }, [feedback]);

  const feedbackByType = useMemo(() => {
    const types = {};
    feedback.forEach(f => {
      const type = f.feedback_type;
      types[type] = (types[type] || 0) + 1;
    });

    return Object.entries(types).map(([type, count]) => ({
      name: type.replace('_', ' '),
      count
    }));
  }, [feedback]);

  const feedbackByProcess = useMemo(() => {
    const processMap = {};
    feedback.forEach(f => {
      const process = processes?.find(p => p.id === f.process_id);
      const processName = process?.title || 'Unknown Process';
      processMap[processName] = (processMap[processName] || 0) + 1;
    });

    return Object.entries(processMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [feedback, processes]);

  const statusData = [
    { name: 'Open', value: stats.open, color: '#ef4444' },
    { name: 'In Review', value: stats.inReview, color: '#f59e0b' },
    { name: 'Resolved', value: stats.resolved, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Feedback</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.open}</div>
            <div className="text-sm text-slate-600">Open Items</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.inReview}</div>
            <div className="text-sm text-slate-600">In Review</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <div className="text-sm text-slate-600">Resolved</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.critical}</div>
            <div className="text-sm text-slate-600">Critical Priority</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Feedback by Type */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Feedback by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feedbackByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Processes with Feedback */}
      {feedbackByProcess.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Processes with Most Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feedbackByProcess} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}