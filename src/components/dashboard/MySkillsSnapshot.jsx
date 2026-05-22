
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

// Memoized component with optimized skill calculations
export default React.memo(function MySkillsSnapshot({ userProgress = [], processes = [], learningAnalytics }) {
  
  // Memoize expensive skill level calculations using new learningAnalytics data
  const skillLevels = React.useMemo(() => {
    if (!learningAnalytics || !learningAnalytics.skill_proficiency) return [];

    const { skill_proficiency } = learningAnalytics;

    return Object.entries(skill_proficiency).map(([category, data]) => {
      const { completed, total, scores } = data;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      const averageScore = scores.length > 0 
        ? scores.reduce((acc, score) => acc + score, 0) / scores.length 
        : 0;
      
      const competencyLevel = Math.round((completionRate * 0.6) + (averageScore * 0.4));
      
      return {
        name: category.replace(/_/g, ' '),
        competencyLevel,
        completedProcesses: completed,
        totalProcesses: total,
      };
    }).sort((a, b) => b.competencyLevel - a.competencyLevel);
  }, [learningAnalytics]);

  // Memoize skill gaps calculation
  const skillGaps = React.useMemo(() => {
    if (learningAnalytics && Array.isArray(learningAnalytics.knowledge_gaps)) {
      return learningAnalytics.knowledge_gaps.slice(0, 3).map(gap => ({
          skill: gap.replace(/_/g, ' '),
          priority: 'high'
      }));
    }
    return [];
  }, [learningAnalytics]);

  // Memoize helper functions
  const getCompetencyColor = React.useCallback((level) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  }, []);

  const getCompetencyLabel = React.useCallback((level) => {
    if (level >= 80) return 'Expert';
    if (level >= 60) return 'Intermediate';
    if (level >= 30) return 'Beginner';
    return 'Needs Development';
  }, []);

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            Skills Snapshot
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to={createPageUrl('Analytics')}>
              View Details <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Skills */}
        {skillLevels.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Top Competencies
            </h4>
            <div className="space-y-3">
              {skillLevels.slice(0, 3).map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {skill.name}
                    </span>
                    <Badge className={`text-white ${getCompetencyColor(skill.competencyLevel)}`}>
                      {getCompetencyLabel(skill.competencyLevel)}
                    </Badge>
                  </div>
                  <Progress value={skill.competencyLevel} className="h-2" />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{skill.completedProcesses}/{skill.totalProcesses} processes</span>
                    <span>{skill.competencyLevel}% competency</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Gaps */}
        {skillGaps.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-3">Development Opportunities</h4>
            <div className="space-y-2">
              {skillGaps.map((gap, index) => (
                <motion.div
                  key={gap.skill || `gap-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {gap.skill || gap.category}
                    </span>
                    <Badge variant={gap.priority === 'high' ? 'destructive' : 'secondary'}>
                      {gap.priority === 'high' ? 'High Priority' : 'Recommended'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {skillLevels.length === 0 && skillGaps.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Target className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>Complete some training to see your skills snapshot</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
