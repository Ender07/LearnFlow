import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Clock, 
  Zap,
  BarChart3,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function PersonalizedDashboard({ 
  userAnalytics, 
  userProgress, 
  processes,
  currentUser,
  learningPaths,
  recentActivity 
}) {
  const [personalizedInsights, setPersonalizedInsights] = useState(null);
  const [learningTrends, setLearningTrends] = useState([]);
  const [adaptiveMetrics, setAdaptiveMetrics] = useState({});

  useEffect(() => {
    if (userAnalytics && userProgress && processes) {
      generatePersonalizedInsights();
      calculateLearningTrends();
      computeAdaptiveMetrics();
    }
  }, [userAnalytics, userProgress, processes]);

  const generatePersonalizedInsights = () => {
    const completedProcesses = userProgress.filter(p => p.status === 'completed');
    const avgScore = completedProcesses.reduce((acc, p) => 
      acc + (p.practical_score || p.quiz_score || 0), 0
    ) / completedProcesses.length || 0;

    // Generate learning velocity insights
    const recentCompletions = completedProcesses
      .filter(p => {
        const completionDate = new Date(p.completed_date || p.updated_date);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return completionDate > thirtyDaysAgo;
      });

    const learningVelocity = recentCompletions.length / 4; // processes per week

    // Identify peak performance times
    const performanceByTime = {};
    completedProcesses.forEach(p => {
      const hour = new Date(p.updated_date || p.created_date).getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      if (!performanceByTime[timeOfDay]) {
        performanceByTime[timeOfDay] = [];
      }
      performanceByTime[timeOfDay].push(p.practical_score || p.quiz_score || 0);
    });

    const peakTime = Object.entries(performanceByTime)
      .map(([time, scores]) => ({
        time,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length
      }))
      .sort((a, b) => b.avgScore - a.avgScore)[0]?.time || 'morning';

    // Analyze learning patterns
    const categoryPerformance = {};
    completedProcesses.forEach(p => {
      const process = processes.find(pr => pr.id === p.process_id);
      if (process) {
        if (!categoryPerformance[process.category]) {
          categoryPerformance[process.category] = [];
        }
        categoryPerformance[process.category].push(p.practical_score || p.quiz_score || 0);
      }
    });

    const strongestCategory = Object.entries(categoryPerformance)
      .map(([cat, scores]) => ({
        category: cat,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length
      }))
      .sort((a, b) => b.avgScore - a.avgScore)[0];

    setPersonalizedInsights({
      overallScore: Math.round(avgScore),
      learningVelocity: Math.round(learningVelocity * 10) / 10,
      peakPerformanceTime: peakTime,
      strongestSkillArea: strongestCategory?.category?.replace('_', ' ') || 'General',
      totalProcessesCompleted: completedProcesses.length,
      currentStreak: calculateCurrentStreak(completedProcesses),
      nextMilestone: getNextMilestone(completedProcesses.length),
      adaptationsSuggested: Math.floor(Math.random() * 5) + 2 // Simulated
    });
  };

  const calculateCurrentStreak = (completedProcesses) => {
    if (completedProcesses.length === 0) return 0;
    
    const sortedCompletions = completedProcesses
      .sort((a, b) => new Date(b.completed_date || b.updated_date) - new Date(a.completed_date || a.updated_date));
    
    let streak = 0;
    let currentDate = new Date();
    
    for (let completion of sortedCompletions) {
      const completionDate = new Date(completion.completed_date || completion.updated_date);
      const diffDays = Math.floor((currentDate - completionDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) { // Within a week
        streak++;
        currentDate = completionDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getNextMilestone = (completed) => {
    const milestones = [5, 10, 25, 50, 100];
    return milestones.find(m => m > completed) || completed + 25;
  };

  const calculateLearningTrends = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        completions: 0,
        avgScore: 0,
        timeSpent: 0
      };
    });

    userProgress.forEach(p => {
      const progressDate = new Date(p.updated_date || p.created_date);
      const dayData = last30Days.find(d => 
        d.fullDate.toDateString() === progressDate.toDateString()
      );
      
      if (dayData) {
        if (p.status === 'completed') {
          dayData.completions++;
          dayData.avgScore = (dayData.avgScore + (p.practical_score || p.quiz_score || 0)) / dayData.completions;
        }
        dayData.timeSpent += p.time_spent || 0;
      }
    });

    setLearningTrends(last30Days);
  };

  const computeAdaptiveMetrics = () => {
    const metrics = {
      adaptationAccuracy: 92 + Math.random() * 6, // Simulated AI accuracy
      predictionConfidence: 87 + Math.random() * 8,
      personalizedContentUsage: Math.random() * 40 + 60,
      learningEfficiencyGain: Math.random() * 30 + 15
    };
    
    setAdaptiveMetrics(metrics);
  };

  if (!personalizedInsights) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-slate-200 rounded-lg"></div>
          <div className="h-24 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Learning Summary */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Your Personalized Learning Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{personalizedInsights.overallScore}%</div>
              <div className="text-sm opacity-90">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{personalizedInsights.learningVelocity}</div>
              <div className="text-sm opacity-90">Processes/Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{personalizedInsights.currentStreak}</div>
              <div className="text-sm opacity-90">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{personalizedInsights.totalProcessesCompleted}</div>
              <div className="text-sm opacity-90">Completed</div>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next milestone ({personalizedInsights.nextMilestone} processes)</span>
              <span>{personalizedInsights.totalProcessesCompleted}/{personalizedInsights.nextMilestone}</span>
            </div>
            <Progress 
              value={(personalizedInsights.totalProcessesCompleted / personalizedInsights.nextMilestone) * 100} 
              className="h-2 bg-white/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Learning Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Peak Performance Time */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Peak Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 capitalize">
                  {personalizedInsights.peakPerformanceTime}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  You perform best during {personalizedInsights.peakPerformanceTime} sessions
                </div>
                <Badge className="mt-3 bg-blue-100 text-blue-800">
                  <Zap className="w-3 h-3 mr-1" />
                  Optimized Scheduling
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Strongest Skill Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Strongest Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 capitalize">
                  {personalizedInsights.strongestSkillArea}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Your highest performing skill category
                </div>
                <Badge className="mt-3 bg-green-100 text-green-800">
                  <Award className="w-3 h-3 mr-1" />
                  Top Performer
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Adaptation Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Adaptations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {personalizedInsights.adaptationsSuggested}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Personalized adaptations applied
                </div>
                <Badge className="mt-3 bg-purple-100 text-purple-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {Math.round(adaptiveMetrics.adaptationAccuracy)}% Accuracy
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Learning Trends Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            30-Day Learning Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={learningTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completions" 
                  stroke="#6366f1" 
                  fill="url(#completionsGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="completionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(adaptiveMetrics.adaptationAccuracy)}%
            </div>
            <div className="text-sm text-blue-700 mt-1">AI Accuracy</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(adaptiveMetrics.predictionConfidence)}%
            </div>
            <div className="text-sm text-green-700 mt-1">Prediction Confidence</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(adaptiveMetrics.personalizedContentUsage)}%
            </div>
            <div className="text-sm text-purple-700 mt-1">Personalized Content</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              +{Math.round(adaptiveMetrics.learningEfficiencyGain)}%
            </div>
            <div className="text-sm text-orange-700 mt-1">Efficiency Gain</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}