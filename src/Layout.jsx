import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { DataProvider } from '@/components/providers/DataProvider';
import EnhancedErrorBoundary from '@/components/common/EnhancedErrorBoundary';
import { ToastProvider } from '@/components/common/Toast';
import { GamificationProvider } from '@/components/gamification/GamificationEngine';
import {
  LayoutDashboard, BookOpen, Route, Award, Hammer, Users, BarChart3,
  Settings, Bell, User, Menu, X, ChevronLeft, ChevronRight, Zap,
  BookMarked
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Learning',
    items: [
      { title: 'Dashboard',      path: '/',               icon: LayoutDashboard },
      { title: 'My Learning',    path: '/MyLearning',     icon: BookMarked },
      { title: 'Learning Paths', path: '/LearningPaths',  icon: Route },
      { title: 'Certifications', path: '/Certifications', icon: Award },
    ]
  },
  {
    label: 'Content',
    items: [
      { title: 'Process Library', path: '/ProcessLibrary',  icon: BookOpen },
      { title: 'Equipment',       path: '/EquipmentLibrary', icon: Hammer },
    ]
  },
  {
    label: 'Team',
    items: [
      { title: 'Supervisor',  path: '/SupervisorDashboard', icon: Users },
      { title: 'Analytics',   path: '/Analytics',           icon: BarChart3 },
    ]
  },
  {
    label: 'Admin',
    items: [
      { title: 'Content Mgmt', path: '/Admin', icon: Settings, adminOnly: true },
    ]
  },
  {
    label: 'Account',
    items: [
      { title: 'Notifications', path: '/Notifications', icon: Bell,  badge: true },
      { title: 'Profile',       path: '/Profile',       icon: User  },
    ]
  },
];

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { currentUser, unreadCount } = useData();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[228px]'}`}
      style={{
        background: 'rgba(8, 12, 28, 0.92)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '4px 0 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,140,255,0.5), transparent)' }} />

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-[22px] ${collapsed ? 'justify-center' : ''}`}
           style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #0080ff, #0040cc)', boxShadow: '0 0 16px rgba(0,128,255,0.5)' }}>
          <Zap className="w-[18px] h-[18px] text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight" style={{ background: 'linear-gradient(135deg, #60b4ff, #0080ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LearnFlow
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV_GROUPS.map(group => {
          const visible = group.items.filter(i => !i.adminOnly || isAdmin);
          if (visible.length === 0) return null;
          return (
            <div key={group.label}>
              {!collapsed && (
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] px-3 mb-1.5"
                     style={{ color: 'rgba(255,255,255,0.22)' }}>
                  {group.label}
                </div>
              )}
              {visible.map(item => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link key={item.path} to={item.path}>
                    <div
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 group ${collapsed ? 'justify-center' : ''}`}
                      style={isActive ? {
                        background: 'rgba(0,128,255,0.15)',
                        border: '1px solid rgba(0,128,255,0.3)',
                        boxShadow: '0 0 12px rgba(0,128,255,0.12)',
                      } : {
                        border: '1px solid transparent',
                      }}
                    >
                      {/* Active left indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                             style={{ background: 'linear-gradient(180deg, #60b4ff, #0080ff)', boxShadow: '0 0 8px rgba(0,140,255,0.8)' }} />
                      )}
                      <item.icon
                        style={{ width: 17, height: 17, flexShrink: 0, color: isActive ? '#60b4ff' : 'rgba(255,255,255,0.35)', transition: 'color 0.15s' }}
                        className="group-hover:!text-white"
                      />
                      {!collapsed && (
                        <span className="text-sm font-medium flex-1 truncate transition-colors duration-150"
                              style={{ color: isActive ? '#d6eaff' : 'rgba(255,255,255,0.45)' }}
                              onMouseEnter={e => { if (!isActive) e.target.style.color = '#fff'; }}
                              onMouseLeave={e => { if (!isActive) e.target.style.color = 'rgba(255,255,255,0.45)'; }}>
                          {item.title}
                        </span>
                      )}
                      {item.badge && unreadCount > 0 && (
                        <span className={`text-white text-[10px] font-bold rounded-full flex-shrink-0 ${collapsed ? 'absolute top-1 right-1 w-4 h-4 flex items-center justify-center' : 'px-1.5 py-0.5'}`}
                              style={{ background: 'linear-gradient(135deg, #ff4466, #cc1133)' }}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={`p-3 ${collapsed ? 'flex justify-center' : ''}`}
           style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 cursor-pointer"
               style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                 style={{ background: 'linear-gradient(135deg, #0060cc, #4020aa)' }}>
              {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {currentUser?.full_name || 'User'}
              </div>
              <div className="text-[11px] capitalize" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {currentUser?.role || 'user'}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
               style={{ background: 'linear-gradient(135deg, #0060cc, #4020aa)' }}>
            {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-[84px] w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 z-50"
        style={{
          background: 'rgba(14,22,50,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.4)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(0,128,255,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}

function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(var(--background))' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar collapsed={false} setCollapsed={() => {}} />
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[228px]'}`}>
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
             style={{ background: 'rgba(8,12,28,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setMobileSidebarOpen(true)} style={{ color: 'rgba(255,255,255,0.5)' }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #0080ff, #0040cc)', boxShadow: '0 0 10px rgba(0,128,255,0.4)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #60b4ff, #0080ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              LearnFlow
            </span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <DataProvider>
      <EnhancedErrorBoundary fallbackMessage="Something went wrong. Please refresh.">
        <ToastProvider>
          <GamificationProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </GamificationProvider>
        </ToastProvider>
      </EnhancedErrorBoundary>
    </DataProvider>
  );
}