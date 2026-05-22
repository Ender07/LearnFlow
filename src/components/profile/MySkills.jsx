import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MySkills({ userProgress, processes }) {
  const skillsData = useMemo(() => {
    if (!userProgress || !processes) return [];

    const skillCategories = {};
    
    // Initialize categories from all available processes first
    processes.forEach(process => {
      const category = process.category || 'general';
      if (!skillCategories[category]) {
        skillCategories[category] = {
          category,
          total: 0,
          completed: 0,
          scores: []
        };
      }
      skillCategories[category].total++;
    });

    // Populate with user progress
    userProgress.forEach(progress => {
      const process = processes.find(p => p.id === progress.process_id);
      if (!process) return;

      const category = process.category || 'general';
      if (progress.status === 'completed') {
        skillCategories[category].completed++;
        const score = progress.practical_score || progress.quiz_score || 0;
        if (score > 0) {
          skillCategories[category].scores.push(score);
        }
      }
    });

    return Object.values(skillCategories).map(skill => {
      const avgScore = skill.scores.length > 0 
        ? skill.scores.reduce((sum, score) => sum + score, 0) / skill.scores.length
        : 0;
      
      const completionRate = skill.total > 0 ? (skill.completed / skill.total) * 100 : 0;
      // Weighted proficiency: 60% on score, 40% on completion
      const proficiency = Math.round((avgScore * 0.6) + (completionRate * 0.4));

      return {
        ...skill,
        avgScore: Math.round(avgScore),
        completionRate: Math.round(completionRate),
        proficiency
      };
    }).sort((a, b) => b.proficiency - a.proficiency);
  }, [userProgress, processes]);

  const getProficiencyLevel = (score) => {
    if (score >= 90) return { level: 'Expert', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 75) return { level: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { level: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 40) return { level: 'Beginner', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Novice', color: 'text-slate-600', bg: 'bg-slate-100' };
  };

  if (skillsData.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Skills Data</h3>
          <p className="text-slate-500">
            Complete some training processes to see your skills development.
          </p>
        </CardContent>
      </Card>
    );
  }

  const overallProficiency = Math.round(skillsData.reduce((sum, skill) => sum + skill.proficiency, 0) / skillsData.length) || 0;

  return (
    <div className="space-y-6">
      {/* Skills Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{skillsData.length}</div>
            <div className="text-sm text-slate-600">Skill Areas</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {overallProficiency}%
            </div>
            <div className="text-sm text-slate-600">Avg Proficiency</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {skillsData.filter(skill => skill.proficiency >= 75).length}
            </div>
            <div className="text-sm text-slate-600">Advanced Skills</div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Breakdown */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Skills Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {skillsData.map((skill, index) => {
              const { level, color, bg } = getProficiencyLevel(skill.proficiency);
              return (
                <motion.div
                  key={skill.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize text-slate-800">{skill.category.replace(/_/g, ' ')}</h4>
                    <Badge className={`${bg} ${color}`}>{level}</Badge>
                  </div>
                  <Progress value={skill.proficiency} />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{skill.completed}/{skill.total} processes completed</span>
                    <span>{skill.proficiency}% proficiency</span>
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