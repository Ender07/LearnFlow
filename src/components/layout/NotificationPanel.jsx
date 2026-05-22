import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export default function NotificationPanel({ notifications, onMarkAsRead, onClearAll }) {
  const getIconForType = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClearAll}>Clear All</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>You have no new notifications.</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 flex items-start gap-4 transition-colors hover:bg-slate-50 ${
                    !notification.is_read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="mt-1">{getIconForType(notification.type)}</div>
                  <div className="flex-1">
                    <Link to={notification.link_url || '#'}>
                      <p className="text-sm text-slate-800 leading-tight">{notification.message}</p>
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                      </p>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs"
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          <Check className="w-3 h-3 mr-1" /> Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}