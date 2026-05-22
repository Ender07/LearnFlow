import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SecurityEvent } from '@/entities/all';

export default function SecurityMonitor() {
  const [activeEvents, setActiveEvents] = useState([]);
  const [securityStatus, setSecurityStatus] = useState('nominal');

  useEffect(() => {
    // Simulate real-time security event feed
    const fetchEvents = async () => {
      const recentEvents = await SecurityEvent.list('-created_date', 5);
      setActiveEvents(recentEvents);
      updateSecurityStatus(recentEvents);
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const updateSecurityStatus = (events) => {
    if (events.some(e => e.severity === 'critical')) {
      setSecurityStatus('critical');
    } else if (events.some(e => e.severity === 'high')) {
      setSecurityStatus('elevated');
    } else {
      setSecurityStatus('nominal');
    }
  };

  const getStatusColor = () => {
    switch (securityStatus) {
      case 'critical': return 'bg-red-500';
      case 'elevated': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            Security Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">System Status:</span>
            <Badge className={`text-white ${getStatusColor()}`}>{securityStatus.toUpperCase()}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeEvents.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p>No active security events. System is nominal.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-semibold">Active Events</div>
            <AnimatePresence>
              {activeEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className={`border-2 ${
                    event.severity === 'critical' ? 'border-red-300 bg-red-50' :
                    event.severity === 'high' ? 'border-yellow-300 bg-yellow-50' :
                    'border-blue-300 bg-blue-50'
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex justify-between">
                        <div>
                          <div className="font-semibold">{event.event_type.replace(/_/g, ' ')}</div>
                          <div className="text-sm mt-1">IP: {event.ip_address}</div>
                        </div>
                        <Badge className={getSeverityBadge(event.severity)}>{event.severity}</Badge>
                      </div>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2">Investigate</Button>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}