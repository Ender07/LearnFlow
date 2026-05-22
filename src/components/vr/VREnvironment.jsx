
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Orbit, Eye, Target, Timer, Zap, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { motion, AnimatePresence } from 'framer-motion';

import VRAvatar from './VRAvatar'; // New import

export default function VREnvironment({ scenario, onEndSession, preferences, capabilities, isCollaborative }) {
  const [identifiedHazards, setIdentifiedHazards] = useState(new Set());
  const [startTime] = useState(Date.now());
  const [currentView, setCurrentView] = useState('workshop');
  const [sessionProgress, setSessionProgress] = useState(0);
  const [interactionMode, setInteractionMode] = useState('observation');
  const canvasRef = useRef(null);
  const [digitalTwinData, setDigitalTwinData] = useState({ pressure: 14.7, temp: 22.5 }); // New state
  const [showDataAlert, setShowDataAlert] = useState(false); // New state
  
  const hazards = [
    { id: 1, name: 'Oil Spill', location: 'Floor near workbench', severity: 'high' },
    { id: 2, name: 'Missing Safety Guard', location: 'Machine tool', severity: 'critical' },
    { id: 3, name: 'Loose Tool', location: 'Workbench edge', severity: 'medium' },
    { id: 4, name: 'Blocked Emergency Exit', location: 'Rear door', severity: 'high' },
    { id: 5, name: 'Frayed Electrical Cord', location: 'Power station', severity: 'critical' }
  ];

  const workshopAreas = [
    { id: 'workbench', name: 'Main Workbench', description: 'Primary assembly area' },
    { id: 'machine_area', name: 'Machine Tools', description: 'CNC and milling machines' },
    { id: 'storage', name: 'Tool Storage', description: 'Organized tool storage area' },
    { id: 'safety_station', name: 'Safety Station', description: 'Emergency equipment location' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionProgress(prev => Math.min(100, prev + 2));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate Digital Twin data affecting the environment - New useEffect
  useEffect(() => {
    const twinInterval = setInterval(() => {
      const newPressure = 14.7 + Math.random() * 5;
      if (newPressure > 18.0) {
        setShowDataAlert(true);
      }
      setDigitalTwinData(prev => ({ ...prev, pressure: newPressure }));
    }, 3000);
    return () => clearInterval(twinInterval);
  }, []);

  const handleHazardClick = (hazardId) => {
    if (!identifiedHazards.has(hazardId)) {
      setIdentifiedHazards(prev => new Set([...prev, hazardId]));
      
      // Simulate haptic feedback if enabled
      if (preferences?.hapticFeedback && navigator.vibrate) {
        navigator.vibrate(100);
      }
    }
  };

  const handleAreaChange = (areaId) => {
    setCurrentView(areaId);
    setInteractionMode('exploration');
  };

  const handleCompleteSession = () => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const score = (identifiedHazards.size / hazards.length) * 100;
    
    const metrics = {
      scenario_id: scenario.id,
      time_taken_seconds: timeTaken,
      hazards_identified: identifiedHazards.size,
      total_hazards: hazards.length,
      score: Math.round(score),
      errors: hazards.length - identifiedHazards.size,
      completion_rate: sessionProgress,
      interaction_quality: calculateInteractionQuality(),
      safety_awareness_score: calculateSafetyScore()
    };

    onEndSession(metrics);
  };

  const calculateInteractionQuality = () => {
    const timePerHazard = ((Date.now() - startTime) / 1000) / Math.max(1, identifiedHazards.size);
    return Math.max(60, 100 - (timePerHazard * 2)); // Better score for faster identification
  };

  const calculateSafetyScore = () => {
    const criticalHazards = hazards.filter(h => h.severity === 'critical');
    const criticalFound = criticalHazards.filter(h => identifiedHazards.has(h.id)).length;
    return (criticalFound / criticalHazards.length) * 100;
  };

  const getHazardColor = (hazard) => {
    if (identifiedHazards.has(hazard.id)) return 'bg-green-500';
    switch (hazard.severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const allHazardsFound = identifiedHazards.size === hazards.length;
  const currentArea = workshopAreas.find(area => area.id === currentView);

  return (
    <div className="w-full h-[80vh] bg-gray-800 rounded-lg shadow-2xl relative overflow-hidden border-4 border-indigo-500/50">
      {/* VR Simulation Canvas */}
      <div className="relative h-full w-full bg-gradient-to-b from-blue-900/20 to-slate-900">
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)' }}
        />
        
        {/* Simulated 3D Workshop Environment */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl">
            {/* Workshop Layout Visualization */}
            <div className="absolute inset-4 border-2 border-dashed border-blue-400/30 rounded-lg">
              <div className="text-center text-blue-400 text-sm mt-2">
                {currentArea?.name} - {currentArea?.description}
              </div>
              
              {/* Hazard Indicators */}
              <div className="absolute inset-0">
                {hazards.map((hazard, index) => (
                  <motion.div
                    key={hazard.id}
                    className={`absolute w-6 h-6 rounded-full ${getHazardColor(hazard)} cursor-pointer shadow-lg ${
                      !identifiedHazards.has(hazard.id) ? 'animate-pulse' : ''
                    }`}
                    style={{
                      left: `${20 + (index * 15)}%`,
                      top: `${30 + (index % 3) * 20}%`
                    }}
                    onClick={() => handleHazardClick(hazard.id)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {identifiedHazards.has(hazard.id) && (
                      <CheckCircle className="w-4 h-4 text-white absolute -top-1 -right-1" />
                    )}
                    
                    {/* Hazard Info Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity z-10">
                      {hazard.name} - {hazard.location}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Interactive Areas */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                {workshopAreas.map(area => (
                  <Button
                    key={area.id}
                    variant={currentView === area.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAreaChange(area.id)}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {area.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* VRAvatar - New UI Component */}
      <AnimatePresence>
        {isCollaborative && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 right-4 z-20 pointer-events-none">
            <div className="flex -space-x-2">
              <VRAvatar name="Alex" role="Mentor" />
              <VRAvatar name="Beth" role="Trainee" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction Instructions - Retained original positioning */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm p-3 rounded-lg text-white text-sm max-w-xs pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <Orbit className="w-4 h-4 text-blue-400" />
          <span className="font-semibold">VR Instructions</span>
        </div>
        <ul className="space-y-1 text-xs">
          <li>• Click on hazards to identify them</li>
          <li>• Use area buttons to explore different zones</li>
          <li>• Find all hazards to complete the simulation</li>
          <li>• Critical hazards (red) are most important</li>
        </ul>
      </div>

      {/* Current Step Info (originally top-left HUD) - Now at bottom-left */}
      <div className="absolute bottom-4 left-4 p-4 text-white z-20 pointer-events-none">
        <div>
          <h3 className="text-xl font-bold">{scenario.title}</h3>
          <p className="text-blue-200">Identify all {hazards.length} safety hazards in the workshop</p>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Mode: {interactionMode}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span>{Math.round((Date.now() - startTime) / 1000)}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* VR Status Indicators (originally top-right part of HUD) - Now explicitly placed top-left for visibility */}
      <div className="absolute top-4 left-4 p-4 z-20 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg text-white">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${capabilities?.headsetConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>VR Ready</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>{Math.round(sessionProgress)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hazard Summary and List (originally bottom-left controls) - Now explicitly placed top-right for visibility */}
      <div className="absolute top-4 right-4 p-4 mr-[100px] z-20 pointer-events-none"> {/* Added margin to avoid clash with VRAvatar */}
        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {allHazardsFound ? (
                <CheckCircle className="text-green-400 w-5 h-5" />
              ) : (
                <AlertTriangle className="text-yellow-400 w-5 h-5" />
              )}
              <span className="font-bold text-white">
                Hazards Found: {identifiedHazards.size} / {hazards.length}
              </span>
            </div>
            <Progress
              value={(identifiedHazards.size / hazards.length) * 100}
              className="w-32 h-2"
            />
          </div>
          
          {/* Hazard List */}
          <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
            {hazards.map(hazard => (
              <div
                key={hazard.id}
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  identifiedHazards.has(hazard.id) 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {identifiedHazards.has(hazard.id) ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <AlertTriangle className="w-3 h-3" />
                )}
                <span>{hazard.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Digital Twin Alert - New UI Component */}
      <AnimatePresence>
        {showDataAlert && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-1/2 left-1/2 -translate-x-1/2 p-4 bg-red-500/90 rounded-lg text-white font-bold z-50 pointer-events-none"
          >
            ALERT: High Pressure ({digitalTwinData.pressure.toFixed(1)} psi) Detected from Digital Twin!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons (Complete Session Button) - Now at bottom-right */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-4 pointer-events-auto">
        <Button 
          onClick={handleCompleteSession}
          disabled={!allHazardsFound}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete VR Session
        </Button>
      </div>
    </div>
  );
}
