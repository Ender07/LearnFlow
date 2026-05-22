import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Zap } from 'lucide-react';

export const AchievementToast = ({ title, message, type = 'points', onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'level':
        return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'badge':
        return <Award className="w-6 h-6 text-purple-400" />;
      case 'points':
      default:
        return <Star className="w-6 h-6 text-blue-400" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'level':
        return 'from-yellow-400 to-orange-500';
      case 'badge':
        return 'from-purple-400 to-pink-500';
      case 'points':
      default:
        return 'from-blue-400 to-indigo-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`relative overflow-hidden rounded-xl shadow-2xl border-0 bg-gradient-to-r ${getGradient()} p-6 text-white max-w-sm`}
    >
      {/* Animated background sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      <div className="relative flex items-start gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex-shrink-0"
        >
          {getIcon()}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-lg mb-1">{title}</h4>
          <p className="text-white/90 text-sm">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
};