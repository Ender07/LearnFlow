import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, HelpCircle } from 'lucide-react';

// Global tooltip state management
let activeTooltips = new Set();
let tooltipQueue = [];
let isShowingSequence = false;

export default function GuidedTooltip({ 
  id,
  children,
  title,
  content,
  placement = 'bottom',
  trigger = 'click',
  sequence = null,
  showOnFirstVisit = false,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Check if this tooltip should be shown on first visit
    if (showOnFirstVisit) {
      const shown = localStorage.getItem(`tooltip-${id}-shown`);
      if (!shown) {
        setTimeout(() => {
          showTooltip();
          localStorage.setItem(`tooltip-${id}-shown`, 'true');
        }, 1000);
      }
    }
  }, [id, showOnFirstVisit]);

  const showTooltip = () => {
    if (sequence && !isShowingSequence) {
      startSequence();
    } else {
      setIsVisible(true);
      activeTooltips.add(id);
    }
  };

  const hideTooltip = () => {
    setIsVisible(false);
    activeTooltips.delete(id);
    setHasBeenShown(true);
  };

  const startSequence = () => {
    isShowingSequence = true;
    tooltipQueue = [...sequence];
    showNextInSequence();
  };

  const showNextInSequence = () => {
    if (tooltipQueue.length === 0) {
      isShowingSequence = false;
      return;
    }

    const nextTooltipId = tooltipQueue.shift();
    if (nextTooltipId === id) {
      setIsVisible(true);
      activeTooltips.add(id);
    }
  };

  const getPlacementClasses = () => {
    const baseClasses = "absolute z-50 bg-slate-900 text-white rounded-lg shadow-xl p-4 max-w-xs";
    
    switch (placement) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
    }
  };

  const getArrowClasses = () => {
    const baseArrow = "absolute w-2 h-2 bg-slate-900 transform rotate-45";
    
    switch (placement) {
      case 'top':
        return `${baseArrow} top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${baseArrow} left-full top-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseArrow} right-full top-1/2 transform translate-x-1/2 -translate-y-1/2`;
      default:
        return `${baseArrow} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2`;
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onClick={trigger === 'click' ? showTooltip : undefined}
        onMouseEnter={trigger === 'hover' ? showTooltip : undefined}
        onMouseLeave={trigger === 'hover' ? hideTooltip : undefined}
        className="cursor-help"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={getPlacementClasses()}
          >
            <div className={getArrowClasses()} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2">
                {title && (
                  <h4 className="font-semibold text-sm leading-tight pr-2">
                    {title}
                  </h4>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={hideTooltip}
                  className="h-6 w-6 text-gray-400 hover:text-white flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-sm text-gray-200 leading-relaxed mb-3">
                {content}
              </p>
              
              {sequence && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {sequence.indexOf(id) + 1} of {sequence.length}
                  </span>
                  <div className="flex gap-2">
                    {sequence.indexOf(id) < sequence.length - 1 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          hideTooltip();
                          setTimeout(showNextInSequence, 200);
                        }}
                        className="text-xs bg-white text-slate-900 hover:bg-gray-100"
                      >
                        Next
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        hideTooltip();
                        isShowingSequence = false;
                        tooltipQueue = [];
                      }}
                      className="text-xs border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Skip Tour
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for quick help tooltips
export function QuickHelp({ content, title, className = '' }) {
  return (
    <GuidedTooltip
      id={`quick-help-${Date.now()}`}
      title={title}
      content={content}
      trigger="click"
      className={className}
    >
      <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
    </GuidedTooltip>
  );
}