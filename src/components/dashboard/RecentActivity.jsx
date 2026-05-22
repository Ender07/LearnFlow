import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, Play, CheckCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RecentActivity({ userProgress, processes, isLoading }) {
  const getProcessTitle = (processId) => {
    const process = processes.find(p => p.id === processId);
    return process?.title || 'Unknown Process';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const recentActivities = userProgress.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : recentActivities.length > 0 ? (
              recentActivities.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(p.status)}
                    <div>
                      <p className="font-semibold text-slate-800">{getProcessTitle(p.process_id)}</p>
                      <p className="text-xs text-slate-500">
                        Last updated: {p.updated_date ? format(new Date(p.updated_date), "MMM d, yyyy") : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {p.status === 'in_progress' && (
                      <div className="w-24">
                        <Progress value={p.completion_percentage || 0} className="h-2" />
                      </div>
                    )}
                    <Link to={createPageUrl(`ProcessExecution?id=${p.process_id}`)}>
                      <Button variant="ghost" size="sm">
                        {p.status === 'in_progress' ? 'Continue' : 'Review'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-4">No recent activity.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}