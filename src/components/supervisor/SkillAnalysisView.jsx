import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

export default function SkillAnalysisView({ members, processes, departmentStats, userProgress }) {
  if (!members || !Array.isArray(members)) {
    return (
      <div className="text-center text-slate-500 p-8">
        No skill analysis data available.
      </div>
    );
  }

  // Calculate skill gaps
  const skillGaps = members.map(member => {
    const memberSkills = processes?.filter(process => 
      userProgress?.some(up => up.process_id === process.id && up.created_by === member.email && up.status === 'completed')
    ) || [];
    
    const skillCategories = {};
    memberSkills.forEach(skill => {
      if (!skillCategories[skill.category]) {
        skillCategories[skill.category] = 0;
      }
      skillCategories[skill.category]++;
    });
    
    return {
      name: member.full_name,
      skills: skillCategories,
      totalSkills: memberSkills.length,
      avgScore: member.avgScore || 0
    };
  });

  // Prepare chart data
  const chartData = Object.keys(processes?.reduce((acc, p) => ({ ...acc, [p.category]: true }), {}) || {})
    .map(category => ({
      category,
      teamAverage: members.reduce((acc, member) => 
        acc + (member.categoryScores?.[category] || 0), 0) / members.length || 0
    }));

  return (
    <div className="space-y-6">
      {/* Skill Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(members.reduce((acc, m) => acc + (m.avgScore || 0), 0) / members.length) || 0}%
            </div>
            <div className="text-sm text-slate-600 mt-1">Team Avg Score</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {members.filter(m => (m.avgScore || 0) >= 85).length}
            </div>
            <div className="text-sm text-slate-600 mt-1">High Performers</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {members.filter(m => m.needsAttention).length}
            </div>
            <div className="text-sm text-slate-600 mt-1">Need Development</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {members.reduce((acc, m) => acc + (m.completedCount || 0), 0)}
            </div>
            <div className="text-sm text-slate-600 mt-1">Total Completions</div>
          </CardContent>
        </Card>
      </div>

      {/* Skills by Category Chart */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Skills by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="teamAverage" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Individual Member Skills */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Individual Skill Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillGaps.map(member => (
              <div key={member.name} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{member.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {member.totalSkills} skills
                    </Badge>
                    <Badge className={`${
                      member.avgScore >= 85 ? 'bg-green-100 text-green-800' :
                      member.avgScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {member.avgScore}% avg
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(member.skills).map(([skill, count]) => (
                    <div key={skill} className="text-sm">
                      <div className="flex justify-between">
                        <span className="capitalize">{skill.replace('_', ' ')}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}