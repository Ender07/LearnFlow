import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Wifi, 
  Battery, 
  Settings, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Camera,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock AR device data
const mockARDevices = [
  {
    id: 'ar-device-1',
    name: 'HoloLens Station A',
    type: 'microsoft_hololens',
    status: 'online',
    battery_level: 78,
    firmware_version: '2.1.4',
    location: 'Assembly Line 1',
    calibration_status: 'calibrated',
    tracking_quality: 'excellent',
    temperature: 42,
    last_used: '2024-01-15T10:30:00Z',
    active_session: {
      user: 'john.doe@company.com',
      process: 'Engine Assembly Module 3',
      duration: 1240 // seconds
    }
  },
  {
    id: 'ar-device-2',
    name: 'Magic Leap Workstation B',
    type: 'magic_leap',
    status: 'charging',
    battery_level: 45,
    firmware_version: '1.8.2',
    location: 'Quality Control Lab',
    calibration_status: 'needs_calibration',
    tracking_quality: 'good',
    temperature: 38,
    last_used: '2024-01-15T09:15:00Z',
    active_session: null
  }
];

export default function ARDeviceManager() {
  const [devices, setDevices] = useState(mockARDevices);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'charging': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrackingQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'poor': return 'text-yellow-600';
      case 'lost': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getBatteryColor = (level) => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const scanForDevices = async () => {
    setIsScanning(true);
    // Simulate scanning for new devices
    setTimeout(() => {
      setIsScanning(false);
      // In a real implementation, this would discover new AR devices on the network
    }, 3000);
  };

  const calibrateDevice = async (deviceId) => {
    // Simulate calibration process
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, calibration_status: 'calibrating' }
        : device
    ));

    setTimeout(() => {
      setDevices(devices.map(device => 
        device.id === deviceId 
          ? { ...device, calibration_status: 'calibrated' }
          : device
      ));
    }, 5000);
  };

  const remoteControl = (deviceId, action) => {
    console.log(`Remote control: ${action} on device ${deviceId}`);
    // In a real implementation, this would send commands to the AR device
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AR Device Management</h2>
        <Button onClick={scanForDevices} disabled={isScanning}>
          {isScanning ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Wifi className="w-4 h-4 mr-2" />
          )}
          {isScanning ? 'Scanning...' : 'Scan for Devices'}
        </Button>
      </div>

      {/* Device Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {devices.map(device => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                        <Eye className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{device.name}</CardTitle>
                        <p className="text-sm text-slate-600">{device.location}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(device.status)}>
                      {device.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Device Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Battery className={`w-4 h-4 ${getBatteryColor(device.battery_level)}`} />
                      <span>Battery: {device.battery_level}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-slate-500" />
                      <span>Temp: {device.temperature}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Compass className={`w-4 h-4 ${getTrackingQualityColor(device.tracking_quality)}`} />
                      <span>Tracking: {device.tracking_quality}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-slate-500" />
                      <span>FW: {device.firmware_version}</span>
                    </div>
                  </div>

                  {/* Battery Progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Battery Level</span>
                      <span>{device.battery_level}%</span>
                    </div>
                    <Progress 
                      value={device.battery_level} 
                      className={`h-2 ${device.battery_level < 30 ? 'text-red-600' : ''}`}
                    />
                  </div>

                  {/* Active Session */}
                  {device.active_session && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 font-medium text-sm mb-1">
                        <CheckCircle className="w-4 h-4" />
                        Active Training Session
                      </div>
                      <div className="text-xs text-green-700">
                        <div>User: {device.active_session.user.split('@')[0]}</div>
                        <div>Process: {device.active_session.process}</div>
                        <div>Duration: {Math.floor(device.active_session.duration / 60)} minutes</div>
                      </div>
                    </div>
                  )}

                  {/* Calibration Warning */}
                  {device.calibration_status === 'needs_calibration' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 font-medium text-sm mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Calibration Required
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => calibrateDevice(device.id)}
                        className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                      >
                        Start Calibration
                      </Button>
                    </div>
                  )}

                  {/* Device Controls */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDevice(device)}
                      className="flex-1"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                    {device.status === 'online' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => remoteControl(device.id, 'screenshot')}
                      >
                        <Camera className="w-3 h-3 mr-1" />
                        Screenshot
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Device Configuration Modal */}
      {selectedDevice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedDevice(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">{selectedDevice.name} Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Brightness</label>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Field of View</label>
                <select className="w-full p-2 border rounded">
                  <option>Wide (120°)</option>
                  <option>Standard (90°)</option>
                  <option>Narrow (60°)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tracking Mode</label>
                <select className="w-full p-2 border rounded">
                  <option>Inside-Out Tracking</option>
                  <option>Outside-In Tracking</option>
                  <option>Hybrid Tracking</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button onClick={() => setSelectedDevice(null)} className="flex-1">
                Save Settings
              </Button>
              <Button variant="outline" onClick={() => setSelectedDevice(null)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}