import React, { useState } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

const TYPE = {
  info:    { icon: Info,          bg: '#EEF2FF', text: '#3730A3', border: 'rgba(79,70,229,0.15)',  dot: '#4F46E5' },
  success: { icon: CheckCircle2,  bg: '#D1FAE5', text: '#065F46', border: 'rgba(16,185,129,0.15)', dot: '#10B981' },
  warning: { icon: AlertTriangle, bg: '#FEF3C7', text: '#92400E', border: 'rgba(245,158,11,0.15)', dot: '#F59E0B' },
  danger:  { icon: AlertCircle,   bg: '#FEE2E2', text: '#991B1B', border: 'rgba(239,68,68,0.15)',  dot: '#EF4444' },
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
    <div className="p-6 space-y-3 max-w-3xl mx-auto" style={{ background: 'var(--canvas)' }}>
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl bg-slate-100" />)}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--canvas)' }}>
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-start justify-between">
          <div>
            <p className="label-xs mb-1">Account</p>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              Notifications
              {unreadCount > 0 && (
                <span className="text-white text-sm font-bold px-2 py-0.5 rounded-full" style={{ background: '#EF4444' }}>{unreadCount}</span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
              style={filter === f
                ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }
                : { background: '#fff', border: '1.5px solid #E2E8F0', color: 'var(--text-secondary)' }}>
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50">
              <Bell className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>All caught up!</h3>
            <p style={{ color: 'var(--text-muted)' }}>No notifications to show</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const cfg = TYPE[n.type] || TYPE.info;
              const Icon = cfg.icon;
              return (
                <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                  className="flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5"
                  style={{
                    background: !n.is_read ? cfg.bg : '#fff',
                    border: !n.is_read ? `1px solid ${cfg.border}` : '1px solid #F1F5F9',
                    borderLeft: !n.is_read ? `3px solid ${cfg.dot}` : undefined,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <Icon className="w-4 h-4" style={{ color: cfg.dot }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: !n.is_read ? '#0F172A' : '#64748B', fontWeight: !n.is_read ? 500 : 400 }}>{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(n.created_date).toLocaleString()}</span>
                      {!n.is_read && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>New</span>
                      )}
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