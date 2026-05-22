import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntelligentStepAssistant({ 
  currentStep, 
  stepIndex,
  userProgress, 
  cognitiveProfile,
  onAdaptStep,
  onProvideHint
}) {
  const [stepAnalysis, setStepAnalysis] = useState(null);
  const [adaptiveSuggestions, setAdaptiveSuggestions] = useState([]);
  const [realTimeSupport, setRealTimeSupport] = useState(null);
  const [stepStartTime] = useState(Date.now());

  useEffect(() => {
    analyzeStepComplexity();
    checkUserProgress();
    generateRealTimeSupport();
  }, [currentStep, stepIndex, userProgress, cognitiveProfile]);

  const analyzeStepComplexity = () => {
    // AI analysis of step complexity
    const wordCount = currentStep.description?.split(' ').length || 0;
    const hasMedia = currentStep.media_urls && currentStep.media_urls.length > 0;
    const hasSafetyWarnings = currentStep.safety_warnings && currentStep.safety_warnings.length > 0;
    const hasQualityCriteria = currentStep.quality_criteria && currentStep.quality_criteria.length > 0;
    
    let complexityScore = 0;
    
    // Base complexity from word count
    if (wordCount > 100) complexityScore += 2;
    else if (wordCount > 50) complexityScore += 1;
    
    // Additional complexity factors
    if (currentStep.instruction_type === 'quality_check') complexityScore += 2;
    if (currentStep.instruction_type === 'safety_critical') complexityScore += 3;
    if (currentStep.instruction_type === 'decision_point') complexityScore += 2;
    if (hasSafetyWarnings) complexityScore += 1;
    if (hasQualityCriteria) complexityScore += 1;
    if (currentStep.tools_required && currentStep.tools_required.length > 2) complexityScore += 1;
    
    const analysis = {
      complexityScore,
      complexityLevel: complexityScore <= 2 ? 'simple' : complexityScore <= 5 ? 'moderate' : 'complex',
      estimatedTime: Math.max(30, complexityScore * 45), // seconds
      cognitiveLoad: complexityScore > 4 ? 'high' : complexityScore > 2 ? 'medium' : 'low',
      recommendedApproach: getRecommendedApproach(complexityScore, currentStep.instruction_type)
    };
    
    setStepAnalysis(analysis);
  };

  const getRecommendedApproach = (complexity, instructionType) => {
    if (instructionType === 'safety_critical') {
      return 'Take extra time to review safety protocols before proceeding';
    }
    
    if (complexity > 5) {
      return 'Break this step into smaller parts and tackle one element at a time';
    }
    
    if (complexity > 3) {
      return 'Read through completely before starting, then proceed methodically';
    }
    
    return 'Follow the instructions step-by-step at a comfortable pace';
  };

  const checkUserProgress = () => {
    const timeOnStep = Date.now() - stepStartTime;
    const expectedTime = stepAnalysis?.estimatedTime * 1000 || 60000;
    
    const suggestions = [];
    
    // Time-based adaptations
    if (timeOnStep > expectedTime * 2) {
      suggestions.push({
        type: 'time_support',
        message: 'This step is taking longer than expected. Would you like a hint or simplified instructions?',
        action: 'provide_hint',
        priority: 'high'
      });
    }
    
    // Cognitive load adaptations
    if (stepAnalysis?.cognitiveLoad === 'high' && cognitiveProfile?.cognitive_capacity?.working_memory < 5) {
      suggestions.push({
        type: 'cognitive_adaptation',
        message: 'This step has high cognitive load. Consider breaking it into smaller parts.',
        action: 'simplify_step',
        priority: 'medium'
      });
    }
    
    // Error pattern detection (simulated)
    const errorProbability = Math.random();
    if (errorProbability > 0.85 && stepAnalysis?.complexityLevel === 'complex') {
      suggestions.push({
        type: 'error_prevention',
        message: 'Common mistakes occur at this step. Review the quality criteria carefully.',
        action: 'highlight_quality',
        priority: 'medium'
      });
    }
    
    setAdaptiveSuggestions(suggestions);
  };

  const generateRealTimeSupport = () => {
    if (!stepAnalysis) return;
    
    const support = {
      focusAreas: [],
      warningIndicators: [],
      encouragement: null
    };
    
    // Focus areas based on step type
    if (currentStep.instruction_type === 'quality_check') {
      support.focusAreas.push('Pay special attention to measurement precision');
      support.focusAreas.push('Double-check against quality standards');
    }
    
    if (currentStep.instruction_type === 'safety_critical') {
      support.focusAreas.push('Verify all safety equipment is in place');
      support.focusAreas.push('Follow safety protocols exactly as written');
    }
    
    // Warning indicators
    if (stepAnalysis.complexityLevel === 'complex') {
      support.warningIndicators.push('High complexity - take your time');
    }
    
    if (currentStep.tools_required && currentStep.tools_required.length > 0) {
      support.warningIndicators.push(`Requires ${currentStep.tools_required.length} tools`);
    }
    
    // Adaptive encouragement
    if (stepAnalysis.complexityLevel === 'simple') {
      support.encouragement = "You've got this! This step is straightforward.";
    } else if (stepAnalysis.complexityLevel === 'moderate') {
      support.encouragement = "Take it step by step - you're doing great!";
    } else {
      support.encouragement = "Complex step ahead. Break it down and tackle each part carefully.";
    }
    
    setRealTimeSupport(support);
  };

  const handleApplySuggestion = (suggestion) => {
    switch (suggestion.action) {
      case 'provide_hint':
        onProvideHint(currentStep);
        break;
      case 'simplify_step':
        onAdaptStep({
          type: 'simplify',
          stepIndex,
          adaptation: 'Simplified instructions based on cognitive load analysis'
        });
        break;
      case 'highlight_quality':
        onAdaptStep({
          type: 'highlight_quality',
          stepIndex,
          adaptation: 'Quality criteria highlighted to prevent common errors'
        });
        break;
    }
    
    // Remove applied suggestion
    setAdaptiveSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const getComplexityColor = (level) => {
    switch (level) {
      case 'simple': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'complex': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Step Analysis Card */}
      {stepAnalysis && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              AI Step Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Complexity Level</span>
              <Badge className={getComplexityColor(stepAnalysis.complexityLevel)}>
                {stepAnalysis.complexityLevel}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Estimated Time</span>
              <span className="text-sm font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.ceil(stepAnalysis.estimatedTime / 60)} min
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Cognitive Load</span>
              <Badge variant="outline" className="capitalize">
                {stepAnalysis.cognitiveLoad}
              </Badge>
            </div>
            
            {stepAnalysis.recommendedApproach && (
              <Alert className="bg-blue-50 border-blue-200">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 text-sm">
                  <strong>AI Recommendation:</strong> {stepAnalysis.recommendedApproach}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Adaptive Suggestions */}
      <AnimatePresence>
        {adaptiveSuggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Alert className={`${
              suggestion.priority === 'high' ? 'bg-red-50 border-red-200' :
              suggestion.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <AlertTriangle className={`h-4 w-4 ${
                suggestion.priority === 'high' ? 'text-red-600' :
                suggestion.priority === 'medium' ? 'text-yellow-600' :
                'text-blue-600'
              }`} />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{suggestion.message}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="ml-3"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Real-time Support */}
      {realTimeSupport && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Smart Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {realTimeSupport.focusAreas.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm text-slate-700 mb-2">Focus Areas</h5>
                <ul className="space-y-1">
                  {realTimeSupport.focusAreas.map((area, index) => (
                    <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {realTimeSupport.warningIndicators.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm text-slate-700 mb-2">Important Notes</h5>
                <ul className="space-y-1">
                  {realTimeSupport.warningIndicators.map((warning, index) => (
                    <li key={index} className="text-sm text-orange-600 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {realTimeSupport.encouragement && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {realTimeSupport.encouragement}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}