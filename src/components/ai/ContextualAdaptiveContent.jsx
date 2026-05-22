import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  ArrowDown, 
  ArrowUp, 
  BookOpen, 
  Video,
  Image,
  FileText,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InvokeLLM } from '@/integrations/Core';

export default function ContextualAdaptiveContent({ 
  currentStep, 
  userProgress, 
  userAnalytics,
  onContentAdaptation 
}) {
  const [adaptedContent, setAdaptedContent] = useState(null);
  const [isAdapting, setIsAdapting] = useState(false);
  const [userStruggle, setUserStruggle] = useState(false);
  const [requestedComplexity, setRequestedComplexity] = useState(null);

  useEffect(() => {
    // Monitor user behavior to detect struggle or rapid progress
    monitorUserBehavior();
  }, [currentStep, userProgress]);

  const monitorUserBehavior = () => {
    // Simulate struggle detection based on time spent or repeated visits
    const timeOnStep = Date.now() - (userProgress?.step_start_time || Date.now());
    const isStruggling = timeOnStep > (currentStep?.expected_duration * 1000 * 2); // 2x expected time
    
    if (isStruggling && !userStruggle) {
      setUserStruggle(true);
      triggerContentAdaptation('simplify');
    }
  };

  const triggerContentAdaptation = async (adaptationType) => {
    if (!currentStep) return;
    
    setIsAdapting(true);
    try {
      const adaptationPrompt = `The user is currently on this training step:
      
      Title: ${currentStep.title}
      Description: ${currentStep.description}
      Current complexity: ${currentStep.difficulty_level || 'intermediate'}
      
      User context:
      - Learning style: ${userAnalytics?.learning_style || 'unknown'}
      - Time spent on step: ${userStruggle ? 'Significantly longer than expected' : 'Normal'}
      - Previous performance: ${userProgress?.quiz_score || 'N/A'}%
      
      Please ${adaptationType === 'simplify' ? 'simplify and break down' : adaptationType === 'elaborate' ? 'provide more detailed explanation' : 'adjust'} this content.
      
      Provide:
      1. Alternative explanation approach
      2. Additional supporting materials
      3. Different examples or analogies
      4. Interactive elements suggestion`;

      const aiResponse = await InvokeLLM({
        prompt: adaptationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            adapted_title: { type: "string" },
            adapted_description: { type: "string" },
            explanation_approach: { type: "string" },
            supporting_materials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  content: { type: "string" },
                  media_suggestion: { type: "string" }
                }
              }
            },
            interactive_elements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  element_type: { type: "string" },
                  description: { type: "string" },
                  implementation: { type: "string" }
                }
              }
            },
            difficulty_adjustment: { type: "string" },
            estimated_time_adjustment: { type: "number" }
          }
        }
      });

      setAdaptedContent(aiResponse);
      onContentAdaptation?.(aiResponse);

    } catch (error) {
      console.error('Error adapting content:', error);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleComplexityRequest = (complexity) => {
    setRequestedComplexity(complexity);
    triggerContentAdaptation(complexity);
  };

  const getSupportingMaterialIcon = (type) => {
    const icons = {
      video: Video,
      image: Image,
      document: FileText,
      interactive: MessageCircle,
      example: Lightbulb
    };
    return icons[type] || BookOpen;
  };

  return (
    <div className="space-y-4">
      {/* Adaptation Controls */}
      <Card className="border-0 shadow-sm bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-700">Need Different Explanation?</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleComplexityRequest('simplify')}
                disabled={isAdapting}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <ArrowDown className="w-3 h-3 mr-1" />
                Simplify
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleComplexityRequest('elaborate')}
                disabled={isAdapting}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <ArrowUp className="w-3 h-3 mr-1" />
                More Detail
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Struggle Detection Alert */}
      <AnimatePresence>
        {userStruggle && !adaptedContent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="border-orange-200 bg-orange-50">
              <Lightbulb className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Taking a bit longer on this step? I can provide a simplified explanation or additional examples to help.
                <Button
                  size="sm"
                  className="ml-2 bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => triggerContentAdaptation('simplify')}
                >
                  Get Help
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adapted Content Display */}
      <AnimatePresence>
        {adaptedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Lightbulb className="w-5 h-5" />
                  Personalized Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adapted Main Content */}
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-slate-800 mb-2">
                    {adaptedContent.adapted_title}
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    {adaptedContent.adapted_description}
                  </p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                    {adaptedContent.explanation_approach}
                  </Badge>
                </div>

                {/* Supporting Materials */}
                {adaptedContent.supporting_materials?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-slate-700 mb-3">Additional Resources</h5>
                    <div className="grid gap-3">
                      {adaptedContent.supporting_materials.map((material, index) => {
                        const IconComponent = getSupportingMaterialIcon(material.type);
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200"
                          >
                            <div className="p-2 rounded-lg bg-slate-100">
                              <IconComponent className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="flex-1">
                              <h6 className="font-medium text-slate-800">{material.title}</h6>
                              <p className="text-sm text-slate-600">{material.content}</p>
                              {material.media_suggestion && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {material.media_suggestion}
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Interactive Elements */}
                {adaptedContent.interactive_elements?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-slate-700 mb-3">Try These Interactive Elements</h5>
                    <div className="space-y-2">
                      {adaptedContent.interactive_elements.map((element, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-medium text-slate-800">{element.element_type}</span>
                            <p className="text-sm text-slate-600">{element.description}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Try It
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Difficulty Adjustment Info */}
                {adaptedContent.difficulty_adjustment && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Difficulty adjusted:</strong> {adaptedContent.difficulty_adjustment}
                    </p>
                    {adaptedContent.estimated_time_adjustment && (
                      <p className="text-xs text-green-700 mt-1">
                        Estimated time: {adaptedContent.estimated_time_adjustment} minutes
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isAdapting && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-slate-600">Adapting content to your needs...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}