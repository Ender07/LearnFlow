import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Clock, Settings, FileText, Server } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const IntegrationCard = ({ integration }) => {
  const getStatusInfo = () => {
    switch (integration.connection_status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-4 h-4 text-green-600" /> };
      case 'inactive':
        return { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: <XCircle className="w-4 h-4 text-slate-500" /> };
      case 'error':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertTriangle className="w-4 h-4 text-red-600" /> };
      default:
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock className="w-4 h-4 text-yellow-600" /> };
    }
  };

  const getSyncStatusInfo = () => {
    if (!integration.last_sync_status) return null;
    switch (integration.last_sync_status) {
      case 'success':
        return { color: 'text-green-600', icon: <CheckCircle className="w-3 h-3" /> };
      case 'failed':
        return { color: 'text-red-600', icon: <XCircle className="w-3 h-3" /> };
      default:
        return { color: 'text-blue-600', icon: <Clock className="w-3 h-3 animate-spin" /> };
    }
  };

  const statusInfo = getStatusInfo();
  const syncStatusInfo = getSyncStatusInfo();

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <span className="text-slate-900">{integration.integration_name}</span>
              <Badge variant="outline" className="ml-2 uppercase">{integration.system_type}</Badge>
            </div>
          </CardTitle>
        </div>
        <Badge className={`${statusInfo.color} flex items-center gap-1.5`}>
          {statusInfo.icon}
          <span className="capitalize">{integration.connection_status}</span>
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
            <span>Sync Frequency</span>
            <span className="font-semibold capitalize">{integration.data_sync_frequency.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
            <span>Data Direction</span>
            <span className="font-semibold capitalize">{integration.sync_direction}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
            <span>Last Sync</span>
            {integration.last_sync ? (
              <div className="flex items-center gap-2">
                {syncStatusInfo && <span className={syncStatusInfo.color}>{syncStatusInfo.icon}</span>}
                <span className="font-semibold">{formatDistanceToNow(new Date(integration.last_sync), { addSuffix: true })}</span>
              </div>
            ) : (
              <span className="font-semibold">Never</span>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            View Logs
          </Button>
          <Button size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;