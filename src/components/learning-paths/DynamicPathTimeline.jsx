import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, PlayCircle, Lock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function StepNode({ step, processData, userProgress, isLast, index }) {
  const progress = userProgress.find(up => up.process_id === step.process_id);
  const isCompleted = step.status === 'completed' || progress?.status === 'completed';
  const isActive = !isCompleted && (step.status === 'active' || step.sequence_order === 1);
  const isPending = !isCompleted && !isActive;

  return (
    <div className="flex gap-4">
      {/* Left: icon + line */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
          isCompleted
            ? 'bg-green-500/20 border-green-500 text-green-400'
            : isActive
            ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
            : 'bg-slate-800 border-slate-600 text-slate-500'
        }`}>
          {isCompleted
            ? <CheckCircle2 className="w-4 h-4" />
            : isActive
            ? <PlayCircle className="w-4 h-4" />
            : <Circle className="w-4 h-4" />}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 min-h-[2rem] ${isCompleted ? 'bg-green-500/40' : 'bg-slate-700'}`} />
        )}
      </div>

      {/* Right: content */}
      <div className={`pb-6 flex-1 ${isLast ? '' : ''}`}>
        <div className={`p-4 rounded-xl border transition-all ${
          isCompleted
            ? 'bg-green-500/5 border-green-500/20'
            : isActive
            ? 'bg-blue-500/5 border-blue-500/30'
            : 'bg-slate-800/50 border-slate-700/50'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-slate-500 text-xs font-mono">Step {step.sequence_order}</span>
                {isCompleted && <Badge className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-400 border-green-500/20">Completed</Badge>}
                {isActive && <Badge className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-400 border-blue-500/20">In Progress</Badge>}
              </div>
              <h4 className={`font-semibold text-sm ${isCompleted ? 'text-slate-400 line-through' : isActive ? 'text-white' : 'text-slate-300'}`}>
                {processData?.title || 'Process not found'}
              </h4>
              {step.ai_reasoning && (
                <p className="text-slate-500 text-xs mt-1 line-clamp-2">{step.ai_reasoning}</p>
              )}
              {progress?.completion_percentage != null && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{progress.completion_percentage}%</span>
                  </div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${progress.completion_percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {isActive && processData && (
              <Button size="sm" asChild className="shrink-0 bg-blue-600 hover:bg-blue-700">
                <Link to={`/ProcessExecution?id=${step.process_id}`}>
                  Start <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            )}
            {isCompleted && processData && (
              <Button size="sm" variant="ghost" asChild className="shrink-0 text-slate-400">
                <Link to={`/ProcessExecution?id=${step.process_id}`}>
                  Review
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DynamicPathTimeline({ path, processes, userProgress }) {
  const sequence = path.generated_sequence || [];
  const completedCount = sequence.filter(s => s.status === 'completed').length;
  const totalCount = sequence.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-slate-400 text-sm shrink-0">{completedCount}/{totalCount} steps</span>
        <span className="text-blue-400 text-sm font-semibold shrink-0">{progressPct}%</span>
      </div>

      {/* Timeline steps */}
      <div className="pt-2">
        {sequence.map((step, idx) => {
          const processData = processes.find(p => p.id === step.process_id);
          return (
            <StepNode
              key={step.process_id || idx}
              step={step}
              processData={processData}
              userProgress={userProgress}
              isLast={idx === sequence.length - 1}
              index={idx}
            />
          );
        })}
      </div>
    </div>
  );
}