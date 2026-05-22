import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Upload, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, downloading, uploading, synced, error
  const [syncProgress, setSyncProgress] = useState(0);
  const [offlineData, setOfflineData] = useState({
    processes: 0,
    progress: 0,
    lastSync: null,
    storageUsed: '0 MB'
  });
  const [pendingUploads, setPendingUploads] = useState([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate offline data
    setOfflineData({
      processes: 25,
      progress: 12,
      lastSync: new Date().toISOString(),
      storageUsed: '45 MB'
    });

    // Simulate pending uploads
    setPendingUploads([
      { id: 1, type: 'process_completion', name: 'Safety Training Module 1', timestamp: new Date() },
      { id: 2, type: 'quiz_result', name: 'Quality Control Quiz', timestamp: new Date() }
    ]);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const downloadForOffline = async () => {
    setSyncStatus('downloading');
    setSyncProgress(0);

    // Simulate download progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncStatus('synced');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const uploadPendingData = async () => {
    if (!isOnline) return;

    setSyncStatus('uploading');
    setSyncProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncStatus('synced');
          setPendingUploads([]);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  const clearOfflineData = () => {
    setOfflineData({
      processes: 0,
      progress: 0,
      lastSync: null,
      storageUsed: '0 MB'
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              <span className="text-sm text-slate-600">
                {isOnline ? 'Connected to LearnFlow servers' : 'Working in offline mode'}
              </span>
            </div>
            {!isOnline && (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offline Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-500" />
            Offline Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{offlineData.processes}</div>
              <div className="text-sm text-slate-600">Processes</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{offlineData.progress}</div>
              <div className="text-sm text-slate-600">Progress Records</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{offlineData.storageUsed}</div>
              <div className="text-sm text-slate-600">Storage Used</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-sm font-medium text-slate-600">Last Sync</div>
              <div className="text-xs text-slate-500">
                {offlineData.lastSync ? new Date(offlineData.lastSync).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>

          {/* Sync Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={downloadForOffline}
              disabled={!isOnline || syncStatus === 'downloading'}
              className="flex-1"
            >
              {syncStatus === 'downloading' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download for Offline
            </Button>
            <Button 
              variant="outline" 
              onClick={clearOfflineData}
              disabled={offlineData.processes === 0}
            >
              Clear Offline Data
            </Button>
          </div>

          {/* Sync Progress */}
          <AnimatePresence>
            {(syncStatus === 'downloading' || syncStatus === 'uploading') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span>{syncStatus === 'downloading' ? 'Downloading...' : 'Uploading...'}</span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Pending Uploads */}
      {pendingUploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-500" />
              Pending Uploads ({pendingUploads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingUploads.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  {item.type.replace('_', ' ')}
                </Badge>
              </div>
            ))}
            
            <Button 
              onClick={uploadPendingData}
              disabled={!isOnline || syncStatus === 'uploading'}
              className="w-full mt-4"
            >
              {syncStatus === 'uploading' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload All Pending Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sync Success Message */}
      <AnimatePresence>
        {syncStatus === 'synced' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Sync completed successfully!</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}