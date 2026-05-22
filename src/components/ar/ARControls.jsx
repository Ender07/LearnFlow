import React from 'react';
import { Button } from '@/components/ui/button';
import { SkipBack, SkipForward, Pause, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ARControls({ currentStep, totalSteps, onPrevious, onNext, onPause, onExit }) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md z-50"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        <Button 
          variant="ghost" 
          size="lg" 
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={onPrevious}
          disabled={currentStep === 0}
        >
          <SkipBack className="w-6 h-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="lg" 
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={onPause}
        >
          <Pause className="w-8 h-8" />
        </Button>
        <Button 
          variant="ghost" 
          size="lg" 
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
        >
          <SkipForward className="w-6 h-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="lg" 
          className="text-red-400 hover:bg-red-500/20 hover:text-red-400"
          onClick={onExit}
        >
          <XCircle className="w-6 h-6" />
        </Button>
      </div>
    </motion.div>
  );
}