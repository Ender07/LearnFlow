import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard({ users, currentUser }) {
  const sortedUsers = useMemo(() => {
    if (!users) return [];
    
    return [...users]
      .filter(user => user.gamification_points > 0)
      .sort((a, b) => (b.gamification_points || 0) - (a.gamification_points || 0))
      .slice(0, 10);
  }, [users]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-slate-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-slate-600 font-bold">{rank}</span>;
    }
  };

  const getRankBadge = (rank) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
        2: 'bg-gradient-to-r from-slate-300 to-slate-500 text-white',
        3: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
      };
      return colors[rank];
    }
    return 'bg-slate-100 text-slate-600';
  };

  if (sortedUsers.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Leaderboard Data</h3>
          <p className="text-slate-500">
            Complete some training to see the leaderboard rankings!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedUsers.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = currentUser && user.id === currentUser.id;
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200' 
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(rank)}
                </div>
                
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800">
                      {user.full_name}
                      {isCurrentUser && <span className="text-indigo-600 ml-1">(You)</span>}
                    </h3>
                    {rank <= 3 && (
                      <Badge className={getRankBadge(rank)}>
                        #{rank}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{user.job_title}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-800">
                    {user.gamification_points?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-slate-500">
                    Level {user.gamification_level || 1}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {currentUser && !sortedUsers.find(u => u.id === currentUser.id) && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200">
              <div className="w-12 h-12 flex items-center justify-center">
                <span className="text-slate-600 font-bold">--</span>
              </div>
              <Avatar className="w-12 h-12">
                <AvatarImage src={currentUser.avatar_url} />
                <AvatarFallback>{currentUser.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">
                  {currentUser.full_name} <span className="text-indigo-600">(You)</span>
                </h3>
                <p className="text-sm text-slate-600">{currentUser.job_title}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-slate-800">
                  {currentUser.gamification_points?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-slate-500">
                  Level {currentUser.gamification_level || 1}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}