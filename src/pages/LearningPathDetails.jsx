import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LearningPath, Process, Certification } from '@/entities/all';
import { createPageUrl } from '@/utils';
import { useData } from '@/components/providers/DataProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Route, Award, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import LearningPathStepper from '../components/learning-paths/LearningPathStepper';

export default function LearningPathDetails() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const pathId = urlParams.get('id');

  const { userProgress: allUserProgress } = useData();

  const [path, setPath] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [certification, setCertification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pathProgress, setPathProgress] = useState({
    progressPercentage: 0,
    completedCount: 0,
    isCompleted: false,
    nextProcess: null,
  });

  useEffect(() => {
    if (!pathId) {
      setError("No Learning Path ID provided.");
      setIsLoading(false);
      return;
    }
    loadPathDetails();
  }, [pathId, allUserProgress]);

  const loadPathDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pathData = await LearningPath.get(pathId);
      if (!pathData) throw new Error("Learning Path not found.");
      setPath(pathData);

      if (pathData.process_sequence && pathData.process_sequence.length > 0) {
        const processData = await Promise.all(
          pathData.process_sequence.map(id => Process.get(id).catch(() => null))
        );
        const validProcesses = processData.filter(Boolean);
        setProcesses(validProcesses);

        // Calculate progress
        const completedCount = validProcesses.filter(p => 
          allUserProgress.some(up => up.process_id === p.id && up.status === 'completed')
        ).length;
        const progressPercentage = validProcesses.length > 0 ? (completedCount / validProcesses.length) * 100 : 0;
        const isCompleted = completedCount === validProcesses.length;
        const nextProcess = validProcesses.find(p => 
          !allUserProgress.some(up => up.process_id === p.id && up.status === 'completed')
        );

        setPathProgress({
          completedCount,
          progressPercentage,
          isCompleted,
          nextProcess,
        });
      }

      if (pathData.grants_certification_id) {
        const certData = await Certification.get(pathData.grants_certification_id);
        setCertification(certData);
      }
    } catch (e) {
      console.error("Failed to load learning path details:", e);
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonState = () => {
    if (pathProgress.isCompleted) {
      return {
        text: 'Review Certificate',
        icon: Award,
        link: createPageUrl(`Certifications`),
        className: 'bg-green-600 hover:bg-green-700'
      };
    }
    if (pathProgress.nextProcess) {
      return {
        text: 'Continue with: ' + pathProgress.nextProcess.title,
        icon: Route,
        link: createPageUrl(`ProcessExecution?id=${pathProgress.nextProcess.id}`),
        className: 'bg-orange-500 hover:bg-orange-600'
      };
    }
    return {
      text: 'Start Path',
      icon: Route,
      link: createPageUrl(`ProcessExecution?id=${processes[0]?.id}`),
      className: 'bg-blue-600 hover:bg-blue-700'
    };
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
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
                <Link to={createPageUrl('LearningPaths')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning Paths
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!path) return null;

  const { text, icon: Icon, link, className } = getButtonState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl('LearningPaths')} className="inline-flex items-center text-sm text-slate-600 hover:text-indigo-600 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all Learning Paths
        </Link>

        {/* Header Card */}
        <Card className="mb-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-slate-800 mb-2">{path.title}</CardTitle>
                <p className="text-slate-600 max-w-prose">{path.description}</p>
              </div>
              {certification && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 py-2 px-4">
                  <Award className="w-4 h-4 mr-2" />
                  Grants Certification
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-6 text-slate-500">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {processes.length} Processes</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {path.estimated_total_duration} min</span>
                <span className="flex items-center gap-1"><Badge variant="outline" className="capitalize">{path.target_role?.replace('_', ' ')}</Badge></span>
              </div>
              <Button asChild size="lg" className={className}>
                <Link to={link}><Icon className="w-5 h-5 mr-2" />{text}</Link>
              </Button>
            </div>
            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(pathProgress.progressPercentage)}%</span>
              </div>
              <Progress value={pathProgress.progressPercentage} />
              <div className="text-xs text-slate-500 mt-1">
                {pathProgress.completedCount} of {processes.length} processes completed
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stepper */}
        <LearningPathStepper processes={processes} userProgress={allUserProgress} />
      </div>
    </div>
  );
}