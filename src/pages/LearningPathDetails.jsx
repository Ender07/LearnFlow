import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const navigate = useNavigate();
  const { userProgress: allUserProgress } = useData();
  const [allPaths, setAllPaths] = useState([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(false);

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
      setIsLoading(false);
      setIsLoadingPaths(true);
      LearningPath.list().then(data => {
        setAllPaths(data || []);
        setIsLoadingPaths(false);
      });
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
        try {
          const certData = await Certification.get(pathData.grants_certification_id);
          setCertification(certData);
        } catch {
          // certification ID may be a placeholder — ignore
        }
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

  // No path selected — show picker
  if (!pathId) {
    return (
      <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-1">Learning Path Details</h1>
          <p className="text-slate-400 mb-6 text-sm">Select a learning path to view its details.</p>
          {isLoadingPaths ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full bg-slate-700" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPaths.map(p => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/LearningPathDetails?id=${p.id}`)}
                  className="text-left p-5 bg-[#1a2540] rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-all group"
                >
                  <div className="font-semibold text-white group-hover:text-purple-400 mb-1">{p.title}</div>
                  <div className="text-sm text-slate-400 line-clamp-2">{p.description}</div>
                  <div className="mt-3 text-xs text-slate-500 capitalize">{p.target_role?.replace('_', ' ')} · {p.estimated_total_duration} min</div>
                </button>
              ))}
            </div>
          )}
        </div>
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
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl('LearningPaths')} className="inline-flex items-center text-sm text-slate-400 hover:text-purple-400 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all Learning Paths
        </Link>

        {/* Header Card */}
        <Card className="mb-6 bg-[#1a2540] border border-slate-700/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl font-bold text-white mb-2">{path.title}</CardTitle>
                <p className="text-slate-400 max-w-prose text-sm">{path.description}</p>
              </div>
              {certification && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 py-2 px-3 ml-4 flex-shrink-0">
                  <Award className="w-4 h-4 mr-2" />
                  Grants Certification
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex gap-4 text-slate-400 text-sm">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {processes.length} Processes</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {path.estimated_total_duration || '?'} min</span>
                <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 capitalize">{path.target_role?.replace('_', ' ')}</Badge>
              </div>
              <Button asChild size="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to={link}>
                  <Route className="w-4 h-4 mr-2" />{text}
                </Link>
              </Button>
            </div>
            <div>
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(pathProgress.progressPercentage)}%</span>
              </div>
              <Progress value={pathProgress.progressPercentage} className="h-2 bg-slate-700" />
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