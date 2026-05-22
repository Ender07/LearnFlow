
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Process, UserProgress, KnowledgeContribution, Discussion } from '@/entities/all';
import { useGamification } from '@/components/gamification/GamificationEngine';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

import ProcessHeader from '../components/execution/ProcessHeader';
import StepRenderer from '../components/execution/StepRenderer';
import ExecutionControls from '../components/execution/ExecutionControls';
import LearnFlowAssistant from '../components/execution/LearnFlowAssistant';
import ContextualKnowledge from '../components/execution/ContextualKnowledge';

export default function ProcessExecution() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const processId = urlParams.get('id');

  const { awardPoints, pointAwards } = useGamification();
  const { currentUser, refetchData } = useData();

  const [process, setProcess] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [contributions, setContributions] = useState([]);
  const [discussions, setDiscussions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!processId) {
      setError("No process ID provided.");
      setIsLoading(false);
      return;
    }
    loadData();
  }, [processId]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const processData = await Process.get(processId);
      if (!processData) {
        throw new Error("Process not found.");
      }
      setProcess(processData);

      const [progressData, contributionsData, discussionsData] = await Promise.all([
        UserProgress.filter({ process_id: processId, created_by: currentUser.email }).then(res => res[0]),
        KnowledgeContribution.filter({ process_id: processId }),
        Discussion.filter({ process_id: processId })
      ]);

      setContributions(contributionsData || []);
      setDiscussions(discussionsData || []);

      if (progressData) {
        setProgress(progressData);
        setCurrentStepIndex(progressData.current_step || 0);
      } else {
        const newProgress = await UserProgress.create({
          process_id: processId,
          status: 'in_progress',
          completion_percentage: 0,
          current_step: 0,
        });
        setProgress(newProgress);
        setCurrentStepIndex(0);
      }
    } catch (e) {
      console.error("Failed to load process data:", e);
      setError(e.message || "An unexpected error occurred while loading the process.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (stepIndex, isCompleted = false) => {
    if (!progress) return;

    const completion_percentage = Math.round(((stepIndex + 1) / process.steps.length) * 100);
    const status = isCompleted ? 'completed' : 'in_progress';

    const updatedProgress = await UserProgress.update(progress.id, {
      current_step: stepIndex,
      completion_percentage,
      status,
      completed_date: isCompleted ? new Date().toISOString() : null,
      time_spent: (progress.time_spent || 0) + 1 // Simplified time tracking
    });

    setProgress(updatedProgress);
    setCurrentStepIndex(stepIndex);

    if (isCompleted) {
      pointAwards.processCompletion(process.title, 100);
      if (process.grants_certification_id) {
        awardPoints(200, "Certification Earned", `Earned certification for ${process.title}`);
      }
      refetchData(); // To update progress across the app
    }
  };

  const handleHint = () => {
    // Placeholder for future hint logic
    console.log("Hint requested from LearnFlowAssistant");
  };

  const handleAdaptStep = (adaptation) => {
    setProcess(prevProcess => {
      if (!prevProcess || !prevProcess.steps) return prevProcess;

      const updatedSteps = prevProcess.steps.map((step, idx) => {
        if (idx === currentStepIndex) {
          let adaptedStep = { ...step };

          const stepDescription = step.description || '';

          if (adaptation.includes('simplify')) {
            adaptedStep.simplified_description = `Simplified: ${stepDescription.slice(0, 100)}${stepDescription.length > 100 ? '...' : ''}`;
          }

          if (adaptation.includes('Break')) {
            const sentences = stepDescription.split('.');
            adaptedStep.sub_steps = [
              `First: ${sentences[0] || ''}`,
              `Then: ${sentences[1] || 'Complete the remaining actions'}`
            ].filter(Boolean);
          }

          return adaptedStep;
        }
        return step;
      });

      return {
        ...prevProcess,
        steps: updatedSteps
      };
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link to={createPageUrl('ProcessLibrary')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!process) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <ProcessHeader process={process} progress={progress} />

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <StepRenderer
              step={process.steps[currentStepIndex]}
              stepNumber={currentStepIndex + 1}
            />
          </div>

          <aside className="space-y-6">
            <ContextualKnowledge
              contributions={contributions}
              discussions={discussions}
            />
          </aside>
        </div>
      </div>

      {/* NEW: AI Assistant */}
      {process && (
        <LearnFlowAssistant
          currentStep={process.steps[currentStepIndex]}
          process={process}
          userProgress={progress}
          onHint={handleHint}
          onAdaptStep={handleAdaptStep}
          cognitiveProfile={null}
        />
      )}

      {/* ExecutionControls */}
      <ExecutionControls
        currentStep={currentStepIndex}
        totalSteps={process.steps.length}
        onNext={() => updateProgress(currentStepIndex + 1, currentStepIndex + 1 === process.steps.length - 1)}
        onPrevious={() => updateProgress(Math.max(0, currentStepIndex - 1))}
        isCompleted={progress?.status === 'completed'}
      />
    </div>
  );
}
