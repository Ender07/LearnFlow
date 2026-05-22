import React, { useState, useMemo } from "react";
import { useData } from "@/components/providers/DataProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Trophy, 
  Star, 
  Target,
  Users,
  TrendingUp,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

import MyAwards from "../components/gamification/MyAwards";
import Leaderboard from "../components/gamification/Leaderboard";
import BadgeCatalog from "../components/gamification/BadgeCatalog";

export default function Awards() {
  const { 
    currentUser, 
    badges,
    users,
    userProgress,
    isLoading 
  } = useData();
  
  const [activeTab, setActiveTab] = useState("my_awards");

  // Calculate user level and progress
  const levelInfo = useMemo(() => {
    if (!currentUser) return { level: 1, points: 0, progress: 0, nextLevelPoints: 1000 };
    
    const level = currentUser.gamification_level || 1;
    const points = currentUser.gamification_points || 0;
    const nextLevelPoints = level * 1000;
    const currentLevelPoints = (level - 1) * 1000;
    const progress = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    
    return { level, points, progress, nextLevelPoints };
  }, [currentUser]);

  // Get earned badges
  const earnedBadges = useMemo(() => {
    if (!currentUser?.earned_badges || !badges) return [];
    return badges.filter(badge => currentUser.earned_badges.includes(badge.id));
  }, [currentUser, badges]);

  const stats = useMemo(() => {
    const totalBadges = badges?.length || 0;
    const earnedCount = earnedBadges.length;
    const completedProcesses = userProgress?.filter(p => p.status === 'completed').length || 0;
    
    return {
      totalBadges,
      earnedBadges: earnedCount,
      completedProcesses,
      completionRate: totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0
    };
  }, [badges, earnedBadges, userProgress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Awards & Recognition
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Track your achievements, compete with colleagues, and unlock new badges as you advance your skills.
          </p>
        </motion.div>

        {/* Level Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Level {levelInfo.level}</h2>
                  <p className="text-indigo-100">
                    {levelInfo.points} XP • {levelInfo.nextLevelPoints - levelInfo.points} XP to next level
                  </p>
                </div>
                <div className="text-right">
                  <Crown className="w-16 h-16 text-yellow-300 mb-2" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    Manufacturing Expert
                  </Badge>
                </div>
              </div>
              <Progress value={levelInfo.progress} className="h-3 bg-white/20" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{stats.earnedBadges}</div>
              <div className="text-sm text-slate-600">Badges Earned</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{stats.completedProcesses}</div>
              <div className="text-sm text-slate-600">Processes Completed</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{levelInfo.level}</div>
              <div className="text-sm text-slate-600">Current Level</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{stats.completionRate}%</div>
              <div className="text-sm text-slate-600">Badge Completion</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my_awards">
              <Award className="w-4 h-4 mr-2" />
              My Awards
            </TabsTrigger>
            <TabsTrigger value="badge_catalog">
              <Star className="w-4 h-4 mr-2" />
              Badge Catalog
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Users className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <TabsContent value="my_awards">
              <MyAwards 
                earnedBadges={earnedBadges} 
                allBadges={badges} 
                userProgress={userProgress}
              />
            </TabsContent>
            <TabsContent value="badge_catalog">
              <BadgeCatalog 
                badges={badges} 
                earnedBadgeIds={currentUser?.earned_badges || []}
              />
            </TabsContent>
            <TabsContent value="leaderboard">
              <Leaderboard users={users} currentUser={currentUser} />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
}