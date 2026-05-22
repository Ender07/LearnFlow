import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Play, 
  Clock, 
  Lock,
  Circle,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function LearningPathStepper({ processProgress = [], onProcessClick }) {
  
  const getProcessStatus = (process) => {
    if (process.isCompleted) return 'completed';
    if (process.isInProgress) return 'in_progress';
    if (process.isLocked) return 'locked';
    return 'available';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'in_progress':
        return <Play className="w-6 h-6 text-orange-500" />;
      case 'locked':
        return <Lock className="w-6 h-6 text-slate-400" />;
      default:
        return <Circle className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'in_progress':
        return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
      case 'locked':
        return 'border-slate-200 bg-slate-50 cursor-not-allowed';
      default:
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardContent className="p-8">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Learning Journey Steps</h3>
        
        <div className="space-y-4">
          {processProgress.map((item, index) => {
            const status = getProcessStatus(item);
            const isClickable = status !== 'locked';
            
            return (
              <motion.div
                key={item.process.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection Line */}
                {index < processProgress.length - 1 && (
                  <div className="absolute left-8 top-16 w-px h-8 bg-slate-200 z-0" />
                )}
                
                <div
                  className={`
                    relative z-10 border-2 rounded-xl p-4 transition-all duration-300
                    ${getStatusColor(status)}
                    ${isClickable ? 'cursor-pointer' : ''}
                  `}
                  onClick={() => isClickable && onProcessClick?.(item.process)}
                >
                  <div className="flex items-center gap-4">
                    {/* Step Number & Status Icon */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <div className="w-12 h-12 bg-white rounded-full border-2 border-current flex items-center justify-center font-bold text-slate-600">
                        {index + 1}
                      </div>
                      {getStatusIcon(status)}
                    </div>
                    
                    {/* Process Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-800 truncate">{item.process.title}</h4>
                        {status === 'completed' && item.progress?.quiz_score && (
                          <Badge variant="outline" className="text-xs">
                            {item.progress.quiz_score}% score
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                        {item.process.description}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.process.estimated_duration || 30} min
                        </div>
                        <Badge className={getDifficultyColor(item.process.difficulty_level)}>
                          {item.process.difficulty_level}
                        </Badge>
                        <Badge variant="outline">
                          {item.process.category?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {status === 'completed' ? (
                        <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      ) : status === 'in_progress' ? (
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                          <Play className="w-4 h-4 mr-1" />
                          Continue
                        </Button>
                      ) : status === 'available' ? (
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <Lock className="w-4 h-4 mr-1" />
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar for In Progress */}
                  {status === 'in_progress' && item.progress?.completion_percentage > 0 && (
                    <div className="mt-3 ml-16">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress.completion_percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {item.progress.completion_percentage}% complete
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}