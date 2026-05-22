
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Process, ARSession, UserProgress } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Eye, 
  AlertTriangle, 
  Play, 
  Crosshair,
  Timer,
  Camera,
  Wifi,
  Battery,
  Shield,
  ArrowLeft,
  AlertCircle,
  BookOpen,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import { useData } from "@/components/providers/DataProvider";
import ARStepGuide from "../components/ar/ARStepGuide";
import SafetyOverlay from "../components/ar/SafetyOverlay";
import QualityCheckpoint from "../components/ar/QualityCheckpoint";
import ARControls from "../components/ar/ARControls";
import LiveSafetyMonitor from "../components/ar/LiveSafetyMonitor";
import ARDataOverlay from "../components/ar/ARDataOverlay";

export default function ARGuidance() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const processId = urlParams.get('id');
  const { processes } = useData();
  
  const [process, setProcess] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [arSession, setArSession] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [arStatus, setArStatus] = useState("initializing");
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(new Set());
  const [deviceStatus, setDeviceStatus] = useState({
    camera: "checking",
    tracking: "checking", 
    lighting: "checking",
    battery: 85,
    connection: "strong"
  });
  const [sessionMetrics, setSessionMetrics] = useState({
    startTime: null,
    stepTimes: {},
    errorCount: 0,
    accuracyScore: 100,
    totalInteractions: 0,
    safetyWarningsShown: 0
  });
  const [error, setError] = useState(null);
  const [availableProcesses, setAvailableProcesses] = useState([]);
  const [isHazardousArea, setIsHazardousArea] = useState(false); // Simulate hazard detection

  useEffect(() => {
    if (processId) {
      loadProcess();
      initializeAREnvironment();
    } else {
      // Show process selection if no ID provided
      setAvailableProcesses(processes.filter(p => 
        p.content_type === 'ar_guided' || p.content_type === 'mixed_reality'
      ));
      setIsLoading(false);
    }
  }, [processId, processes]);

  // Simulate hazard detection changing
  useEffect(() => {
    const interval = setInterval(() => {
      if(sessionActive) {
        setIsHazardousArea(Math.random() > 0.9); // 10% chance of being hazardous
      } else {
        setIsHazardousArea(false); // Reset when session is not active
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  const loadProcess = async () => {
    setIsLoading(true);
    try {
      // First try to find in loaded processes
      let processData = processes.find(p => p.id === processId);
      
      // If not found, try to fetch it
      if (!processData) {
        processData = await Process.get(processId);
      }
      
      if (!processData) {
        throw new Error("Process not found.");
      }

      // Ensure the process supports AR
      if (!['ar_guided', 'mixed_reality'].includes(processData.content_type)) {
        throw new Error("This process doesn't support AR guidance. Please use the regular training mode.");
      }

      setProcess(processData);
      
      const session = await ARSession.create({
        process_id: processId,
        user_id: "current_user", 
        device_type: getDeviceType(),
        session_duration: 0,
        steps_completed: [],
        completion_status: "incomplete",
        device_capabilities: {
          camera_resolution: "1920x1080",
          tracking_accuracy: "high",
          processing_power: "medium"
        }
      });
      setArSession(session);
      
    } catch (error) {
      console.error("Error loading AR process:", error);
      setError(error.message || "Failed to load AR process.");
      setIsLoading(false);
    }
  };

  const initializeAREnvironment = async () => {
    setArStatus("calibrating");
    
    const checks = [
      { name: "camera", delay: 500 },
      { name: "tracking", delay: 1000 },
      { name: "lighting", delay: 1500 }
    ];
    
    for (const check of checks) {
      await new Promise(resolve => setTimeout(resolve, check.delay));
      setDeviceStatus(prev => ({
        ...prev,
        [check.name]: Math.random() > 0.1 ? "ready" : "warning"
      }));
    }
    
    setTimeout(() => {
      setArStatus("ready");
      setIsLoading(false);
    }, 2000);
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return "iOS";
    if (/Android/.test(userAgent)) return "Android";
    return "Desktop";
  };

  const startARSession = () => {
    setSessionActive(true);
    setArStatus("tracking");
    setSessionMetrics(prev => ({
      ...prev,
      startTime: new Date(),
      stepTimes: { [currentStep]: new Date() }
    }));
  };

  const completeStep = async (stepIndex) => {
    const newCompletedSteps = new Set([...completedSteps, stepIndex]);
    setCompletedSteps(newCompletedSteps);

    const stepStartTime = sessionMetrics.stepTimes[stepIndex];
    const stepDuration = stepStartTime ? (new Date() - stepStartTime) / 1000 : 0;

    setSessionMetrics(prev => ({
      ...prev,
      stepTimes: {
        ...prev.stepTimes,
        [stepIndex]: stepDuration,
        [stepIndex + 1]: new Date()
      },
      totalInteractions: prev.totalInteractions + 1
    }));

    if (arSession) {
      const updatedSteps = [...(arSession.steps_completed || []), { 
        step_id: process.steps[stepIndex].step_id, 
        time_taken: stepDuration,
        accuracy_score: 95 + Math.random() * 5,
        interactions_count: Math.floor(Math.random() * 5) + 1
      }];
      await ARSession.update(arSession.id, { 
        steps_completed: updatedSteps,
        interaction_points: [...(arSession.interaction_points || []), {
          step_index: stepIndex,
          timestamp: new Date().toISOString(),
          interaction_type: "step_completion",
          accuracy: 95 + Math.random() * 5
        }]
      });
    }

    if (stepIndex < process.steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(stepIndex + 1);
        setSafetyAcknowledged(prev => new Set([...prev].filter(idx => idx !== stepIndex + 1)));
      }, 500);
    } else {
      await completeARSession();
    }
  };

  const completeARSession = async () => {
    if (arSession) {
      const totalDuration = sessionMetrics.startTime ? (new Date() - sessionMetrics.startTime) / 1000 / 60 : 0;
      await ARSession.update(arSession.id, {
        completion_status: "completed",
        session_duration: totalDuration,
        accuracy_metrics: {
          overall_accuracy: sessionMetrics.accuracyScore,
          step_accuracy: Object.values(sessionMetrics.stepTimes).map(time => ({
            duration: time,
            accuracy: 90 + Math.random() * 10
          }))
        },
        errors_detected: Array.from({length: sessionMetrics.errorCount}, (_, i) => ({
          step_index: Math.floor(Math.random() * process.steps.length),
          error_type: "positioning_error",
          correction_time: Math.random() * 10
        }))
      });

      await UserProgress.create({
        process_id: processId,
        status: "completed",
        completion_percentage: 100,
        ar_interaction_data: {
          total_time: totalDuration,
          step_times: sessionMetrics.stepTimes,
          accuracy_score: sessionMetrics.accuracyScore,
          error_count: sessionMetrics.errorCount,
          total_interactions: sessionMetrics.totalInteractions,
          device_performance: deviceStatus
        }
      });
    }
    setSessionActive(false);
  };

  const acknowledgeSafety = (stepIndex) => {
    setSafetyAcknowledged(prev => new Set([...prev, stepIndex]));
    setSessionMetrics(prev => ({
      ...prev,
      safetyWarningsShown: prev.safetyWarningsShown + 1
    }));
  };

  const handleStepNavigation = (direction) => {
    if (direction === 'next' && currentStep < process.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'previous' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ready: "text-green-500",
      warning: "text-yellow-500",
      error: "text-red-500",
      checking: "text-blue-500"
    };
    return colors[status] || "text-gray-500";
  };

  const getStatusIcon = (type, status) => {
    if (status === "checking") return <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>;
    
    const icons = {
      camera: Camera,
      tracking: Crosshair,
      lighting: Eye
    };
    const IconComponent = icons[type];
    return IconComponent ? <IconComponent className="w-3 h-3" /> : null;
  };

  // Process Selection Screen (when no process ID provided)
  if (!processId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
                AR Guidance
              </h1>
            </div>
            <p className="text-slate-600 text-lg">
              Select a process to begin immersive AR training
            </p>
          </motion.div>

          {availableProcesses.length === 0 ? (
            <Card className="text-center p-12">
              <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No AR Processes Available</h3>
              <p className="text-slate-500 mb-6">
                There are currently no processes configured for AR guidance.
              </p>
              <Button asChild variant="outline">
                <Link to={createPageUrl('ProcessLibrary')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse All Processes
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableProcesses.map((proc, index) => (
                <motion.div
                  key={proc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {proc.title}
                          </h3>
                          <Badge className="text-xs bg-blue-100 text-blue-800">
                            AR Ready
                          </Badge>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                        {proc.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                        <span>{proc.estimated_duration || 30} min</span>
                        <span>{proc.steps?.length || 0} steps</span>
                      </div>
                      <Button asChild className="w-full">
                        <Link to={createPageUrl(`ARGuidance?id=${proc.id}`)}>
                          <Play className="w-4 h-4 mr-2" />
                          Start AR Training
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AR Session Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4 flex gap-2">
              <Button asChild variant="outline">
                <Link to={createPageUrl('ProcessLibrary')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
                </Link>
              </Button>
              <Button asChild>
                <Link to={createPageUrl('ARGuidance')}>
                  <Eye className="mr-2 h-4 w-4" /> Choose AR Process
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center max-w-md mx-auto">
          <motion.div 
            className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h3 className="text-2xl font-bold mb-4">Initializing LearnFlow AR Environment</h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {getStatusIcon("camera", deviceStatus.camera)}
                Camera Access
              </span>
              <span className={`capitalize ${getStatusColor(deviceStatus.camera)}`}>
                {deviceStatus.camera}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {getStatusIcon("tracking", deviceStatus.tracking)}
                Spatial Tracking
              </span>
              <span className={`capitalize ${getStatusColor(deviceStatus.tracking)}`}>
                {deviceStatus.tracking}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {getStatusIcon("lighting", deviceStatus.lighting)}
                Environment Lighting
              </span>
              <span className={`capitalize ${getStatusColor(deviceStatus.lighting)}`}>
                {deviceStatus.lighting}
              </span>
            </div>
          </div>
          <p className="text-sm opacity-70">Calibrating spatial tracking and optimizing for your device...</p>
        </div>
      </div>
    );
  }

  // Process not found
  if (!process) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Process Not Found</h3>
          <p className="text-gray-400 mb-4">The requested AR guidance process could not be loaded.</p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link to={createPageUrl('ProcessLibrary')}>
               Go Back
              </Link>
            </Button>
            <Button asChild>
              <Link to={createPageUrl('ARGuidance')}>
                <Eye className="mr-2 h-4 w-4" />
                Select AR Process
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main AR Interface (rest of the existing code...)
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Enhanced AR Camera Feed Simulation */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-cover bg-center" 
           style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3)' }}>
        <div className="absolute inset-0 bg-black/50" />
        
        {/* AR Grid Overlay for Depth Perception */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div className="absolute top-4 right-4 z-50 space-y-2">
        <Badge className={`${arStatus === "tracking" ? "bg-green-500" : arStatus === "ready" ? "bg-blue-500" : "bg-yellow-500"} text-white shadow-lg`}>
          <Crosshair className="w-3 h-3 mr-1" />
          {arStatus.toUpperCase()}
        </Badge>
        
        {/* Device Status Indicators */}
        <div className="flex gap-2">
          <Badge className="bg-black/70 text-white border border-white/20">
            <Wifi className="w-3 h-3 mr-1" />
            {deviceStatus.connection}
          </Badge>
          <Badge className="bg-black/70 text-white border border-white/20">
            <Battery className="w-3 h-3 mr-1" />
            {deviceStatus.battery}%
          </Badge>
        </div>
      </div>

      {/* Enhanced Process Header with Safety Indicators */}
      <div className="absolute top-4 left-4 right-20 z-40">
        <Card className="bg-black/80 backdrop-blur-md border-blue-500/30 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-white text-lg flex items-center gap-2">
                  {process.hazard_level !== 'low' && (
                    <Shield className="w-5 h-5 text-yellow-500" />
                  )}
                  {process.title}
                </h2>
                <p className="text-blue-300 text-sm">Step {currentStep + 1} of {process.steps.length}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  <span>{sessionMetrics.startTime ? Math.floor((new Date() - sessionMetrics.startTime) / 1000) : 0}s</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{sessionMetrics.totalInteractions} interactions</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Progress</span>
                <span>{Math.round((completedSteps.size / process.steps.length) * 100)}%</span>
              </div>
              <Progress 
                value={(completedSteps.size / process.steps.length) * 100} 
                className="w-full h-2 bg-slate-700"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>{completedSteps.size} of {process.steps.length} completed</span>
                <span>Accuracy: {sessionMetrics.accuracyScore}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {!sessionActive ? (
          <motion.div
            key="start-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center h-full"
          >
            <Card className="bg-black/90 backdrop-blur-md border-blue-500/30 max-w-lg text-center shadow-2xl">
              <CardContent className="p-8">
                <Eye className="w-20 h-20 text-blue-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">LearnFlow AR Environment Ready</h3>
                <p className="text-slate-300 mb-6">
                  Point your device at the work area to begin immersive, step-by-step guidance with real-time safety monitoring.
                </p>
                
                {/* Pre-session Safety Brief */}
                {process.hazard_level !== 'low' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold text-yellow-400">Safety Notice</span>
                    </div>
                    <p className="text-sm text-yellow-200">
                      This process involves {process.hazard_level} risk activities. Follow all safety warnings carefully.
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={startARSession}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Begin LearnFlow AR Training
                </Button>
                
                <div className="mt-4 flex justify-center gap-4 text-xs text-slate-400">
                  <span>✓ Real-time guidance</span>
                  <span>✓ Safety monitoring</span>
                  <span>✓ Quality checkpoints</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="ar-session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            {process.steps[currentStep]?.safety_warnings?.length > 0 && !safetyAcknowledged.has(currentStep) && (
              <SafetyOverlay
                warnings={process.steps[currentStep].safety_warnings}
                onAcknowledge={() => acknowledgeSafety(currentStep)}
                hazardLevel={process.hazard_level}
              />
            )}
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <ARStepGuide
                step={process.steps[currentStep]}
                stepNumber={currentStep + 1}
                isCompleted={completedSteps.has(currentStep)}
                onComplete={() => completeStep(currentStep)}
                safetyAcknowledged={safetyAcknowledged.has(currentStep)}
                sessionMetrics={sessionMetrics}
              />
            </div>
            
            {process.steps[currentStep]?.instruction_type === "quality_check" && (
              <QualityCheckpoint
                criteria={process.steps[currentStep].quality_criteria}
                onPass={() => completeStep(currentStep)}
                onFail={() => setSessionMetrics(prev => ({
                  ...prev,
                  errorCount: prev.errorCount + 1,
                  accuracyScore: Math.max(70, prev.accuracyScore - 5)
                }))}
              />
            )}

            {/* NEW: Live Safety Monitor and Data Overlay */}
            <LiveSafetyMonitor isHazardousArea={isHazardousArea} step={process.steps[currentStep]} />
            <ARDataOverlay equipmentId={process.equipment_needed?.[0]} />
          </motion.div>
        )}
      </AnimatePresence>

      {sessionActive && (
        <ARControls
          currentStep={currentStep}
          totalSteps={process.steps.length}
          onPrevious={() => handleStepNavigation('previous')}
          onNext={() => handleStepNavigation('next')}
          onPause={() => setSessionActive(false)}
          onExit={() => window.history.back()}
          completedSteps={completedSteps}
          sessionMetrics={sessionMetrics}
          deviceStatus={deviceStatus}
        />
      )}
    </div>
  );
}
