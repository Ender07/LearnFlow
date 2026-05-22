import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyAwards({ earnedBadges, allBadges, userProgress }) {
  const recentBadges = earnedBadges.slice(0, 3);
  const totalPoints = earnedBadges.reduce((sum, badge) => sum + (badge.points || 0), 0);

  const getBadgeIcon = (iconName) => {
    // Simple icon mapping - in a real app, you'd have a more comprehensive system
    switch (iconName) {
      case 'award': return Award;
      case 'star': return Star;
      default: return Award;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'completion': return 'from-green-500 to-emerald-500';
      case 'collaboration': return 'from-blue-500 to-indigo-500';
      case 'expertise': return 'from-purple-500 to-pink-500';
      case 'milestone': return 'from-orange-500 to-red-500';
      case 'safety': return 'from-red-500 to-rose-500';
      case 'quality': return 'from-yellow-500 to-orange-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  if (earnedBadges.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Awards Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Start completing training processes to earn your first badges and build your reputation!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{earnedBadges.length}</div>
            <div className="text-sm text-slate-600">Total Badges</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-sm text-slate-600">Points Earned</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{recentBadges.length}</div>
            <div className="text-sm text-slate-600">Recent Badges</div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Badges Grid */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Your Earned Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedBadges.map((badge, index) => {
              const IconComponent = getBadgeIcon(badge.icon);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl border-2 border-slate-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${getCategoryColor(badge.category)} flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">{badge.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{badge.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <Badge className={`bg-gradient-to-r ${getCategoryColor(badge.category)} text-white`}>
                        {badge.category}
                      </Badge>
                      <span className="text-slate-500">+{badge.points} XP</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}