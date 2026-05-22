import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

// Enhanced loading skeleton with better animations
export function EnhancedSkeleton({ className, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded ${className}`}
      {...props}
    />
  );
}

// Dashboard loading state
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <EnhancedSkeleton className="h-8 w-80 mb-2" />
          <EnhancedSkeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <EnhancedSkeleton className="h-16 w-16" />
          <EnhancedSkeleton className="h-16 w-16" />
          <EnhancedSkeleton className="h-16 w-16" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <EnhancedSkeleton className="h-4 w-24" />
              <EnhancedSkeleton className="h-8 w-8 rounded-xl" />
            </div>
            <EnhancedSkeleton className="h-8 w-16 mb-2" />
            <EnhancedSkeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Main content grid skeleton */}
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-xl shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <EnhancedSkeleton className="h-6 w-6 rounded-lg" />
                <EnhancedSkeleton className="h-5 w-40" />
              </div>
              <div className="space-y-3">
                <EnhancedSkeleton className="h-4 w-full" />
                <EnhancedSkeleton className="h-4 w-3/4" />
                <EnhancedSkeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-4 space-y-8">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-xl shadow-sm border">
              <EnhancedSkeleton className="h-5 w-32 mb-4" />
              <div className="space-y-4">
                {Array(3).fill(0).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <EnhancedSkeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <EnhancedSkeleton className="h-4 w-full mb-1" />
                      <EnhancedSkeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Process card loading state
export function ProcessCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <EnhancedSkeleton className="h-4 w-20 mb-2" />
          <EnhancedSkeleton className="h-5 w-3/4 mb-2" />
          <EnhancedSkeleton className="h-4 w-full mb-1" />
          <EnhancedSkeleton className="h-4 w-2/3" />
        </div>
        <EnhancedSkeleton className="h-8 w-16 rounded-full" />
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          <EnhancedSkeleton className="h-6 w-12 rounded-full" />
          <EnhancedSkeleton className="h-6 w-16 rounded-full" />
        </div>
        <EnhancedSkeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// Full page loading spinner
export function FullPageLoader({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
        />
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-slate-800 mb-2"
        >
          {message}
        </motion.h3>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-slate-600"
        >
          Please wait while we prepare your experience
        </motion.div>
      </div>
    </div>
  );
}

// Progressive loading indicator
export function ProgressiveLoader({ stages, currentStage, progress }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-slate-800">
            Initializing LearnFlow
          </h3>
        </div>

        <div className="space-y-3">
          {stages.map((stage, index) => (
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                index === currentStage ? 'bg-blue-50 text-blue-800' : 
                index < currentStage ? 'bg-green-50 text-green-800' : 'text-slate-500'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                index === currentStage ? 'bg-blue-600' : 
                index < currentStage ? 'bg-green-600' : 'bg-slate-300'
              }`} />
              <span className="text-sm font-medium">{stage}</span>
              {index === currentStage && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full ml-auto"
                />
              )}
            </motion.div>
          ))}
        </div>

        {progress && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-blue-600 h-2 rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}