import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Route, Award, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

// Memoized component with optimized calculations
export default React.memo(function LearningPathProgress({ learningPaths, userProgress, isLoading }) {
  
  // Memoize the path progress calculation function
  const calculatePathProgress = React.useCallback((path) => {
    if (!path.process_sequence || path.process_sequence.length === 0) return 0;
    
    const completedInPath = path.process_sequence.filter(processId =>
      userProgress.some(progress => 
        progress.process_id === processId && progress.status === 'completed'
      )
    );
    
    return (completedInPath.length / path.process_sequence.length) * 100;
  }, [userProgress]);

  // Memoize the paths with their progress calculations
  const pathsWithProgress = React.useMemo(() => {
    if (!learningPaths || !userProgress) return [];
    
    return learningPaths.slice(0, 3).map(path => ({
      ...path,
      progress: calculatePathProgress(path)
    }));
  }, [learningPaths, userProgress, calculatePathProgress]);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Route className="w-5 h-5 text-indigo-500" />
            Learning Paths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : (
            pathsWithProgress.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{path.title}</h4>
                  {path.certification_available && (
                    <Award className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <Progress value={path.progress} className="h-2 mb-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">{Math.round(path.progress)}% complete</span>
                  <Button variant="ghost" size="sm">
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});