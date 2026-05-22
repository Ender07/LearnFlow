import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Play, 
  Pause, 
  RotateCcw,
  Check
} from 'lucide-react';
import { cn } from '@/components/lib/utils';

export default function ExecutionControls({
  sessionActive,
  currentStep,
  totalSteps,
  completedSteps,
  canCompleteStep,
  isLastStep,
  onStart,
  onPause,
  onResume,
  onComplete,
  onReset,
  onNavigate
}) {
  const isFirstStep = currentStep === 0;
  const sessionStartTime = sessionActive ? true : null; // derive from sessionActive

  return (
    <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Left Controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => onNavigate('previous')}
            disabled={isFirstStep || !sessionActive}
            variant="outline"
            className="flex items-center gap-2"
            aria-label="Previous step"
          >
            <ArrowLeft className="w-5 h-5" />
            Prev
          </Button>
          <Button
            onClick={() => onNavigate('next')}
            disabled={isLastStep || !completedSteps.has(currentStep)}
            variant="outline"
            className="flex items-center gap-2"
            aria-label="Next step"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Center Controls: Main Actions */}
        <div className="flex items-center gap-3">
          {!sessionActive && sessionStartTime === null && (
             <Button onClick={onStart} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-shadow">
               <Play className="w-5 h-5 mr-2" /> Start Process
             </Button>
          )}

          {sessionActive && (
            <Button onClick={onPause} size="lg" variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50">
              <Pause className="w-5 h-5 mr-2" /> Pause
            </Button>
          )}

          {!sessionActive && sessionStartTime !== null && (
            <Button onClick={onResume} size="lg" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
              <Play className="w-5 h-5 mr-2" /> Resume
            </Button>
          )}

          {canCompleteStep && (
            <Button
              onClick={onComplete}
              size="lg"
              disabled={completedSteps.has(currentStep)}
              className={cn(
                "bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-shadow",
                completedSteps.has(currentStep) 
                  ? "from-slate-400 to-slate-500" 
                  : "from-green-500 to-emerald-600"
              )}
            >
              {completedSteps.has(currentStep) ? (
                <>
                  <Check className="w-5 h-5 mr-2" /> Completed
                </>
              ) : (
                <>
                  {isLastStep ? <CheckCircle className="w-5 h-5 mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                  {isLastStep ? 'Finish Process' : 'Complete Step'}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Right Controls */}
        <div>
          <Button onClick={onReset} variant="destructive_outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}