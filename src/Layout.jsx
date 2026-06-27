import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useData } from '@/components/providers/DataProvider';
import { DataProvider } from '@/components/providers/DataProvider';
import EnhancedErrorBoundary from '@/components/common/EnhancedErrorBoundary';
import { ToastProvider } from '@/components/common/Toast';
import { GamificationProvider } from '@/components/gamification/GamificationEngine';
import {
  LayoutDashboard, BookOpen, Route, Award, Hammer, Users, BarChart3,
  Settings, Bell, User, Menu, X, ChevronLeft, ChevronRight, Zap,
  BookMarked, Target, GraduationCap
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Learning',
    items: [
      { title: 'Dashboard', path: '/', icon: LayoutDashboard },
      { title: 'My Learning', path: '/MyLearning', icon: BookMarked },
      { title: 'Learning Paths', path: '/LearningPaths', icon: Route },
      { title: 'Certifications', path: '/Certifications', icon: Award },
    ]
  },
  {
    label: 'Content',
    items: [
      { title: 'Process Library', path: '/ProcessLibrary', icon: BookOpen },
      { title: 'Equipment', path: '/EquipmentLibrary', icon: Hammer },
    ]
  },
  {
    label: 'Team',
    items: [
      { title: 'Supervisor Dashboard', path: '/SupervisorDashboard', icon: Users, adminOnly: false },
      { title: 'Analytics', path: '/Analytics', icon: BarChart3 },
    ]
  },
  {
    label: 'Admin',
    items: [
      { title: 'Content Management', path: '/Admin', icon: Settings, adminOnly: true },
    ]
  },
  {
    label: 'Account',
    items: [
      { title: 'Notifications', path: '/Notifications', icon: Bell, badge: true },
      { title: 'Profile', path: '/Profile', icon: User },
    ]
  },
];

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { currentUser, unreadCount } = useData();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <aside className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[#0d1526] border-r border-slate-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-blue-400 font-bold text-xl tracking-tight">LearnFlow</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(item => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label}>
              {!collapsed && (
                <div className="text-slate-600 text-xs font-semibold uppercase tracking-widest px-3 mb-1">{group.label}</div>
              )}
              {visibleItems.map(item => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link key={item.path} to={item.path}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}>
                      <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} style={{ width: '18px', height: '18px' }} />
                      {!collapsed && <span className="text-sm font-medium flex-1">{item.title}</span>}
                      {item.badge && unreadCount > 0 && (
                        <span className={`bg-rose-500 text-white text-xs rounded-full font-bold flex-shrink-0 ${collapsed ? 'absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px]' : 'px-1.5 py-0.5'}`}>
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
      <div className={`border-t border-slate-800 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{currentUser?.full_name || 'User'}</div>
              <div className="text-slate-500 text-xs capitalize">{currentUser?.role || 'user'}</div>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-all z-50"
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
    <div className="min-h-screen bg-[#0f1729] flex">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar collapsed={false} setCollapsed={() => {}} />
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'}`}>
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#0d1526] border-b border-slate-800 sticky top-0 z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-blue-400 font-bold text-lg">LearnFlow</span>
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