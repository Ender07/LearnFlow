import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ArrowRight, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { AdaptiveLearningEngine } from '@/components/ai/AdaptiveLearningEngine'; // New import

// Memoized component with optimized recommendation algorithm
export default React.memo(function RecommendedProcesses({ processes, userProgress, learningAnalytics }) {
  
  // Memoize the recommendation calculation using the new AdaptiveLearningEngine
  const recommendedProcesses = React.useMemo(() => {
    if (!learningAnalytics) return [];
    return AdaptiveLearningEngine.getAdaptiveRecommendations(learningAnalytics, processes, userProgress);
  }, [processes, userProgress, learningAnalytics]);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="capitalize text-xs"><AlertTriangle className="w-3 h-3 mr-1" /> High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="capitalize text-xs">Recommended</Badge>;
      default:
        return <Badge variant="outline" className="capitalize text-xs">Suggestion</Badge>;
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          Recommended For You
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendedProcesses.length > 0 ? (
          <ul className="space-y-4">
            {recommendedProcesses.map((process, index) => (
              <motion.li 
                key={process.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-slate-200/60 rounded-lg hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{process.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{process.reason}</p>
                  </div>
                  {getPriorityBadge(process.priority)}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <Badge variant="outline" className="capitalize">{process.category.replace('_', ' ')}</Badge>
                  </div>
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
                      {process.priority === 'medium' ? 'Review' : 'Start'} <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-slate-500">
            <p>No specific recommendations at this time.</p>
            <p className="text-xs mt-1">Keep learning to get personalized suggestions!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});