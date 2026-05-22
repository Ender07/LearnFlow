import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles,
  Target,
  BookOpen,
  Users,
  Award,
  Settings,
  Eye,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingProgress } from '@/entities/all';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to LearnFlow!',
    description: 'Your intelligent manufacturing training platform',
    icon: Sparkles,
    content: 'LearnFlow transforms how your team learns and masters manufacturing processes. Let\'s take a quick tour to get you started.',
    highlight: null
  },
  {
    id: 'dashboard',
    title: 'Your Personal Dashboard',
    description: 'Track your progress and see what\'s next',
    icon: Target,
    content: 'This is your command center. Here you can see your training progress, upcoming assignments, and personalized recommendations.',
    highlight: '.dashboard-stats, .todays-focus'
  },
  {
    id: 'process-library',
    title: 'Process Library',
    description: 'Browse and start training processes',
    icon: BookOpen,
    content: 'Access hundreds of work instructions, procedures, and training materials. Use filters to find exactly what you need.',
    highlight: '[href*="ProcessLibrary"]'
  },
  {
    id: 'knowledge-hub',
    title: 'Knowledge Hub',
    description: 'Connect with experts and share knowledge',
    icon: Users,
    content: 'Ask questions, share tips, and learn from your colleagues. Our community-driven knowledge base grows stronger with every contribution.',
    highlight: '[href*="KnowledgeHub"]'
  },
  {
    id: 'ar-training',
    title: 'AR & VR Training',
    description: 'Experience immersive learning',
    icon: Eye,
    content: 'Use augmented reality for hands-on guidance and virtual reality for safe practice scenarios. The future of training is here.',
    highlight: '[href*="ARGuidance"], [href*="VRSimulation"]'
  },
  {
    id: 'achievements',
    title: 'Earn Achievements',
    description: 'Track your progress and earn rewards',
    icon: Award,
    content: 'Complete processes, help others, and earn points and badges. Gamification makes learning engaging and rewarding.',
    highlight: '[href*="Awards"]'
  },
  {
    id: 'analytics',
    title: 'Track Your Growth',
    description: 'Monitor your learning analytics',
    icon: BarChart3,
    content: 'See detailed insights into your learning progress, skill development, and areas for improvement.',
    highlight: '[href*="Analytics"]'
  },
  {
    id: 'profile',
    title: 'Customize Your Experience',
    description: 'Personalize LearnFlow to your needs',
    icon: Settings,
    content: 'Adjust your preferences, manage notifications, and customize your interface. Make LearnFlow work the way you do.',
    highlight: '.user-profile, [href*="Profile"]'
  }
];

export default function OnboardingTour({ userId, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, [userId]);

  const checkOnboardingStatus = async () => {
    if (!userId) return;

    try {
      const existingProgress = await OnboardingProgress.filter({ 
        user_id: userId, 
        onboarding_type: 'first_time' 
      });

      if (existingProgress.length === 0) {
        // New user - start onboarding
        const newProgress = await OnboardingProgress.create({
          user_id: userId,
          onboarding_type: 'first_time',
          current_step: 0,
          completed_steps: [],
          skipped_steps: []
        });
        setProgress(newProgress);
        setIsVisible(true);
      } else {
        const userProgress = existingProgress[0];
        if (!userProgress.is_completed) {
          setProgress(userProgress);
          setCurrentStep(userProgress.current_step);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const nextStep = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      await updateProgress(newStep, [...(progress?.completed_steps || []), onboardingSteps[currentStep].id]);
    } else {
      await completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = async () => {
    const skippedSteps = [...(progress?.skipped_steps || []), onboardingSteps[currentStep].id];
    await updateProgress(currentStep + 1, progress?.completed_steps || [], skippedSteps);
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const updateProgress = async (step, completedSteps = [], skippedSteps = []) => {
    if (!progress) return;

    try {
      const updatedProgress = await OnboardingProgress.update(progress.id, {
        current_step: step,
        completed_steps: completedSteps,
        skipped_steps: skippedSteps,
        completion_percentage: Math.round((completedSteps.length / onboardingSteps.length) * 100)
      });
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
    }
  };

  const completeOnboarding = async () => {
    if (!progress) return;

    try {
      await OnboardingProgress.update(progress.id, {
        is_completed: true,
        completion_percentage: 100,
        completed_steps: [...(progress.completed_steps || []), onboardingSteps[currentStep].id]
      });
      
      setIsVisible(false);
      onComplete?.();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const skipOnboarding = async () => {
    if (!progress) return;

    try {
      await OnboardingProgress.update(progress.id, {
        is_completed: true,
        skipped_steps: onboardingSteps.map(step => step.id)
      });
      
      setIsVisible(false);
      onSkip?.();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  // Highlight elements based on current step
  useEffect(() => {
    const step = onboardingSteps[currentStep];
    if (step?.highlight) {
      const elements = document.querySelectorAll(step.highlight);
      elements.forEach(el => {
        el.classList.add('onboarding-highlight');
      });

      return () => {
        elements.forEach(el => {
          el.classList.remove('onboarding-highlight');
        });
      };
    }
  }, [currentStep]);

  if (!isVisible || !progress) return null;

  const step = onboardingSteps[currentStep];
  const progressPercentage = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" />
      
      {/* Onboarding Card */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
        >
          <Card className="shadow-2xl border-0 bg-white">
            <CardContent className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                    <step.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipOnboarding}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Step {currentStep + 1} of {onboardingSteps.length}
                  </span>
                  <span className="text-sm text-slate-500">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Content */}
              <div className="mb-8">
                <p className="text-slate-700 leading-relaxed">{step.content}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={previousStep}
                    disabled={currentStep === 0}
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={skipStep}
                    size="sm"
                    className="text-slate-500"
                  >
                    Skip
                  </Button>
                </div>
                
                <Button onClick={nextStep}>
                  {currentStep === onboardingSteps.length - 1 ? 'Get Started!' : 'Next'}
                  {currentStep < onboardingSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* CSS for highlighting elements */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .reduced-motion .onboarding-highlight {
          transition: none;
        }
      `}</style>
    </>
  );
}