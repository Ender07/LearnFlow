import React, { useState } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, AlertCircle, Filter } from 'lucide-react';

const TYPE_CONFIG = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  danger: { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
};

export default function Notifications() {
  const { notifications, setNotifications, isLoading } = useData();
  const [filter, setFilter] = useState('all');

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f1729] p-6 space-y-4">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 bg-slate-700 rounded-xl" />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center relative">
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              Notifications
            </h1>
            <p className="text-slate-400 text-sm mt-1">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllRead} variant="outline" size="sm"
              className="border-slate-600 text-slate-300 hover:text-white">
              <CheckCheck className="w-4 h-4 mr-2" /> Mark All Read
            </Button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'unread', 'info', 'success', 'warning', 'danger'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${
                filter === f ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#1a2540] text-slate-400 border-slate-600 hover:border-blue-500 hover:text-blue-400'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Notification list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-lg mb-1">No notifications</h3>
            <p className="text-slate-400 text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <Card key={n.id}
                  className={`bg-[#1a2540] border transition-all cursor-pointer ${!n.is_read ? `border-l-4 ${cfg.border} border-slate-700/50` : 'border-slate-700/30'}`}
                  onClick={() => !n.is_read && markRead(n.id)}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`w-9 h-9 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.is_read ? 'text-white font-medium' : 'text-slate-300'}`}>{n.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-500 text-xs">{new Date(n.created_date).toLocaleString()}</span>
                        {!n.is_read && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">New</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}