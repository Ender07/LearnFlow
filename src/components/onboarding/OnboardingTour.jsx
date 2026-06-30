import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, MapPin, Sparkles, Shield, Wifi, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to LearnFlow! 👋',
    description: 'Your intelligent training platform has powerful new features. Let us show you around in 60 seconds.',
    icon: Sparkles,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    target: null,
  },
  {
    id: 'knowledge_hub',
    title: 'Knowledge Network Map',
    description: 'Visit the Knowledge Hub to see how all your organization\'s insights connect across processes — visualized as an interactive network.',
    icon: Network,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    link: '/KnowledgeHub',
    linkLabel: 'Open Knowledge Hub →',
  },
  {
    id: 'related_insights',
    title: 'Related Insights Engine',
    description: 'When training on any process, the AI automatically surfaces knowledge from similar processes — so expertise transfers across your entire organization.',
    icon: Sparkles,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    link: '/ProcessLibrary',
    linkLabel: 'Browse Processes →',
  },
  {
    id: 'compliance',
    title: 'Compliance Center',
    description: 'The Compliance Center forecasts certification gaps up to 90 days ahead, auto-assigns renewal training, and scans your processes against uploaded regulations.',
    icon: Shield,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    link: '/ComplianceCenter',
    linkLabel: 'Open Compliance Center →',
  },
  {
    id: 'audit',
    title: 'Audit Console',
    description: 'Every security event, compliance scan, and supervisor review is logged in the tamper-proof Audit Console — ready for regulatory reporting.',
    icon: Shield,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    link: '/ComplianceCenter',
    linkLabel: 'View Audit Console →',
  },
  {
    id: 'offline',
    title: 'Offline Sync',
    description: 'Working on the shop floor? Use the Offline Sync panel to download process guides and continue training even without an internet connection.',
    icon: Wifi,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    link: '/MyLearning',
    linkLabel: 'Set Up Offline Access →',
  },
];

const TOUR_KEY = 'learnflow_tour_v2_dismissed';

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem(TOUR_KEY);
    if (!dismissed) {
      // Slight delay so the page renders first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setVisible(false);
  };

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1a2540] border border-slate-600 rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-slate-700">
          <div
            className="h-1 bg-blue-500 transition-all duration-300"
            style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Step counter */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 text-xs">{step + 1} of {TOUR_STEPS.length}</span>
            </div>
            <button onClick={dismiss} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Icon */}
          <div className={`w-14 h-14 ${current.bg} border ${current.border} rounded-2xl flex items-center justify-center mb-5`}>
            <current.icon className={`w-7 h-7 ${current.color}`} />
          </div>

          {/* Content */}
          <h3 className="text-white font-bold text-xl mb-2">{current.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">{current.description}</p>

          {/* Link */}
          {current.link && (
            <a
              href={current.link}
              onClick={dismiss}
              className={`block text-sm font-medium ${current.color} hover:underline mb-5`}
            >
              {current.linkLabel}
            </a>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={dismiss}
              className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-3">
              {!isFirst && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStep(s => s - 1)}
                  className="text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              {isLast ? (
                <Button
                  size="sm"
                  onClick={dismiss}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Get Started 🚀
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setStep(s => s + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all ${i === step ? 'w-4 h-2 bg-blue-500' : 'w-2 h-2 bg-slate-600 hover:bg-slate-500'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}