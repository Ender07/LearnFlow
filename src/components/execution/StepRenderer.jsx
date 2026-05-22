import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Wrench, CheckCircle, Brain, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import IntelligentStepAssistant from '../ai/IntelligentStepAssistant';

export default function StepRenderer({
  step,
  stepIndex,
  isCompleted,
  sessionActive,
  onError,
  onNotesChange,
  notes,
  onComplete,
  onPrevious,
  isFirst,
  isLast,
  userProgress
}) {
  // Hooks MUST be called before any early return
  const [localStep, setLocalStep] = useState(step || {});
  const [hint, setHint] = useState('');

  if (!step) return null;

  const getStepTypeBadge = (type) => {
    switch (type) {
      case 'quality_check': return 'bg-yellow-100 text-yellow-800';
      case 'decision_point': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAdaptStep = (adaptation) => {
    setLocalStep(prev => {
      let adapted = { ...prev };
      switch (adaptation.type) {
        case 'simplify':
          const sentences = adapted.description ? adapted.description.split(/(?<=[.!?])\s+/) : [];
          adapted.simplified_description = sentences.slice(0, 2).join(' ') + (sentences.length > 2 ? '...' : '');
          adapted.isAdapted = true;
          break;
        case 'highlight_quality':
          adapted.highlightQuality = true;
          adapted.isAdapted = true;
          break;
        default:
          break;
      }
      return adapted;
    });
  };

  const handleProvideHint = (currentStep) => {
    const hints = [
      currentStep.description ? `Focus on: ${currentStep.description.split(' ').slice(0, 8).join(' ')}...` : null,
      currentStep.safety_warnings?.length > 0 ? `Safety first: ${currentStep.safety_warnings[0]}` : null,
      currentStep.quality_criteria?.length > 0 ? `Quality check: ${currentStep.quality_criteria[0]}` : null,
      "If unsure, consult your supervisor."
    ].filter(Boolean);

    if (hints.length > 0) {
      setHint(hints[Math.floor(Math.random() * hints.length)]);
    }
  };

  const renderInstructionContent = () => {
    switch (localStep.instruction_type) {
      case 'quality_check':
        return (
          <div className="space-y-4 mt-4">
            <h4 className="font-semibold text-lg text-slate-700">Quality Checklist</h4>
            {localStep.quality_criteria?.map((criterion, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 bg-slate-100 rounded-md ${localStep.highlightQuality ? 'border-2 border-yellow-400' : ''}`}>
                <Checkbox id={`qc-${index}`} disabled={!sessionActive || isCompleted} />
                <label htmlFor={`qc-${index}`} className="text-sm font-medium leading-none">
                  {criterion}
                </label>
              </div>
            ))}
          </div>
        );
      case 'decision_point':
        return (
          <div className="space-y-4 mt-4">
            <h4 className="font-semibold text-lg text-slate-700">Decision Point</h4>
            <p className="text-slate-600">Based on the current state, choose the next course of action.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              {localStep.isAdapted && (
                <Badge className="bg-purple-100 text-purple-700">
                  <Brain className="w-3 h-3 mr-1" />
                  AI-Adapted
                </Badge>
              )}
              {localStep.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStepTypeBadge(localStep.instruction_type)}>
                {localStep.instruction_type?.replace('_', ' ') || 'standard'}
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-slate max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {localStep.simplified_description || localStep.description}
            </p>
          </div>

          <AnimatePresence>
            {hint && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                <Alert className="bg-blue-50 border-blue-200">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <strong>AI Hint:</strong> {hint}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            <div className="space-y-6">
              {localStep.safety_warnings?.length > 0 && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle className="font-bold">Safety Warning</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {localStep.safety_warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {localStep.tools_required?.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                    <Wrench className="w-5 h-5" />
                    Tools and Equipment
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {localStep.tools_required.map((tool, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">{tool}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {renderInstructionContent()}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Notes and Observations</label>
                <Textarea
                  placeholder="Record any notes for this step..."
                  value={notes}
                  onChange={(e) => onNotesChange && onNotesChange(e.target.value)}
                  disabled={!sessionActive || isCompleted}
                />
              </div>
            </div>

            <div className="space-y-4">
              {localStep.media_urls?.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {url.includes('.mp4') ? (
                    <video controls className="w-full rounded-lg shadow-md">
                      <source src={url} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={url} alt={`Step media ${index + 1}`} className="w-full h-auto object-cover rounded-lg shadow-md" />
                  )}
                </motion.div>
              ))}
              {!localStep.media_urls?.length && (
                <div className="flex items-center justify-center h-48 bg-slate-100 rounded-lg border-2 border-dashed">
                  <p className="text-slate-500">No media for this step.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <IntelligentStepAssistant
        currentStep={localStep}
        stepIndex={stepIndex}
        userProgress={userProgress}
        cognitiveProfile={null}
        onAdaptStep={handleAdaptStep}
        onProvideHint={handleProvideHint}
      />
    </div>
  );
}