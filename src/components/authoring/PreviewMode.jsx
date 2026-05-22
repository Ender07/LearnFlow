import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Eye, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Target,
  Wrench
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PreviewMode({ process }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!process || !process.steps || process.steps.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Eye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No Content to Preview
          </h3>
          <p className="text-slate-500">
            Add some steps to your process to see the preview
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentStepData = process.steps[currentStep];

  const getStepIcon = (instructionType) => {
    switch (instructionType) {
      case 'safety_critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'quality_check':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'measurement':
        return <Target className="w-5 h-5 text-blue-500" />;
      default:
        return <div className="w-5 h-5 bg-blue-500 rounded-full" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      onboarding: 'bg-green-100 text-green-800 border-green-200',
      safety: 'bg-red-100 text-red-800 border-red-200',
      assembly: 'bg-blue-100 text-blue-800 border-blue-200',
      quality_control: 'bg-purple-100 text-purple-800 border-purple-200',
      maintenance: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const nextStep = () => {
    if (currentStep < process.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Process Header */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-900 mb-2">
                {process.title || "Untitled Process"}
              </CardTitle>
              <p className="text-slate-600">
                {process.description || "No description provided"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`border ${getCategoryColor(process.category)}`}>
                {process.category?.replace('_', ' ') || 'Uncategorized'}
              </Badge>
              <Badge variant="outline">
                {process.difficulty_level || 'Beginner'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{process.estimated_duration || 0} minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{process.steps.length} steps</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{process.steps.filter(s => s.is_critical).length} critical steps</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={previousStep}
                disabled={currentStep === 0}
                variant="outline"
                size="sm"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Step {currentStep + 1} of {process.steps.length}
                </span>
                <Progress 
                  value={((currentStep + 1) / process.steps.length) * 100} 
                  className="w-32 h-2"
                />
              </div>

              <Button
                onClick={nextStep}
                disabled={currentStep === process.steps.length - 1}
                variant="outline"
                size="sm"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
                  {currentStep + 1}
                </div>
                {getStepIcon(currentStepData.instruction_type)}
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {currentStepData.title || `Step ${currentStep + 1}`}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {currentStepData.instruction_type?.replace('_', ' ') || 'Standard'}
                    </Badge>
                    {currentStepData.is_critical && (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        Critical
                      </Badge>
                    )}
                    {currentStepData.time_limit && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                        {currentStepData.time_limit} min limit
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step Description */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Instructions</h4>
                <p className="text-slate-700 leading-relaxed">
                  {currentStepData.description || "No description provided"}
                </p>
              </div>

              {/* Media Preview */}
              {currentStepData.media_urls && currentStepData.media_urls.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Media</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currentStepData.media_urls.map((url, index) => (
                      <div key={index} className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-8 h-8 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools Required */}
              {currentStepData.tools_required && currentStepData.tools_required.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-green-500" />
                    Tools Required
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentStepData.tools_required.map((tool, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Warnings */}
              {currentStepData.safety_warnings && currentStepData.safety_warnings.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Safety Warnings
                  </h4>
                  <ul className="space-y-1">
                    {currentStepData.safety_warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quality Criteria */}
              {currentStepData.quality_criteria && currentStepData.quality_criteria.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Quality Checkpoints
                  </h4>
                  <ul className="space-y-1">
                    {currentStepData.quality_criteria.map((criteria, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Step Overview */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Process Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {process.steps.map((step, index) => (
              <div
                key={step.step_id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  index === currentStep
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-slate-900">
                    {step.title || `Step ${index + 1}`}
                  </h5>
                  <p className="text-sm text-slate-600 line-clamp-1">
                    {step.description || "No description"}
                  </p>
                </div>
                {step.is_critical && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}