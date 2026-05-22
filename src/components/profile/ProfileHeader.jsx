import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Award, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileHeader({ user, progress }) {
  const stats = useMemo(() => {
    const completedProcesses = progress.filter(p => p.status === 'completed').length;
    const totalTime = progress.reduce((acc, p) => acc + (p.time_spent || 0), 0);
    const level = user.gamification_level || 1;
    const points = user.gamification_points || 0;
    const pointsForNextLevel = level * 1000;
    const progressToNextLevel = (points % 1000) / 10;
    
    return {
      completedProcesses,
      totalTime,
      level,
      points,
      pointsForNextLevel,
      progressToNextLevel,
    };
  }, [user, progress]);

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-24" />
        <CardContent className="p-6 pt-0">
          <div className="flex flex-col lg:flex-row items-center -mt-16">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-4xl">{user.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="mt-4 lg:mt-16 lg:ml-6 flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900">{user.full_name}</h2>
              <p className="text-slate-600">{user.job_title}</p>
              <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto lg:mx-0">{user.bio || 'This user has not set a bio yet.'}</p>
            </div>
            <div className="mt-6 lg:mt-16 w-full lg:w-auto">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-blue-600">Level {stats.level}</span>
                <span className="text-slate-500">{stats.points} / {stats.pointsForNextLevel} XP</span>
              </div>
              <Progress value={stats.progressToNextLevel} className="h-2 mt-1" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center border-t pt-6">
            <div>
              <Award className="w-6 h-6 mx-auto text-indigo-500 mb-1" />
              <p className="text-2xl font-bold">{stats.completedProcesses}</p>
              <p className="text-sm text-slate-500">Processes Completed</p>
            </div>
            <div>
              <Clock className="w-6 h-6 mx-auto text-indigo-500 mb-1" />
              <p className="text-2xl font-bold">{(stats.totalTime / 60).toFixed(1)}</p>
              <p className="text-sm text-slate-500">Hours Trained</p>
            </div>
            <div>
              <Star className="w-6 h-6 mx-auto text-indigo-500 mb-1" />
              <p className="text-2xl font-bold">{user.earned_badges?.length || 0}</p>
              <p className="text-sm text-slate-500">Badges Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}