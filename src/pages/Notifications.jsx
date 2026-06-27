import React, { useState } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

const TYPE_CONFIG = {
  info:    { icon: Info,          color: '#00D4FF', bg: 'rgba(0,212,255,0.1)',    border: 'rgba(0,212,255,0.22)'    },
  success: { icon: CheckCircle2,  color: '#10B981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.22)'   },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.22)'   },
  danger:  { icon: AlertCircle,   color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.22)'  },
};

const FILTERS = ['all', 'unread', 'info', 'success', 'warning', 'danger'];

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

  const filtered = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) return (
    <div className="min-h-screen p-6 space-y-4" style={{ background: 'hsl(var(--background))' }}>
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.22)' }}>
                <Bell className="w-5 h-5" style={{ color: '#00D4FF' }} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              Notifications
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'; e.currentTarget.style.color = '#00D4FF'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}>
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize"
              style={filter === f
                ? { background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                 style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Bell className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">No notifications</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                  className="flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer"
                  style={{
                    background: !n.is_read ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
                    border: !n.is_read ? `1px solid ${cfg.border}` : '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    borderLeft: !n.is_read ? `3px solid ${cfg.color}` : undefined,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = !n.is_read ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)'}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                       style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: !n.is_read ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: !n.is_read ? 500 : 400 }}>{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{new Date(n.created_date).toLocaleString()}</span>
                      {!n.is_read && <span className="badge-info text-[10px] px-1.5 py-0.5 rounded-full font-semibold">New</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}