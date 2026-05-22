import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity } from 'lucide-react';

export default function LiveMonitoringView({ members, processes, userProgress }) {
  if (!members || !Array.isArray(members)) {
    return (
      <div className="text-center text-slate-500 p-8">
        No monitoring data available.
      </div>
    );
  }

  const getActiveMembers = () => {
    return members.filter(member => {
      const recentActivity = userProgress?.some(progress => 
        progress.created_by === member.email &&
        new Date(progress.updated_date || progress.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      return recentActivity;
    });
  };

  const activeMembers = getActiveMembers();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{activeMembers.length}</div>
            <div className="text-sm text-slate-600 mt-1">Active Now</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {members.filter(m => m.inProgressCount > 0).length}
            </div>
            <div className="text-sm text-slate-600 mt-1">In Training</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {members.filter(m => m.needsAttention).length}
            </div>
            <div className="text-sm text-slate-600 mt-1">Need Attention</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.full_name}</div>
                    <div className="text-sm text-slate-500">Currently in training</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <Activity className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                  <Progress value={member.completionRate || 0} className="w-20 h-2" />
                </div>
              </div>
            ))}
            
            {activeMembers.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                No active training sessions at the moment.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}