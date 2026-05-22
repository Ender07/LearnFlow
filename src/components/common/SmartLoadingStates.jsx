import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wifi, WifiOff, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const SmartSkeleton = ({ type, count = 1, className = "" }) => {
  const variants = {
    card: () => (
      <div className={`space-y-3 ${className}`}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    ),
    list: () => (
      <div className={`space-y-2 ${className}`}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    ),
    dashboard: () => (
      <div className={`space-y-6 ${className}`}>
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    table: () => (
      <div className={`space-y-2 ${className}`}>
        <div className="flex gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array(4).fill(0).map((_, j) => (
              <Skeleton key={j} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </div>
    )
  };

  const SkeletonComponent = variants[type] || variants.card;
  
  return (
    <>
      {Array(count).fill(0).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <SkeletonComponent />
        </motion.div>
      ))}
    </>
  );
};

export const LoadingSpinner = ({ size = "default", text = "", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <motion.div 
      className={`flex items-center justify-center gap-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && <span className="text-slate-600">{text}</span>}
    </motion.div>
  );
};

export const ConnectionStatus = ({ isOnline = true, isLoading = false }) => {
  const statusConfig = {
    online: { 
      icon: Wifi, 
      text: "Connected", 
      className: "text-green-600 bg-green-50 border-green-200" 
    },
    offline: { 
      icon: WifiOff, 
      text: "Offline", 
      className: "text-red-600 bg-red-50 border-red-200" 
    },
    loading: { 
      icon: Clock, 
      text: "Connecting...", 
      className: "text-amber-600 bg-amber-50 border-amber-200" 
    }
  };

  const status = isLoading ? 'loading' : (isOnline ? 'online' : 'offline');
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <Icon className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
      {config.text}
    </motion.div>
  );
};

export const ProgressiveImage = ({ src, alt, placeholder, className = "" }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!imageLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 bg-slate-200 flex items-center justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {placeholder || <div className="w-8 h-8 bg-slate-300 rounded" />}
        </motion.div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400">
          Failed to load
        </div>
      )}

      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setHasError(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 1 : 0 }}
      />
    </div>
  );
};

export default {
  SmartSkeleton,
  LoadingSpinner,
  ConnectionStatus,
  ProgressiveImage
};