import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const LiveSafetyMonitor = ({ isHazardousArea, step }) => {
  const [safetyStatus, setSafetyStatus] = useState('safe');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    // Simulate safety monitoring based on step or simulated user action
    const safetyCheck = () => {
      if (step.is_critical) {
        setSafetyStatus('monitoring');
        setAlertMessage('Critical step: Proceed with maximum caution.');
      } else if (isHazardousArea) {
        setSafetyStatus('hazard');
        setAlertMessage('HAZARD DETECTED: Unauthorized area access!');
      } else {
        setSafetyStatus('safe');
        setAlertMessage('Safety protocols active. Area is clear.');
      }
    };
    
    safetyCheck();
    const interval = setInterval(safetyCheck, 5000); // Re-check every 5 seconds

    return () => clearInterval(interval);
  }, [isHazardousArea, step]);

  const statusConfig = {
    safe: { icon: ShieldCheck, color: 'text-green-400', bgColor: 'bg-green-900/50', borderColor: 'border-green-500/30' },
    monitoring: { icon: ShieldCheck, color: 'text-blue-400', bgColor: 'bg-blue-900/50', borderColor: 'border-blue-500/30' },
    hazard: { icon: ShieldAlert, color: 'text-red-400', bgColor: 'bg-red-900/50', borderColor: 'border-red-500/30' }
  };
  
  const currentConfig = statusConfig[safetyStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute bottom-24 left-4 z-30 p-4 rounded-lg shadow-2xl flex items-center gap-4 ${currentConfig.bgColor} ${currentConfig.borderColor} border backdrop-blur-md`}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={safetyStatus}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
        >
          <currentConfig.icon className={`w-10 h-10 ${currentConfig.color}`} />
        </motion.div>
      </AnimatePresence>
      <div>
        <h4 className={`font-semibold ${currentConfig.color}`}>{safetyStatus.toUpperCase()}</h4>
        <p className="text-sm text-slate-200">{alertMessage}</p>
      </div>
    </motion.div>
  );
};

export default LiveSafetyMonitor;