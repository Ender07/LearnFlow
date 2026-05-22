import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Clock, Database } from 'lucide-react';

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    cacheHitRate: 100
  });

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            networkLatency: entry.responseStart - entry.requestStart
          }));
        }
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'measure'] });

    // Monitor memory usage
    const updateMemory = () => {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize / 1048576; // Convert to MB
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(used)
        }));
      }
    };

    const interval = setInterval(updateMemory, 5000);
    updateMemory(); // Initial call

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return metrics;
};

export const LazyLoad = ({ 
  children, 
  fallback = null, 
  threshold = 0.1,
  rootMargin = "0px" 
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsIntersecting(true);
          setHasLoaded(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasLoaded]);

  return (
    <div ref={ref}>
      <AnimatePresence mode="wait">
        {hasLoaded || isIntersecting ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {fallback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const VirtualizedList = ({ 
  items, 
  itemHeight = 60, 
  containerHeight = 400,
  renderItem,
  overscan = 3 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      item: items[i],
      offset: i * itemHeight
    });
  }

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div
      ref={setContainerRef}
      style={{ height: containerHeight, overflowY: 'auto' }}
      onScroll={handleScroll}
      className="relative"
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ index, item, offset }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offset,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export const PerformanceWidget = () => {
  const metrics = usePerformanceMonitor();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development mode
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname === '');

  if (!isDevelopment) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-slate-900 text-white p-2 rounded-full shadow-lg hover:bg-slate-800 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Activity className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-2 bg-white border shadow-xl rounded-lg p-4 min-w-64"
          >
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Performance Metrics
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Render Time:
                </span>
                <span className="font-mono">{metrics.renderTime.toFixed(1)}ms</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Memory:
                </span>
                <span className="font-mono">{metrics.memoryUsage}MB</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Network:
                </span>
                <span className="font-mono">{metrics.networkLatency.toFixed(0)}ms</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default {
  usePerformanceMonitor,
  LazyLoad,
  VirtualizedList,
  PerformanceWidget
};