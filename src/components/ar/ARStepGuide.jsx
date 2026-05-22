import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ARStepGuide({ step, stepNumber, isCompleted, onComplete, safetyAcknowledged }) {
  if (!step) return null;

  const isSafetyCritical = step.safety_warnings && step.safety_warnings.length > 0;
  const isActionable = !isSafetyCritical || (isSafetyCritical && safetyAcknowledged);

  return (
    <motion.div
      key={step.step_id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="w-[450px]"
    >
      <Card className="bg-black/80 backdrop-blur-lg border-2 border-blue-500/50 text-white shadow-2xl shadow-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-blue-300">
              Step {stepNumber}: {step.title}
            </CardTitle>
            {isCompleted && <CheckCircle className="w-6 h-6 text-green-400" />}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-slate-200 leading-relaxed">
            {step.description}
          </p>

          {step.media_urls && step.media_urls.length > 0 && (
            <div className="mb-4 rounded-lg overflow-hidden border border-slate-700">
              <img src={step.media_urls[0]} alt={`Step ${stepNumber} illustration`} className="w-full h-auto object-cover" />
            </div>
          )}
          
          {step.tools_required && step.tools_required.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-slate-300 mb-2">Tools Needed:</h4>
              <div className="flex flex-wrap gap-2">
                {step.tools_required.map((tool, index) => (
                  <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-200">{tool}</Badge>
                ))}
              </div>
            </div>
          )}

          {!isCompleted && (
            <Button
              onClick={onComplete}
              disabled={!isActionable}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-6"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark as Complete
            </Button>
          )}

          {!isActionable && (
            <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-500 rounded-lg text-yellow-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Acknowledge safety warnings to proceed.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}