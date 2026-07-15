import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useData } from '@/components/providers/DataProvider';
import { Link } from 'react-router-dom';

const TYPE_ICON = {
  info: { icon: Info, color: 'text-blue-400' },
  success: { icon: CheckCircle, color: 'text-emerald-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
  danger: { icon: AlertCircle, color: 'text-red-400' },
};

export default function NotificationBell() {
  const { notifications, setNotifications, currentUser } = useData();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const myNotifications = notifications
    .filter(n => !n.user_id || n.user_id === currentUser?.id)
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 20);

  const unread = myNotifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (notification) => {
    if (notification.is_read) return;
    await base44.entities.Notification.update(notification.id, { is_read: true });
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unreadItems = myNotifications.filter(n => !n.is_read);
    await Promise.all(unreadItems.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
      >
        <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-[#1a2540] border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <span className="text-white font-semibold text-sm">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors">
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {myNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              myNotifications.map(n => {
                const typeConfig = TYPE_ICON[n.type] || TYPE_ICON.info;
                const Icon = typeConfig.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800/40 transition-colors ${!n.is_read ? 'bg-blue-500/5' : ''}`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${typeConfig.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${n.is_read ? 'text-slate-400' : 'text-white'}`}>{n.message}</p>
                      <p className="text-slate-600 text-xs mt-1">{timeAgo(n.created_date)}</p>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-700">
            <Link to="/Notifications" onClick={() => setOpen(false)} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}