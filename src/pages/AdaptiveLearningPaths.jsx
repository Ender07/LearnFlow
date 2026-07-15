import React, { useState, useEffect } from "react";
import { useData } from "@/components/providers/DataProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BrainCircuit, 
  Plus, 
  TrendingUp, 
  Clock,
  Zap,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicLearningPath } from "@/entities/all";
import { useToast } from "@/components/common/Toast";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import DynamicPathTimeline from "@/components/learning-paths/DynamicPathTimeline";

export default function AdaptiveLearningPaths() {
  const { 
    processes, 
    userProgress, 
    currentUser,
    learningAnalytics,
    isLoading 
  } = useData();
  
  const [dynamicPaths, setDynamicPaths] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPathObjective, setNewPathObjective] = useState("");
  const [newPathDescription, setNewPathDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [skillDecayAlerts, setSkillDecayAlerts] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (currentUser) {
      loadDynamicPaths();
      checkSkillDecayAlerts();
    }
  }, [currentUser]);

  const loadDynamicPaths = async () => {
    try {
      const paths = await DynamicLearningPath.filter({ user_id: currentUser.id });
      setDynamicPaths(paths);
    } catch (error) {
      console.error("Error loading dynamic paths:", error);
    }
  };

  const checkSkillDecayAlerts = () => {
    if (learningAnalytics && learningAnalytics.skill_decay_predictions) {
      const urgentDecay = learningAnalytics.skill_decay_predictions.filter(prediction => {
        const decayDate = new Date(prediction.predicted_decay_date);
        const now = new Date();
        const daysUntilDecay = Math.ceil((decayDate - now) / (1000 * 60 * 60 * 24));
        return daysUntilDecay <= 14; // Alert if decay predicted within 2 weeks
      });
      setSkillDecayAlerts(urgentDecay);
    }
  };

  const generateAdaptivePath = async () => {
    if (!newPathObjective.trim()) {
      showToast({ type: 'error', title: 'Missing Objective', message: 'Please enter a learning objective.' });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI-powered path generation
      const relevantProcesses = processes
        .filter(p => 
          p.title.toLowerCase().includes(newPathObjective.toLowerCase()) ||
          p.description.toLowerCase().includes(newPathObjective.toLowerCase()) ||
          p.category.toLowerCase().includes(newPathObjective.toLowerCase())
        )
        .slice(0, 5);

      if (relevantProcesses.length === 0) {
        showToast({ 
          type: 'warning', 
          title: 'No Matching Processes', 
          message: 'Try a different objective or create processes first.' 
        });
        return;
      }

      // Generate AI-reasoned sequence
      const generatedSequence = relevantProcesses.map((process, index) => ({
        process_id: process.id,
        sequence_order: index + 1,
        ai_reasoning: `Step ${index + 1}: ${process.title} is essential for ${newPathObjective} because it covers fundamental ${process.category} skills.`,
        status: index === 0 ? 'active' : 'pending'
      }));

      const newPath = await DynamicLearningPath.create({
        user_id: currentUser.id,
        current_objective: newPathObjective,
        generated_sequence: generatedSequence,
        last_adaptation_date: new Date().toISOString(),
        adaptation_history: [{
          adaptation_date: new Date().toISOString(),
          reason: "Initial path generation",
          changes: `Created adaptive learning path for: ${newPathObjective}`
        }]
      });

      setDynamicPaths([newPath, ...dynamicPaths]);
      setShowCreateDialog(false);
      setNewPathObjective("");
      setNewPathDescription("");
      
      showToast({ 
        type: 'success', 
        title: 'Path Generated!', 
        message: 'Your AI-powered learning path is ready.' 
      });

    } catch (error) {
      showToast({ type: 'error', title: 'Generation Failed', message: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const adaptPath = async (pathId) => {
    try {
      const path = dynamicPaths.find(p => p.id === pathId);
      if (!path) return;

      // Simulate AI adaptation based on progress
      const userPathProgress = userProgress.filter(up => 
        path.generated_sequence.some(seq => seq.process_id === up.process_id)
      );

      let adaptationReason = "Regular optimization";
      let newSequence = [...path.generated_sequence];

      // Check if user is struggling with current step
      const currentStep = newSequence.find(s => s.status === 'active');
      if (currentStep) {
        const currentProgress = userPathProgress.find(up => up.process_id === currentStep.process_id);
        if (currentProgress && (currentProgress.quiz_score || 0) < 70) {
          // Insert a prerequisite process
          const prerequisite = processes.find(p => 
            p.category === processes.find(pr => pr.id === currentStep.process_id)?.category &&
            p.difficulty_level === 'beginner' &&
            !newSequence.some(seq => seq.process_id === p.id)
          );
          
          if (prerequisite) {
            newSequence.splice(newSequence.findIndex(s => s.process_id === currentStep.process_id), 0, {
              process_id: prerequisite.id,
              sequence_order: currentStep.sequence_order,
              ai_reasoning: "Added prerequisite process to strengthen foundational knowledge",
              status: 'active'
            });
            adaptationReason = "Added prerequisite due to performance indicators";
            currentStep.status = 'pending';
            currentStep.sequence_order = currentStep.sequence_order + 1;
          }
        }
      }

      const updatedPath = await DynamicLearningPath.update(pathId, {
        generated_sequence: newSequence,
        last_adaptation_date: new Date().toISOString(),
        adaptation_history: [
          ...path.adaptation_history,
          {
            adaptation_date: new Date().toISOString(),
            reason: adaptationReason,
            changes: "Modified sequence based on performance analysis"
          }
        ]
      });

      setDynamicPaths(dynamicPaths.map(p => p.id === pathId ? updatedPath : p));
      showToast({ type: 'success', title: 'Path Adapted', message: 'Your learning path has been optimized.' });

    } catch (error) {
      showToast({ type: 'error', title: 'Adaptation Failed', message: error.message });
    }
  };

  const calculatePathProgress = (path) => {
    const completedSteps = path.generated_sequence.filter(seq => seq.status === 'completed').length;
    return (completedSteps / path.generated_sequence.length) * 100;
  };

  const getNextProcess = (path) => {
    return path.generated_sequence.find(seq => seq.status === 'active' || seq.status === 'pending');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-200 rounded w-1/3"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent">
              Adaptive Learning Paths
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            AI-powered learning journeys that adapt to your progress, learning style, and goals.
          </p>
        </motion.div>

        {/* Skill Decay Alerts */}
        <AnimatePresence>
          {skillDecayAlerts.map(alert => (
            <motion.div
              key={alert.skill_area}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Skill Decay Alert</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Your proficiency in <strong>{alert.skill_area.replace(/_/g, ' ')}</strong> may decline by{' '}
                  <strong>{new Date(alert.predicted_decay_date).toLocaleDateString()}</strong>.
                  <div className="mt-2">
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Schedule Refresher
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              {dynamicPaths.length} Active Paths
            </Badge>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Generate New Path
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-600" />
                  AI Learning Path Generator
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    What do you want to learn or achieve?
                  </label>
                  <Input
                    placeholder="e.g., CNC Machine Operation, Quality Control, Safety Protocols"
                    value={newPathObjective}
                    onChange={(e) => setNewPathObjective(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Additional Context (Optional)
                  </label>
                  <Textarea
                    placeholder="Any specific requirements, deadlines, or focus areas..."
                    value={newPathDescription}
                    onChange={(e) => setNewPathDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={generateAdaptivePath}
                    disabled={isGenerating}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Path
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dynamic Paths Grid */}
        <div className="grid gap-6">
          <AnimatePresence>
            {dynamicPaths.map((path, index) => (
              <DynamicPathCard 
                key={path.id}
                path={path}
                processes={processes}
                userProgress={userProgress}
                onAdapt={() => adaptPath(path.id)}
                calculateProgress={calculatePathProgress}
                getNextProcess={getNextProcess}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {dynamicPaths.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Prompt to generate */}
            <div className="text-center py-10 bg-white/60 rounded-2xl border border-slate-200">
              <BrainCircuit className="w-14 h-14 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Adaptive Path Yet</h3>
              <p className="text-slate-500 mb-5 max-w-md mx-auto text-sm">
                Generate an AI-powered path or browse all available processes below.
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Your First Path
              </Button>
            </div>

            {/* Fallback: process list */}
            {processes.length > 0 && (
              <div>
                <h3 className="text-slate-700 font-semibold mb-3">All Available Processes</h3>
                <div className="grid gap-3">
                  {processes.slice(0, 10).map(p => {
                    const prog = userProgress.find(up => up.process_id === p.id);
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-slate-200">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          prog?.status === 'completed' ? 'bg-green-500' :
                          prog ? 'bg-blue-500' : 'bg-slate-300'
                        }`} />
                        <span className="flex-1 text-slate-700 text-sm font-medium">{p.title}</span>
                        {prog?.completion_percentage != null && (
                          <span className="text-slate-400 text-xs">{prog.completion_percentage}%</span>
                        )}
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/ProcessExecution?id=${p.id}`}>
                            <ArrowRight className="w-3 h-3 mr-1" />
                            {prog ? 'Continue' : 'Start'}
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DynamicPathCard({ path, processes, userProgress, onAdapt, calculateProgress, getNextProcess, index }) {
  const progress = calculateProgress(path);
  const nextProcess = getNextProcess(path);
  const nextProcessData = processes.find(p => p.id === nextProcess?.process_id);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl text-slate-800 mb-2">
                {path.current_objective}
              </CardTitle>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800">
                  <BrainCircuit className="w-3 h-3 mr-1" />
                  AI-Adaptive
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {path.generated_sequence.length} Steps
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Last adapted {new Date(path.last_adaptation_date).toLocaleDateString()}
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAdapt}
              className="hover:bg-purple-50"
            >
              <Zap className="w-3 h-3 mr-1" />
              Adapt
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Next Step */}
          {nextProcess && nextProcessData && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800">Next Step</h4>
                  <p className="text-sm text-slate-600">{nextProcessData.title}</p>
                  <p className="text-xs text-purple-600 mt-1">{nextProcess.ai_reasoning}</p>
                </div>
                <Button size="sm" asChild>
                  <Link to={createPageUrl(`ProcessExecution?id=${nextProcess.process_id}`)}>
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Start
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Path Timeline */}
          <div>
            <h5 className="font-medium text-slate-700 text-sm mb-3">Learning Sequence</h5>
            <DynamicPathTimeline path={path} processes={processes} userProgress={userProgress} />
          </div>

          {/* Recent Adaptations */}
          {path.adaptation_history && path.adaptation_history.length > 1 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3 h-3 text-purple-500" />
                <span className="text-xs font-medium text-slate-700">Recent Adaptations</span>
              </div>
              <div className="text-xs text-slate-500">
                {path.adaptation_history.slice(-2).map((adaptation, idx) => (
                  <div key={idx}>• {adaptation.reason}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}