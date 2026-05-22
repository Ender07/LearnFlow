import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  BookOpen, 
  Clock,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AvailableCertificationCard({ certification, index, learningPaths, processes }) {
  // Get requirement details
  const getRequirementDetails = () => {
    const details = [];
    
    if (certification.required_paths?.length > 0) {
      certification.required_paths.forEach(pathId => {
        const path = learningPaths?.find(p => p.id === pathId);
        if (path) {
          details.push({
            type: 'path',
            title: path.title,
            id: pathId
          });
        }
      });
    }
    
    if (certification.required_processes?.length > 0) {
      certification.required_processes.forEach(processId => {
        const process = processes?.find(p => p.id === processId);
        if (process) {
          details.push({
            type: 'process',
            title: process.title,
            id: processId
          });
        }
      });
    }
    
    return details;
  };

  const requirements = getRequirementDetails();
  const hasStarted = certification.progressPercentage > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group overflow-hidden h-full">
        <div className={`h-2 ${hasStarted ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-slate-300 to-slate-400'}`} />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-12 h-12 ${hasStarted ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-slate-400 to-slate-500'} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Target className="w-6 h-6 text-white" />
            </div>
            {hasStarted && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                <TrendingUp className="w-3 h-3 mr-1" />
                In Progress
              </Badge>
            )}
          </div>
          
          <CardTitle className="text-lg leading-tight group-hover:text-indigo-600 transition-colors">
            {certification.title}
          </CardTitle>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {certification.issuing_authority}
            </Badge>
            {certification.validity_period_months && (
              <Badge variant="outline" className="text-xs">
                Valid {certification.validity_period_months} months
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-slate-600 text-sm line-clamp-3 mb-4">
            {certification.description}
          </p>

          {/* Progress Section */}
          {hasStarted && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Progress</span>
                <span>{certification.completedRequirements}/{certification.totalRequirements} completed</span>
              </div>
              <Progress value={certification.progressPercentage} className="h-2 mb-2" />
              <div className="text-xs text-slate-500">
                {Math.round(certification.progressPercentage)}% complete
              </div>
            </div>
          )}

          {/* Requirements */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Requirements
            </h4>
            <div className="space-y-1">
              {requirements.slice(0, 3).map((req, idx) => (
                <div key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${req.type === 'path' ? 'bg-indigo-400' : 'bg-blue-400'}`} />
                  <span className="truncate">{req.title}</span>
                </div>
              ))}
              {requirements.length > 3 && (
                <div className="text-xs text-slate-500">
                  +{requirements.length - 3} more requirements
                </div>
              )}
            </div>
          </div>

          {/* Estimated Time */}
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>
                Estimated completion: {Math.ceil((certification.totalRequirements || 1) * 45)} minutes
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-2">
            {requirements.length > 0 && (
              <Button asChild className={`w-full ${hasStarted 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' 
                : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800'
              } text-white`}>
                <Link to={
                  requirements[0].type === 'path' 
                    ? createPageUrl(`LearningPathDetails?id=${requirements[0].id}`)
                    : createPageUrl(`ProcessExecution?id=${requirements[0].id}`)
                }>
                  {hasStarted ? 'Continue Progress' : 'Start Journey'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}