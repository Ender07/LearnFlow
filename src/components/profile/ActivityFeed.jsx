import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, PlayCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

export default function ActivityFeed({ userProgress, processes }) {
  const activities = useMemo(() => {
    if (!userProgress || !processes) return [];

    return userProgress
      .map(progress => {
        const process = processes.find(p => p.id === progress.process_id);
        if (!process) return null;

        return {
          id: progress.id,
          type: progress.status,
          processTitle: process.title,
          category: process.category,
          date: new Date(progress.updated_date || progress.created_date),
          score: progress.practical_score || progress.quiz_score,
          timeSpent: progress.time_spent,
          ...progress
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.date - a.date)
      .slice(0, 20); // Show last 20 activities
  }, [userProgress, processes]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'completed':
        return `Completed "${activity.processTitle}"${activity.score ? ` with ${activity.score}% score` : ''}`;
      case 'in_progress':
        return `Started "${activity.processTitle}"`;
      default:
        return `Updated "${activity.processTitle}"`;
    }
  };

  const formatActivityDate = (date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  if (activities.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Recent Activity</h3>
          <p className="text-slate-500">
            Your learning activities will appear here as you engage with training content.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 font-medium">
                  {getActivityText(activity)}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{formatActivityDate(activity.date)}</span>
                  {activity.timeSpent && (
                    <>
                      <span>•</span>
                      <span>{activity.timeSpent} min</span>
                    </>
                  )}
                  <span>•</span>
                  <Badge variant="outline" className="capitalize">
                    {activity.category?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {formatDistanceToNow(activity.date, { addSuffix: true })}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}