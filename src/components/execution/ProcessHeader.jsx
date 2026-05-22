
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // New import
import { ArrowLeft, BrainCircuit } from 'lucide-react'; // Brain removed, BrainCircuit added, Timer, Crosshair, Shield removed
import { motion } from 'framer-motion'; // New import

export default function ProcessHeader({ process, currentStep, totalSteps, progress, onExit }) { // sessionMetrics and onBack removed, onExit added
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Exit Process
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <h1 className="text-xl font-bold text-gray-900">{process.title}</h1>
            {/* NEW: AI Enhancement Badge */}
            <Badge className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700">
              <BrainCircuit className="w-3 h-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Step {currentStep} of {totalSteps}</span> {/* currentStep is used directly, not +1 */}
            <span>•</span>
            <span>{process.estimated_duration || 30} min estimated</span>
            <span>•</span>
            <span className="capitalize">{process.difficulty_level || 'beginner'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{Math.round(progress)}% Complete</div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
