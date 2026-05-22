import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Users, 
  Target, 
  Star,
  Zap,
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock team challenge data
const mockChallenges = [
  {
    id: 'challenge-1',
    title: 'Safety Excellence Sprint',
    description: 'Complete all safety training modules as a team within 2 weeks',
    category: 'safety',
    type: 'team_completion',
    start_date: '2024-01-01',
    end_date: '2024-01-15',
    status: 'active',
    reward_points: 500,
    badge_reward: 'Safety Champions',
    participating_teams: 8,
    target_metric: 100, // 100% completion
    current_progress: 78,
    team_leaderboard: [
      { team_name: 'Alpha Squad', progress: 95, members: 6, points: 475 },
      { team_name: 'Quality Crew', progress: 87, members: 5, points: 435 },
      { team_name: 'Assembly Heroes', progress: 82, members: 7, points: 410 }
    ]
  },
  {
    id: 'challenge-2',
    title: 'Knowledge Sharing Marathon',
    description: 'Contribute the most valuable knowledge articles to the hub',
    category: 'collaboration',
    type: 'contribution_count',
    start_date: '2024-01-08',
    end_date: '2024-01-22',
    status: 'active',
    reward_points: 750,
    badge_reward: 'Knowledge Masters',
    participating_teams: 12,
    target_metric: 50, // 50 contributions
    current_progress: 32,
    team_leaderboard: [
      { team_name: 'Innovation Lab', progress: 18, members: 4, points: 360 },
      { team_name: 'Process Pros', progress: 14, members: 6, points: 280 },
      { team_name: 'Tech Titans', progress: 12, members: 5, points: 240 }
    ]
  },
  {
    id: 'challenge-3',
    title: 'AR Training Mastery',
    description: 'Achieve highest AR simulation scores across all processes',
    category: 'technology',
    type: 'score_based',
    start_date: '2024-01-10',
    end_date: '2024-01-24',
    status: 'upcoming',
    reward_points: 1000,
    badge_reward: 'AR Masters',
    participating_teams: 6,
    target_metric: 95, // 95% average score
    current_progress: 0
  }
];

export default function TeamChallenges() {
  const [challenges, setChallenges] = useState(mockChallenges);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  const getChallengeStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'safety': return Trophy;
      case 'collaboration': return Users;
      case 'technology': return Zap;
      default: return Target;
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'all') return true;
    return challenge.status === activeTab;
  });

  const joinChallenge = (challengeId) => {
    // In a real implementation, this would create a team participation record
    console.log('Joining challenge:', challengeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-orange-800 to-red-800 bg-clip-text text-transparent">
              Team Challenges
            </h1>
          </div>
          <p className="text-slate-600 mt-2 text-lg max-w-2xl mx-auto">
            Collaborate with your team to complete challenges, earn rewards, and climb the leaderboard.
          </p>
        </motion.div>

        {/* Challenge Categories */}
        <div className="flex justify-center">
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
            {['active', 'upcoming', 'completed', 'all'].map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : ''}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Challenge Cards */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {filteredChallenges.map((challenge, index) => {
                const CategoryIcon = getCategoryIcon(challenge.category);
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-red-100">
                              <CategoryIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">{challenge.title}</CardTitle>
                              <p className="text-slate-600 mt-1">{challenge.description}</p>
                            </div>
                          </div>
                          <Badge className={getChallengeStatusColor(challenge.status)}>
                            {challenge.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Progress Bar */}
                          {challenge.status === 'active' && (
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Team Progress</span>
                                <span className="font-semibold">{challenge.current_progress}%</span>
                              </div>
                              <Progress value={challenge.current_progress} className="h-3" />
                            </div>
                          )}

                          {/* Challenge Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-500" />
                              <span>{challenge.participating_teams} teams</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{challenge.reward_points} points</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-purple-500" />
                              <span>{challenge.badge_reward}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span>{new Date(challenge.end_date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-end">
                            {challenge.status === 'active' ? (
                              <Button
                                onClick={() => setSelectedChallenge(challenge)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              >
                                View Leaderboard
                              </Button>
                            ) : challenge.status === 'upcoming' ? (
                              <Button
                                onClick={() => joinChallenge(challenge.id)}
                                variant="outline"
                              >
                                Join Challenge
                              </Button>
                            ) : (
                              <Button variant="ghost" disabled>
                                Challenge Completed
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="space-y-6">
            {selectedChallenge ? (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {selectedChallenge.title} Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedChallenge.team_leaderboard?.map((team, index) => (
                      <div
                        key={team.team_name}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' :
                          index === 1 ? 'bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200' :
                          index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200' :
                          'bg-slate-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-slate-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-slate-300 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{team.team_name}</div>
                          <div className="text-xs text-slate-600">
                            {team.members} members • {team.points} points
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">{team.progress}%</div>
                          <Progress value={team.progress} className="w-16 h-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">
                    Select a challenge to view the team leaderboard
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Your Team Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Challenges Completed</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Points Earned</span>
                    <span className="font-semibold">2,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Team Ranking</span>
                    <span className="font-semibold">#3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Badges Earned</span>
                    <span className="font-semibold">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}