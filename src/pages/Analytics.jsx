import React, { useState, useMemo } from "react";
import { useData } from "@/components/providers/DataProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  Target,
  Award,
  CheckCircle,
  Activity,
  Download,
  Settings,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

import PerformanceDashboard from "../components/analytics/PerformanceDashboard";
import SkillMatrix from "../components/analytics/SkillMatrix";
import ComplianceReports from "../components/analytics/ComplianceReports";
import TrainingEffectiveness from "../components/analytics/TrainingEffectiveness";
import Benchmarking from "../components/analytics/Benchmarking";
import CustomizableDashboard from "../components/analytics/CustomizableDashboard";
import TrendAnalysis from "../components/analytics/TrendAnalysis";
import ReportGenerator from "../components/analytics/ReportGenerator";

export default function Analytics() {
  const { 
    processes, 
    userProgress: allUserProgress,
    users,
    currentUser,
    learningPaths,
    certifications,
    equipment,
    isLoading 
  } = useData();

  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [viewType, setViewType] = useState("summary");
  const [customDashboardOpen, setCustomDashboardOpen] = useState(false);
  const [reportGeneratorOpen, setReportGeneratorOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Calculate comprehensive analytics with enhanced metrics
  const analytics = useMemo(() => {
    if (!processes || !allUserProgress || !users) return null;

    const now = new Date();
    const timeRangeMap = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };
    
    const cutoffDate = new Date(now.getTime() - timeRangeMap[timeRange]);
    
    // Filter progress within time range
    const recentProgress = allUserProgress.filter(progress => 
      new Date(progress.updated_date || progress.created_date) > cutoffDate
    );

    // Filter by department if selected
    const departmentUsers = selectedDepartment === "all" 
      ? users 
      : users.filter(user => user.department === selectedDepartment);
    
    const departmentProgress = recentProgress.filter(progress => 
      departmentUsers.some(user => user.email === progress.created_by)
    );

    // Enhanced Statistics
    const totalUsers = departmentUsers.length;
    const activeUsers = new Set(departmentProgress.map(p => p.created_by)).size;
    const totalCompletions = departmentProgress.filter(p => p.status === 'completed').length;
    const averageScore = departmentProgress
      .filter(p => p.practical_score || p.quiz_score)
      .reduce((acc, p, _, arr) => acc + ((p.practical_score || p.quiz_score || 0) / arr.length), 0);

    // Training Effectiveness by Process with enhanced metrics
    const processStats = processes.map(process => {
      const processProgress = departmentProgress.filter(p => p.process_id === process.id);
      const completed = processProgress.filter(p => p.status === 'completed');
      const inProgress = processProgress.filter(p => p.status === 'in_progress');
      
      const avgScore = completed.length > 0 
        ? completed.reduce((acc, p) => acc + (p.practical_score || p.quiz_score || 0), 0) / completed.length
        : 0;
      
      const avgTime = completed.length > 0
        ? completed.reduce((acc, p) => acc + (p.time_spent || 0), 0) / completed.length
        : 0;

      const completionRate = processProgress.length > 0 
        ? (completed.length / processProgress.length) * 100 
        : 0;

      // Enhanced metrics
      const dropoutRate = processProgress.length > 0 
        ? (processProgress.filter(p => p.status === 'not_started').length / processProgress.length) * 100
        : 0;

      const retryRate = completed.length > 0 
        ? (completed.filter(p => p.quiz_score < 70).length / completed.length) * 100
        : 0;

      return {
        id: process.id,
        name: process.title,
        category: process.category,
        difficulty: process.difficulty_level,
        totalAttempts: processProgress.length,
        completions: completed.length,
        inProgress: inProgress.length,
        completionRate,
        dropoutRate,
        retryRate,
        avgScore: Math.round(avgScore),
        avgTime: Math.round(avgTime),
        effectiveness: Math.round((completionRate + avgScore) / 2),
        riskLevel: process.hazard_level || 'low'
      };
    }).sort((a, b) => b.totalAttempts - a.totalAttempts);

    // Performance by Category with trend data
    const categoryStats = Object.entries(
      processStats.reduce((acc, process) => {
        if (!acc[process.category]) {
          acc[process.category] = {
            category: process.category,
            totalProcesses: 0,
            totalCompletions: 0,
            totalAttempts: 0,
            avgScore: 0,
            effectivenessScore: 0,
            riskProcesses: 0
          };
        }
        acc[process.category].totalProcesses++;
        acc[process.category].totalCompletions += process.completions;
        acc[process.category].totalAttempts += process.totalAttempts;
        acc[process.category].avgScore += process.avgScore;
        acc[process.category].effectivenessScore += process.effectiveness;
        if (process.riskLevel === 'high' || process.riskLevel === 'critical') {
          acc[process.category].riskProcesses++;
        }
        return acc;
      }, {})
    ).map(([category, stats]) => ({
      ...stats,
      avgScore: Math.round(stats.avgScore / stats.totalProcesses),
      effectivenessScore: Math.round(stats.effectivenessScore / stats.totalProcesses),
      completionRate: stats.totalAttempts > 0 ? Math.round((stats.totalCompletions / stats.totalAttempts) * 100) : 0
    }));

    // Time-based trend analysis
    const weeklyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(now.getTime() - ((i - 1) * 7 * 24 * 60 * 60 * 1000));
      
      const weekProgress = departmentProgress.filter(p => {
        const date = new Date(p.updated_date || p.created_date);
        return date >= weekStart && date < weekEnd;
      });
      
      const weekCompletions = weekProgress.filter(p => p.status === 'completed').length;
      const weekAvgScore = weekProgress.length > 0
        ? weekProgress.reduce((acc, p) => acc + (p.practical_score || p.quiz_score || 0), 0) / weekProgress.length
        : 0;

      weeklyTrends.push({
        week: `Week ${i + 1}`,
        date: weekStart.toISOString().split('T')[0],
        completions: weekCompletions,
        avgScore: Math.round(weekAvgScore),
        activeUsers: new Set(weekProgress.map(p => p.created_by)).size
      });
    }

    // Risk analysis
    const riskAreas = processStats
      .filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical')
      .filter(p => p.completionRate < 80 || p.avgScore < 75)
      .sort((a, b) => (a.completionRate + a.avgScore) - (b.completionRate + b.avgScore))
      .slice(0, 5);

    return {
      totalUsers,
      activeUsers,
      totalCompletions,
      averageScore: Math.round(averageScore),
      processStats,
      categoryStats,
      weeklyTrends,
      riskAreas,
      // Enhanced metrics
      engagementRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      completionVelocity: Math.round(totalCompletions / 7), // completions per week
      skillGrowthRate: weeklyTrends.length > 1 
        ? Math.round(((weeklyTrends[6].avgScore - weeklyTrends[0].avgScore) / weeklyTrends[0].avgScore) * 100)
        : 0
    };
  }, [processes, allUserProgress, users, timeRange, selectedDepartment]);

  // Get unique departments for filtering
  const departments = useMemo(() => {
    const depts = [...new Set(users.map(user => user.department).filter(Boolean))];
    return ['all', ...depts];
  }, [users]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Enhanced Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
                  Advanced Analytics
                </h1>
              </div>
              <p className="text-slate-600 text-lg">
                Comprehensive insights into training performance, skill development, and organizational learning effectiveness.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
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

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={customDashboardOpen} onOpenChange={setCustomDashboardOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Customize Dashboard</DialogTitle>
                  </DialogHeader>
                  <CustomizableDashboard analytics={analytics} />
                </DialogContent>
              </Dialog>

              <Dialog open={reportGeneratorOpen} onOpenChange={setReportGeneratorOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Generate Analytics Report</DialogTitle>
                  </DialogHeader>
                  <ReportGenerator analytics={analytics} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Key Metrics */}
        {analytics && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Engagement Rate</p>
                    <p className="text-3xl font-bold text-blue-600">{analytics.engagementRate}%</p>
                    <p className="text-xs text-slate-500">{analytics.activeUsers}/{analytics.totalUsers} users active</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Completion Velocity</p>
                    <p className="text-3xl font-bold text-green-600">{analytics.completionVelocity}</p>
                    <p className="text-xs text-slate-500">completions per week</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Average Score</p>
                    <p className="text-3xl font-bold text-purple-600">{analytics.averageScore}%</p>
                    <p className="text-xs text-slate-500">across all assessments</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Skill Growth</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {analytics.skillGrowthRate > 0 ? '+' : ''}{analytics.skillGrowthRate}%
                    </p>
                    <p className="text-xs text-slate-500">this period vs last</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Skills Matrix
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Benchmarks
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <PerformanceDashboard analytics={analytics} />
          </TabsContent>

          <TabsContent value="performance" className="mt-8">
            <TrainingEffectiveness analytics={analytics} />
          </TabsContent>

          <TabsContent value="skills" className="mt-8">
            <SkillMatrix analytics={analytics} processes={processes} users={users} />
          </TabsContent>

          <TabsContent value="trends" className="mt-8">
            <TrendAnalysis analytics={analytics} />
          </TabsContent>

          <TabsContent value="benchmarks" className="mt-8">
            <Benchmarking analytics={analytics} />
          </TabsContent>

          <TabsContent value="compliance" className="mt-8">
            <ComplianceReports 
              analytics={analytics}
              certifications={certifications}
              equipment={equipment}
              processes={processes}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}