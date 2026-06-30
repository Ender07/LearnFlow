import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ExpertiseLeaderboard({ users, contributions, discussions }) {
  const leaderboard = (users || [])
    .map(user => {
      const contributionCount = (contributions || []).filter(c => c.created_by === user.email).length;
      const validationScore = (contributions || [])
        .filter(c => c.created_by === user.email)
        .reduce((acc, c) => acc + (c.validation_score || 0), 0);
      const resolvedDiscussions = (discussions || []).filter(d => d.resolved_by === user.id).length;
      
      const score = (contributionCount * 5) + (validationScore * 2) + (resolvedDiscussions * 10);
      
      return { ...user, score };
    })
    .filter(user => user.score > 0)
    .sort((a, b) => b.score - a.score);

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.slice(0, 5).map((user, index) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold w-6 text-center">{index + 1}</span>
                <Avatar>
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{user.full_name}</p>
                  <p className="text-xs text-slate-500">{user.job_title}</p>
                </div>
              </div>
              <Badge variant="secondary" className="font-bold">{user.score} pts</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}