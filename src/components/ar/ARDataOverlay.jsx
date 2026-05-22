import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Zap, BarChart, Rss } from 'lucide-react';

const ARDataOverlay = ({ equipmentId }) => {
  const [liveData, setLiveData] = useState({
    temperature: 75.2,
    power: 1.21,
    pressure: 14.7,
    vibration: 0.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData({
        temperature: 75 + Math.random() * 5,
        power: 1.2 + Math.random() * 0.1,
        pressure: 14.5 + Math.random() * 0.4,
        vibration: 0.4 + Math.random() * 0.2
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [equipmentId]);

  const dataPoints = [
    { icon: Thermometer, label: 'Temp', value: liveData.temperature.toFixed(1), unit: '°F', color: 'text-orange-400' },
    { icon: Zap, label: 'Power', value: liveData.power.toFixed(2), unit: 'kW', color: 'text-yellow-400' },
    { icon: BarChart, label: 'Pressure', value: liveData.pressure.toFixed(1), unit: 'psi', color: 'text-blue-400' },
    { icon: Rss, label: 'Vibration', value: liveData.vibration.toFixed(2), unit: 'g', color: 'text-purple-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-24 right-4 z-30 p-4 bg-black/80 backdrop-blur-md border border-blue-500/30 rounded-lg shadow-2xl space-y-3"
    >
      <h4 className="font-semibold text-white flex items-center gap-2"><Rss className="w-4 h-4 text-blue-400" /> Live Data Stream</h4>
      {dataPoints.map(point => (
        <div key={point.label} className="flex items-center justify-between text-sm">
          <span className={`flex items-center gap-2 ${point.color}`}>
            <point.icon className="w-4 h-4" />
            {point.label}:
          </span>
          <span className="font-mono text-white">{point.value} {point.unit}</span>
        </div>
      ))}
    </motion.div>
  );
};

export default ARDataOverlay;