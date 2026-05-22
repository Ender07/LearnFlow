
import React, { useState, useEffect } from "react";
import { Process, UserProgress, CollaborativeSession } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Headphones,
  BrainCircuit,
  Shield,
  Zap,
  Users,
  Target,
  Eye
} from "lucide-react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/common/Toast";

import VREnvironment from "../components/vr/VREnvironment";
import ScenarioSelector from "../components/vr/ScenarioSelector";
import PerformanceMetrics from "../components/vr/PerformanceMetrics";
import CollaborativeToolbar from '../components/vr/CollaborativeToolbar';

export default function VRSimulation() {
  const [vrScenarios, setVrScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState([]);
  const [vrCapabilities, setVrCapabilities] = useState({
    headsetConnected: false,
    trackingReady: false,
    controllersActive: false,
    systemPerformance: "checking"
  });
  const [sessionPreferences, setSessionPreferences] = useState({
    difficulty: "adaptive",
    safetyMode: "full",
    hapticFeedback: true,
    collaborativeMode: false,
    recordSession: true
  });
  const [error, setError] = useState(null);
  const [sessionMode, setSessionMode] = useState('solo'); // solo or collaborative
  const [collaborativeSession, setCollaborativeSession] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadVRData();
    checkVRCapabilities();
  }, []);

  const loadVRData = async () => {
    setIsLoading(true);
    try {
      const [processes, progress] = await Promise.all([
        Process.filter({ content_type: "vr_simulation" }),
        UserProgress.list()
      ]);
      setVrScenarios(processes || []);
      setUserProgress(progress || []);
    } catch (error) {
      console.error("Error loading VR data:", error);
      setError("Failed to load VR scenarios. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkVRCapabilities = async () => {
    // Simulate VR capability detection
    const checks = [
      { name: "headsetConnected", delay: 500 },
      { name: "trackingReady", delay: 1000 },
      { name: "controllersActive", delay: 1500 },
      { name: "systemPerformance", delay: 2000 }
    ];

    for (const check of checks) {
      await new Promise(resolve => setTimeout(resolve, check.delay));

      if (check.name === "systemPerformance") {
        const performance = Math.random() > 0.2 ? "optimal" : Math.random() > 0.5 ? "good" : "limited";
        setVrCapabilities(prev => ({ ...prev, [check.name]: performance }));
      } else {
        setVrCapabilities(prev => ({ ...prev, [check.name]: Math.random() > 0.15 }));
      }
    }
  };

  const handleSelectScenario = (scenario) => {
    setSelectedScenario(scenario);
    if (sessionMode === 'collaborative') {
      startCollaborativeSession(scenario);
    }
    setSessionActive(true);
  };

  const startCollaborativeSession = async (scenario) => {
    try {
      const newSession = await CollaborativeSession.create({
        session_name: `${scenario.title} - Collaborative`,
        process_id: scenario.id,
        host_id: "current_user_id", // Replace with actual user ID
        participants: [{ user_id: "current_user_id", role: "mentor" }]
      });
      setCollaborativeSession(newSession);
      showToast({ type: 'success', title: 'Collaborative session started!' });
    } catch (e) {
      showToast({ type: 'error', title: 'Failed to start session', message: e.message });
    }
  };

  const handleEndSession = async (metrics) => {
    try {
      // Enhanced VR session results with comprehensive data
      const enhancedMetrics = {
        ...metrics,
        session_id: `vr_${Date.now()}`,
        user_id: "current_user",
        scenario_details: {
          scenario_id: selectedScenario.id,
          scenario_name: selectedScenario.title,
          difficulty_level: selectedScenario.difficulty_level,
          environment_type: selectedScenario.vr_environment_type || "factory_floor"
        },
        performance_data: {
          completion_time: metrics.time_taken_seconds,
          accuracy_score: metrics.score,
          error_count: metrics.errors,
          hazards_identified: metrics.hazards_identified,
          total_hazards: metrics.total_hazards,
          safety_compliance_score: Math.round((metrics.hazards_identified / metrics.total_hazards) * 100)
        },
        interaction_analytics: {
          hand_tracking_accuracy: 85 + Math.random() * 15,
          head_movement_patterns: Math.floor(Math.random() * 100) + 50,
          controller_precision: 80 + Math.random() * 20,
          spatial_awareness_score: 70 + Math.random() * 30
        },
        learning_insights: {
          concept_mastery: Math.floor(Math.random() * 40) + 60,
          skill_retention_prediction: Math.floor(Math.random() * 30) + 70,
          recommended_practice_areas: generatePracticeRecommendations(metrics),
          next_difficulty_recommendation: getNextDifficultyLevel(metrics.score)
        },
        physiological_data: {
          stress_level: Math.random() * 0.5 + 0.2, // 0.2-0.7 scale
          engagement_score: Math.floor(Math.random() * 30) + 70,
          fatigue_indicator: Math.random() * 0.4,
          optimal_session_length: Math.floor(Math.random() * 10) + 15 // 15-25 minutes
        },
        system_performance: {
          frame_rate_avg: 85 + Math.random() * 15,
          tracking_stability: 90 + Math.random() * 10,
          rendering_quality: vrCapabilities.systemPerformance === "optimal" ? "high" : "medium",
          motion_sickness_risk: Math.random() * 0.3
        }
      };

      await UserProgress.create({
        process_id: metrics.scenario_id,
        status: 'completed',
        completion_percentage: 100,
        vr_simulation_results: enhancedMetrics,
        completed_date: new Date().toISOString(),
        practical_score: metrics.score,
        time_spent: Math.ceil(metrics.time_taken_seconds / 60), // Convert to minutes
        notes: `VR Training completed with ${metrics.score}% accuracy. Identified ${metrics.hazards_identified}/${metrics.total_hazards} safety hazards.`
      });

      // Show comprehensive results before returning to hub
      setTimeout(() => {
        setSessionActive(false);
        setSelectedScenario(null);
        setCollaborativeSession(null); // Clear collaborative session state
        loadVRData(); // Reload data to reflect new progress
      }, 3000);

    } catch (error) {
      console.error("Error saving VR session results:", error);
      setSessionActive(false);
      setSelectedScenario(null);
      setCollaborativeSession(null); // Clear collaborative session state
    }
  };

  const generatePracticeRecommendations = (metrics) => {
    const recommendations = [];

    if (metrics.score < 80) {
      recommendations.push("Fundamental procedures review needed");
    }
    if (metrics.hazards_identified / metrics.total_hazards < 0.8) {
      recommendations.push("Safety awareness training recommended");
    }
    if (metrics.errors > 3) {
      recommendations.push("Process sequence practice required");
    }
    if (metrics.time_taken_seconds > 600) { // 10 minutes
      recommendations.push("Efficiency improvement focus needed");
    }

    return recommendations.length > 0 ? recommendations : ["Excellent performance - ready for advanced scenarios"];
  };

  const getNextDifficultyLevel = (score) => {
    if (score >= 90) return "advanced";
    if (score >= 75) return "intermediate";
    return "beginner";
  };

  const getCapabilityStatus = (capability, value) => {
    if (capability === "systemPerformance") {
      const colors = {
        optimal: "text-green-400",
        good: "text-yellow-400",
        limited: "text-red-400",
        checking: "text-blue-400"
      };
      return colors[value] || "text-gray-400";
    }
    return value ? "text-green-400" : "text-red-400";
  };

  const getCapabilityIcon = (capability, value) => {
    if (capability === "systemPerformance" && value === "checking") {
      return <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>;
    }

    const icons = {
      headsetConnected: Headphones,
      trackingReady: Target,
      controllersActive: Zap,
      systemPerformance: BrainCircuit
    };

    const IconComponent = icons[capability];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  if (error) {
     return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>VR Simulation Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link to={createPageUrl('Dashboard')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const VRSystemStatus = () => (
    <Card className="bg-slate-800/90 backdrop-blur-md border-purple-500/30 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-400" />
          LearnFlow VR System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-2">
              {getCapabilityIcon("headsetConnected", vrCapabilities.headsetConnected)}
              VR Headset
            </span>
            <span className={`text-sm font-semibold ${getCapabilityStatus("headsetConnected", vrCapabilities.headsetConnected)}`}>
              {vrCapabilities.headsetConnected ? "Connected" : "Not Found"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-2">
              {getCapabilityIcon("trackingReady", vrCapabilities.trackingReady)}
              Spatial Tracking
            </span>
            <span className={`text-sm font-semibold ${getCapabilityStatus("trackingReady", vrCapabilities.trackingReady)}`}>
              {vrCapabilities.trackingReady ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-2">
              {getCapabilityIcon("controllersActive", vrCapabilities.controllersActive)}
              Controllers
            </span>
            <span className={`text-sm font-semibold ${getCapabilityStatus("controllersActive", vrCapabilities.controllersActive)}`}>
              {vrCapabilities.controllersActive ? "Ready" : "Offline"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-2">
              {getCapabilityIcon("systemPerformance", vrCapabilities.systemPerformance)}
              Performance
            </span>
            <span className={`text-sm font-semibold capitalize ${getCapabilityStatus("systemPerformance", vrCapabilities.systemPerformance)}`}>
              {vrCapabilities.systemPerformance}
            </span>
          </div>
        </div>

        {(!vrCapabilities.headsetConnected || vrCapabilities.systemPerformance === "limited") && (
          <Alert className="bg-yellow-500/10 border-yellow-500/30 mt-4">
            <AlertDescription className="text-yellow-200">
              {!vrCapabilities.headsetConnected
                ? "VR headset not detected. You can still run desktop simulation mode."
                : "System performance is limited. Consider closing other applications for optimal VR experience."
              }
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const SessionPreferences = () => (
    <Card className="bg-slate-800/90 backdrop-blur-md border-indigo-500/30 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          Session Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty Mode</label>
            <select
              value={sessionPreferences.difficulty}
              onChange={(e) => setSessionPreferences(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
            >
              <option value="adaptive">LearnFlow Adaptive</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Safety Mode</label>
            <select
              value={sessionPreferences.safetyMode}
              onChange={(e) => setSessionPreferences(prev => ({ ...prev, safetyMode: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
            >
              <option value="full">Full Safety Protocol</option>
              <option value="essential">Essential Only</option>
              <option value="minimal">Minimal Warnings</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              checked={sessionPreferences.hapticFeedback}
              onChange={(e) => setSessionPreferences(prev => ({ ...prev, hapticFeedback: e.target.checked }))}
              className="rounded border-slate-600"
            />
            Haptic Feedback
          </label>
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              checked={sessionPreferences.collaborativeMode}
              onChange={(e) => setSessionPreferences(prev => ({ ...prev, collaborativeMode: e.target.checked }))}
              className="rounded border-slate-600"
            />
            Collaborative Mode
          </label>
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              checked={sessionPreferences.recordSession}
              onChange={(e) => setSessionPreferences(prev => ({ ...prev, recordSession: e.target.checked }))}
              className="rounded border-slate-600"
            />
            Record Session
          </label>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {sessionActive && selectedScenario ? (
            <motion.div
              key="vr-environment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VREnvironment
                scenario={selectedScenario}
                onEndSession={handleEndSession}
                preferences={sessionPreferences}
                capabilities={vrCapabilities}
                isCollaborative={sessionMode === 'collaborative'}
              />
              {sessionMode === 'collaborative' && <CollaborativeToolbar session={collaborativeSession} />}
            </motion.div>
          ) : (
            <motion.div
              key="vr-hub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Enhanced Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    LearnFlow VR Training Hub
                  </h1>
                </div>
                <p className="text-slate-300 text-lg max-w-3xl mx-auto">
                  Immerse yourself in realistic virtual environments where you can practice complex procedures safely,
                  make mistakes without consequences, and build muscle memory through repetitive training.
                </p>

                {/* Enhanced Feature Highlights */}
                <div className="flex justify-center gap-8 mt-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>Risk-Free Training</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span>Precision Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Collaborative Sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-yellow-400" />
                    <span>LearnFlow Intelligence</span>
                  </div>
                </div>
              </div>

              {/* NEW: Session Mode Selector */}
              <Card className="bg-slate-800/90 backdrop-blur-md border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Select Session Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button
                    variant={sessionMode === 'solo' ? 'default' : 'outline'}
                    onClick={() => setSessionMode('solo')}
                    className="flex-1"
                  >
                    Solo Training
                  </Button>
                  <Button
                    variant={sessionMode === 'collaborative' ? 'default' : 'outline'}
                    onClick={() => setSessionMode('collaborative')}
                    className="flex-1"
                  >
                    Collaborative Session
                  </Button>
                </CardContent>
              </Card>

              {/* VR System Status */}
              <VRSystemStatus />

              {/* Session Preferences */}
              <SessionPreferences />

              {/* Enhanced Scenario Selector */}
              <ScenarioSelector
                scenarios={vrScenarios}
                onSelectScenario={handleSelectScenario}
                isLoading={isLoading}
                systemCapabilities={vrCapabilities}
                preferences={sessionPreferences}
              />

              {/* Enhanced Performance Metrics */}
              <PerformanceMetrics
                vrScenarios={vrScenarios}
                userProgress={userProgress}
                isLoading={isLoading}
                showAdvancedMetrics={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
