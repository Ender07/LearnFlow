import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Target,
  Activity,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIEmbeddedMentor, BiometricSession } from '@/entities/all';

export default function OperationalCoachingOverlay({ 
  currentTask,
  userBiometrics,
  equipmentData,
  environmentalConditions,
  userProfile,
  onInterventionDelivered
}) {
  const [aiMentor, setAIMentor] = useState(null);
  const [activeInterventions, setActiveInterventions] = useState([]);
  const [contextualAwareness, setContextualAwareness] = useState({});
  const [cognitiveLoadAssessment, setCognitiveLoadAssessment] = useState(0);
  const [realTimeCoaching, setRealTimeCoaching] = useState([]);
  const [biometricSession, setBiometricSession] = useState(null);

  useEffect(() => {
    initializeAIMentor();
    startBiometricMonitoring();
  }, []);

  useEffect(() => {
    if (aiMentor && userBiometrics) {
      updateContextualAwareness();
      assessCognitiveLoad();
      generateRealTimeCoaching();
    }
  }, [userBiometrics, equipmentData, environmentalConditions]);

  const initializeAIMentor = async () => {
    try {
      const mentorPersona = adaptMentorToUser(userProfile);
      
      const mentor = await AIEmbeddedMentor.create({
        mentor_id: `mentor_${Date.now()}_${userProfile.id}`,
        user_id: userProfile.id,
        mentor_persona: mentorPersona,
        contextual_awareness: {},
        intervention_history: [],
        learning_adaptation: {
          user_preferences_learned: {},
          optimal_intervention_timing: {},
          successful_coaching_patterns: [],
          avoided_intervention_types: []
        },
        federated_learning_contributions: {
          insights_contributed: [],
          knowledge_received: [],
          privacy_preserved_data: {}
        }
      });

      setAIMentor(mentor);
    } catch (error) {
      console.error('Error initializing AI mentor:', error);
    }
  };

  const adaptMentorToUser = (profile) => {
    // Adapt mentor personality based on user profile
    let communicationStyle = 'encouraging';
    let personalityTraits = ['supportive', 'patient'];

    if (profile.experience_level === 'expert') {
      communicationStyle = 'analytical';
      personalityTraits = ['direct', 'technical', 'efficiency-focused'];
    } else if (profile.learning_style === 'visual') {
      personalityTraits.push('visual-oriented', 'demonstrative');
    }

    return {
      personality_traits: personalityTraits,
      communication_style: communicationStyle,
      expertise_domains: profile.skill_areas || ['general_manufacturing'],
      adaptability_level: 0.8
    };
  };

  const startBiometricMonitoring = async () => {
    if (!currentTask) return;

    try {
      const session = await BiometricSession.create({
        user_id: userProfile.id,
        process_id: currentTask.id,
        session_start: new Date().toISOString(),
        heart_rate_data: [],
        eye_tracking_data: [],
        cognitive_load_assessment: {
          overall_load: 0,
          peak_load_moments: []
        }
      });

      setBiometricSession(session);
    } catch (error) {
      console.error('Error starting biometric monitoring:', error);
    }
  };

  const updateContextualAwareness = async () => {
    const awareness = {
      current_task_context: {
        task_id: currentTask?.id,
        task_type: currentTask?.instruction_type,
        complexity_level: currentTask?.difficulty_level,
        time_elapsed: calculateTaskElapsed(),
        completion_percentage: calculateTaskProgress()
      },
      environmental_conditions: {
        lighting_level: environmentalConditions?.lighting || 'optimal',
        noise_level: environmentalConditions?.noise || 'acceptable',
        temperature: environmentalConditions?.temperature || 22,
        safety_status: environmentalConditions?.safety_status || 'safe'
      },
      user_cognitive_state: {
        stress_level: assessStressFromBiometrics(),
        fatigue_level: assessFatigueFromBiometrics(),
        attention_level: assessAttentionFromBiometrics(),
        cognitive_load: cognitiveLoadAssessment
      },
      equipment_status: {
        operational_state: equipmentData?.status || 'unknown',
        performance_metrics: equipmentData?.performance || {},
        alerts: equipmentData?.alerts || []
      },
      safety_considerations: identifyCurrentSafetyFactors()
    };

    setContextualAwareness(awareness);

    if (aiMentor) {
      await AIEmbeddedMentor.update(aiMentor.id, {
        contextual_awareness: awareness
      });
    }
  };

  const assessCognitiveLoad = () => {
    if (!userBiometrics) return;

    let loadScore = 0;

    // Heart rate variability indicates stress/load
    if (userBiometrics.heart_rate > userProfile.baseline_heart_rate * 1.2) {
      loadScore += 30;
    }

    // Eye tracking patterns indicate cognitive effort
    if (userBiometrics.eye_tracking?.fixation_duration > 300) {
      loadScore += 20; // Long fixations can indicate difficulty processing
    }

    // Task complexity factor
    if (currentTask?.difficulty_level === 'expert') {
      loadScore += 25;
    } else if (currentTask?.difficulty_level === 'advanced') {
      loadScore += 15;
    }

    // Environmental stress factors
    if (environmentalConditions?.noise > 70) {
      loadScore += 10;
    }

    setCognitiveLoadAssessment(Math.min(100, loadScore));

    // Update biometric session
    if (biometricSession) {
      BiometricSession.update(biometricSession.id, {
        cognitive_load_assessment: {
          overall_load: loadScore,
          peak_load_moments: loadScore > 70 ? 
            [...(biometricSession.cognitive_load_assessment?.peak_load_moments || []), new Date().toISOString()] :
            biometricSession.cognitive_load_assessment?.peak_load_moments || []
        }
      });
    }
  };

  const generateRealTimeCoaching = async () => {
    if (!aiMentor || !contextualAwareness.current_task_context) return;

    const coachingPrompts = [];

    // High cognitive load intervention
    if (cognitiveLoadAssessment > 70) {
      coachingPrompts.push({
        type: 'cognitive_load_reduction',
        urgency: 'high',
        message: 'I notice you might be experiencing high cognitive load. Let me break this down into smaller steps.',
        action: 'simplify_current_step',
        timing: 'immediate'
      });
    }

    // Performance optimization suggestions
    if (contextualAwareness.current_task_context.completion_percentage < 50 && 
        calculateTaskElapsed() > currentTask?.estimated_duration * 0.7) {
      coachingPrompts.push({
        type: 'performance_optimization',
        urgency: 'medium',
        message: 'Based on your progress, here are some tips to work more efficiently on this step.',
        action: 'provide_efficiency_tips',
        timing: 'appropriate_pause'
      });
    }

    // Safety coaching
    const safetyRisks = identifyCurrentSafetyFactors();
    if (safetyRisks.length > 0 && !isRecentSafetyReminderGiven()) {
      coachingPrompts.push({
        type: 'safety_reminder',
        urgency: 'high',
        message: 'Safety reminder: Please ensure proper protective equipment and follow safety protocols.',
        action: 'safety_checkpoint',
        timing: 'immediate'
      });
    }

    // Encouragement based on performance
    if (contextualAwareness.user_cognitive_state.stress_level > 60) {
      coachingPrompts.push({
        type: 'encouragement',
        urgency: 'low',
        message: 'You\'re doing great! Take your time and focus on accuracy over speed.',
        action: 'motivational_support',
        timing: 'next_natural_break'
      });
    }

    setRealTimeCoaching(coachingPrompts);

    // Log interventions for learning
    if (coachingPrompts.length > 0) {
      recordInterventions(coachingPrompts);
    }
  };

  const recordInterventions = async (interventions) => {
    if (!aiMentor) return;

    const interventionRecords = interventions.map(intervention => ({
      timestamp: new Date().toISOString(),
      intervention_type: intervention.type,
      trigger_reason: `Cognitive load: ${cognitiveLoadAssessment}, Task progress: ${contextualAwareness.current_task_context?.completion_percentage}%`,
      content_delivered: intervention.message,
      user_response: null, // To be filled when user responds
      effectiveness_score: null // To be calculated based on outcome
    }));

    const updatedHistory = [...(aiMentor.intervention_history || []), ...interventionRecords];

    await AIEmbeddedMentor.update(aiMentor.id, {
      intervention_history: updatedHistory
    });

    if (onInterventionDelivered) {
      interventions.forEach(intervention => {
        onInterventionDelivered(intervention);
      });
    }
  };

  const deliverIntervention = async (intervention) => {
    setActiveInterventions(prev => [...prev, {
      ...intervention,
      id: Date.now(),
      delivered_at: new Date().toISOString()
    }]);

    // Remove intervention after appropriate time
    setTimeout(() => {
      setActiveInterventions(prev => prev.filter(i => i.id !== intervention.id));
    }, intervention.type === 'safety_reminder' ? 10000 : 5000);
  };

  // Helper functions
  const calculateTaskElapsed = () => {
    if (!currentTask?.start_time) return 0;
    return (new Date() - new Date(currentTask.start_time)) / 1000 / 60; // minutes
  };

  const calculateTaskProgress = () => {
    return currentTask?.completion_percentage || 0;
  };

  const assessStressFromBiometrics = () => {
    if (!userBiometrics) return 0;
    const baselineHR = userProfile.baseline_heart_rate || 70;
    const currentHR = userBiometrics.heart_rate || baselineHR;
    return Math.min(100, Math.max(0, ((currentHR - baselineHR) / baselineHR) * 100));
  };

  const assessFatigueFromBiometrics = () => {
    if (!userBiometrics?.eye_tracking) return 0;
    const blinkRate = userBiometrics.eye_tracking.blink_rate || 15;
    const normalBlinkRate = 15;
    return Math.min(100, Math.max(0, ((blinkRate - normalBlinkRate) / normalBlinkRate) * 50));
  };

  const assessAttentionFromBiometrics = () => {
    if (!userBiometrics?.eye_tracking) return 100;
    const fixationStability = userBiometrics.eye_tracking.fixation_stability || 1;
    return Math.min(100, Math.max(0, fixationStability * 100));
  };

  const identifyCurrentSafetyFactors = () => {
    const factors = [];
    
    if (currentTask?.safety_warnings?.length > 0) {
      factors.push(...currentTask.safety_warnings);
    }
    
    if (equipmentData?.alerts?.some(alert => alert.type === 'safety')) {
      factors.push('Equipment safety alert active');
    }
    
    if (environmentalConditions?.safety_status !== 'safe') {
      factors.push('Environmental safety conditions detected');
    }
    
    return factors;
  };

  const isRecentSafetyReminderGiven = () => {
    if (!aiMentor?.intervention_history) return false;
    const recentSafetyReminders = aiMentor.intervention_history
      .filter(i => i.intervention_type === 'safety_reminder')
      .filter(i => new Date() - new Date(i.timestamp) < 5 * 60 * 1000); // Within 5 minutes
    return recentSafetyReminders.length > 0;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Biometric Status Overlay */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <Card className="bg-black/80 backdrop-blur-md border-blue-500/30 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">AI Mentor Active</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Cognitive Load:</span>
                <div className="flex items-center gap-2">
                  <Progress value={cognitiveLoadAssessment} className="w-16 h-2" />
                  <span className={`${
                    cognitiveLoadAssessment > 70 ? 'text-red-400' :
                    cognitiveLoadAssessment > 40 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {Math.round(cognitiveLoadAssessment)}%
                  </span>
                </div>
              </div>
              
              {userBiometrics && (
                <>
                  <div className="flex justify-between">
                    <span>Heart Rate:</span>
                    <span className="text-blue-300">{userBiometrics.heart_rate || '--'} bpm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attention:</span>
                    <span className="text-blue-300">{Math.round(assessAttentionFromBiometrics())}%</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Coaching Interventions */}
      <AnimatePresence>
        {realTimeCoaching.map((coaching, index) => (
          <motion.div
            key={`${coaching.type}_${index}`}
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="absolute bottom-20 left-1/2 pointer-events-auto max-w-md"
          >
            <Card className={`${
              coaching.urgency === 'high' ? 'border-red-500 bg-red-950/90' :
              coaching.urgency === 'medium' ? 'border-yellow-500 bg-yellow-950/90' :
              'border-blue-500 bg-blue-950/90'
            } backdrop-blur-md text-white shadow-2xl`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {coaching.type === 'safety_reminder' && <Shield className="w-5 h-5 text-red-400" />}
                  {coaching.type === 'cognitive_load_reduction' && <Brain className="w-5 h-5 text-purple-400" />}
                  {coaching.type === 'performance_optimization' && <Target className="w-5 h-5 text-green-400" />}
                  {coaching.type === 'encouragement' && <CheckCircle className="w-5 h-5 text-blue-400" />}
                  AI Mentor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{coaching.message}</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => deliverIntervention(coaching)}
                    className="bg-white/20 hover:bg-white/30"
                  >
                    Acknowledge
                  </Button>
                  {coaching.action === 'simplify_current_step' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Simplify Step
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Active Interventions Display */}
      {activeInterventions.length > 0 && (
        <div className="absolute top-20 right-4 pointer-events-auto">
          <Card className="bg-black/80 backdrop-blur-md border-green-500/30 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-green-400" />
                Active Coaching
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {activeInterventions.map(intervention => (
                  <div key={intervention.id} className="text-sm">
                    <Badge className="bg-green-500/20 text-green-300">
                      {intervention.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Equipment Status Integration */}
      {equipmentData?.alerts?.length > 0 && (
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <Alert className="bg-black/80 backdrop-blur-md border-orange-500/50 text-white">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <AlertDescription>
              Equipment Alert: {equipmentData.alerts[0].message}
              <Button size="sm" className="ml-2 bg-orange-500/20 hover:bg-orange-500/30">
                View Details
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}