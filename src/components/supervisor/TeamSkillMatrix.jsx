import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Target } from 'lucide-react';

export default function TeamSkillMatrix({ members, processes, userProgress }) {
  if (!members || !Array.isArray(members) || !processes) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Team Skills Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-slate-500 py-8">
          No skill matrix data available.
        </CardContent>
      </Card>
    );
  }

  // Get unique skill categories
  const skillCategories = [...new Set(processes.map(p => p.category))].filter(Boolean);
  
  // Calculate member skill levels
  const memberSkills = members.map(member => {
    const memberProgress = userProgress?.filter(up => up.created_by === member.email) || [];
    const categoryScores = {};
    
    skillCategories.forEach(category => {
      const categoryProcesses = processes.filter(p => p.category === category);
      const completedInCategory = categoryProcesses.filter(cp => 
        memberProgress.some(mp => mp.process_id === cp.id && mp.status === 'completed')
      );
      const avgScore = completedInCategory.length > 0
        ? completedInCategory.reduce((acc, cp) => {
            const progress = memberProgress.find(mp => mp.process_id === cp.id);
            return acc + (progress?.quiz_score || progress?.practical_score || 0);
          }, 0) / completedInCategory.length
        : 0;
      
      categoryScores[category] = {
        completed: completedInCategory.length,
        total: categoryProcesses.length,
        avgScore: Math.round(avgScore),
        proficiency: avgScore >= 85 ? 'expert' : avgScore >= 70 ? 'proficient' : avgScore >= 50 ? 'developing' : 'beginner'
      };
    });
    
    return {
      ...member,
      categoryScores
    };
  });

  const getProficiencyColor = (proficiency) => {
    switch (proficiency) {
      case 'expert': return 'bg-green-500';
      case 'proficient': return 'bg-blue-500';
      case 'developing': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getProficiencyBadge = (proficiency, score) => {
    const colors = {
      expert: 'bg-green-100 text-green-800',
      proficient: 'bg-blue-100 text-blue-800', 
      developing: 'bg-yellow-100 text-yellow-800',
      beginner: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[proficiency]}>
        {score}%
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Team Skills Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-4 font-medium">Team Member</th>
                {skillCategories.map(category => (
                  <th key={category} className="text-center p-4 font-medium min-w-[120px]">
                    <div className="capitalize">{category.replace('_', ' ')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {memberSkills.map(member => (
                <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {member.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{member.full_name}</div>
                        <div className="text-xs text-slate-500">{member.job_title}</div>
                      </div>
                    </div>
                  </td>
                  {skillCategories.map(category => {
                    const skillData = member.categoryScores[category];
                    return (
                      <td key={category} className="p-4 text-center">
                        <div className="space-y-2">
                          {getProficiencyBadge(skillData.proficiency, skillData.avgScore)}
                          <div className="text-xs text-slate-500">
                            {skillData.completed}/{skillData.total}
                          </div>
                          <Progress 
                            value={(skillData.completed / skillData.total) * 100} 
                            className="h-1"
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}