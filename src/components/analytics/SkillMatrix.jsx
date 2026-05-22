import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Target } from 'lucide-react';

export default function SkillMatrix({ analytics, processes, users }) {
  // Handle missing or invalid data gracefully
  if (!analytics || !analytics.categoryStats || !processes) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Team Skill Competency
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-slate-500 py-8">
          No skill matrix data available.
        </CardContent>
      </Card>
    );
  }

  // Transform category stats into skill data for the radar chart
  const skillData = analytics.categoryStats
    .slice(0, 6) // Max 6 for readability
    .map(category => ({
      skill: category.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      'Competency': Math.round(category.avgScore || 0),
      fullMark: 100,
    }));

  // If no skill data, show empty state
  if (skillData.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Team Skill Competency
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-slate-500 py-8">
          Complete some training to see skill competency data.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Team Skill Competency
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar 
              name="Team Avg Score" 
              dataKey="Competency" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6} 
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
        
        {/* Additional skill breakdown */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {skillData.map((skill, index) => (
            <div key={index} className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="font-semibold text-sm text-slate-700">{skill.skill}</div>
              <div className="text-2xl font-bold text-indigo-600">{skill.Competency}%</div>
              <div className="text-xs text-slate-500">Team Average</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}