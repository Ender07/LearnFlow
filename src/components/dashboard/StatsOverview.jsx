import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock, Award, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

// Memoized component to prevent unnecessary re-renders
export default React.memo(function StatsOverview({ 
  userProgress, 
  processes,
  isLoading 
}) {
  // Memoize expensive calculations
  const stats = React.useMemo(() => {
    if (isLoading || !userProgress || !processes) {
      return {
        completedCount: 0,
        inProgressCount: 0,
        averageScore: 0,
        totalProcesses: 0,
      };
    }

    const completedCount = userProgress.filter(p => p.status === 'completed').length;
    const inProgressCount = userProgress.filter(p => p.status === 'in_progress').length;
    
    const scoredProgress = userProgress.filter(p => typeof p.quiz_score === 'number');
    const averageScore = scoredProgress.length > 0
      ? scoredProgress.reduce((acc, p) => acc + p.quiz_score, 0) / scoredProgress.length
      : 0;

    const totalProcesses = processes.length;

    return { completedCount, inProgressCount, averageScore, totalProcesses };
  }, [userProgress, processes, isLoading]);

  // Memoize the stats array to prevent recreation on every render
  const statsArray = React.useMemo(() => [
    {
      title: "Completed Processes",
      value: stats.completedCount,
      icon: Award,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      change: "+12%"
    },
    {
      title: "In Progress",
      value: stats.inProgressCount,
      icon: Clock,
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50",
      change: "+8%"
    },
    {
      title: "Average Score",
      value: `${stats.averageScore.toFixed(1)}%`,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      change: "+15%"
    },
    {
      title: "Total Available",
      value: stats.totalProcesses,
      icon: BookOpen,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50",
      change: "Updated"
    }
  ], [stats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsArray.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  )}
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
});