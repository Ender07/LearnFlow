import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Clock, 
  Award, 
  CheckCircle, 
  Eye,
  BarChart3,
  Shield,
  Zap,
  Users,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProcessCard({ process, userProgress, viewMode = "grid", index = 0 }) {
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'safety': return 'bg-red-100 text-red-800';
      case 'quality_control': return 'bg-blue-100 text-blue-800';
      case 'assembly': return 'bg-purple-100 text-purple-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'machine_setup': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'ar_guided': return <Eye className="w-4 h-4" />;
      case 'vr_simulation': return <Zap className="w-4 h-4" />;
      case 'interactive': return <BarChart3 className="w-4 h-4" />;
      case 'video': return <Play className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getStatusButton = () => {
    if (!userProgress) {
      return (
        <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
          <Link to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
            <Play className="w-4 h-4 mr-2" />
            Start Training
          </Link>
        </Button>
      );
    }

    switch (userProgress.status) {
      case 'in_progress':
        return (
          <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
            <Link to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue ({userProgress.completion_percentage || 0}%)
            </Link>
          </Button>
        );
      case 'completed':
        return (
          <Button asChild variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
            <Link to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Review Training
            </Link>
          </Button>
        );
      default:
        return (
          <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
            <Link to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
              <Play className="w-4 h-4 mr-2" />
              Start Training
            </Link>
          </Link>
        );
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  {getContentTypeIcon(process.content_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-slate-800">{process.title}</h3>
                    {process.hazard_level === 'high' && (
                      <Shield className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-2">{process.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(process.difficulty_level)}>
                      {process.difficulty_level}
                    </Badge>
                    <Badge className={getCategoryColor(process.category)}>
                      {process.category?.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <Clock className="w-3 h-3" />
                      {process.estimated_duration || 30} min
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                {getStatusButton()}
              </div>
            </div>
            {userProgress?.status === 'in_progress' && (
              <div className="mt-4">
                <Progress value={userProgress.completion_percentage || 0} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors">
                  {process.title}
                </CardTitle>
                {process.hazard_level === 'high' && (
                  <Shield className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getDifficultyColor(process.difficulty_level)}>
                  {process.difficulty_level}
                </Badge>
                <Badge className={getCategoryColor(process.category)}>
                  {process.category?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
              {getContentTypeIcon(process.content_type)}
            </div>
          </div>
          <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
            {process.description}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {process.estimated_duration || 30} min
            </div>
            {process.grants_certification_id && (
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                Certificate
              </div>
            )}
            {process.steps && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {process.steps.length} steps
              </div>
            )}
          </div>
          
          {userProgress?.status === 'in_progress' && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Progress</span>
                <span>{userProgress.completion_percentage || 0}%</span>
              </div>
              <Progress value={userProgress.completion_percentage || 0} className="h-2" />
            </div>
          )}
          
          {getStatusButton()}
        </CardContent>
      </Card>
    </motion.div>
  );
}