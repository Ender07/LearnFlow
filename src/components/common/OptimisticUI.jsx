import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from './Toast';

export const useOptimisticUpdate = (updateFn, optimisticUpdate) => {
  const [optimisticState, setOptimisticState] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();

  const executeUpdate = useCallback(async (data) => {
    setIsUpdating(true);
    
    // Apply optimistic update immediately
    if (optimisticUpdate) {
      const optimisticResult = optimisticUpdate(data);
      setOptimisticState(optimisticResult);
    }

    try {
      const result = await updateFn(data);
      
      // Success - clear optimistic state and show success feedback
      setOptimisticState(null);
      showToast({
        type: 'success',
        title: 'Updated successfully',
        message: 'Your changes have been saved.'
      });
      
      return result;
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticState(null);
      showToast({
        type: 'error',
        title: 'Update failed',
        message: error.message || 'Please try again.'
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [updateFn, optimisticUpdate, showToast]);

  return { executeUpdate, optimisticState, isUpdating };
};

export const OptimisticButton = ({ 
  children, 
  onClick, 
  optimisticText = "Saving...", 
  successText = "Saved!",
  className = "",
  ...props 
}) => {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleClick = async (e) => {
    setStatus('loading');
    try {
      await onClick(e);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const statusConfig = {
    idle: { text: children, icon: null, className: className },
    loading: { text: optimisticText, icon: Loader2, className: `${className} opacity-75 cursor-not-allowed` },
    success: { text: successText, icon: CheckCircle, className: `${className} bg-green-600 hover:bg-green-600` },
    error: { text: "Try Again", icon: XCircle, className: `${className} bg-red-600 hover:bg-red-600` }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.button
      className={config.className}
      onClick={handleClick}
      disabled={status === 'loading'}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex items-center gap-2"
        >
          {Icon && (
            <Icon 
              className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} 
            />
          )}
          {config.text}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

export default { useOptimisticUpdate, OptimisticButton };