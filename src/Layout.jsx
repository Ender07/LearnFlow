import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { DataProvider } from '@/components/providers/DataProvider';
import { BrandProvider, useBrand } from '@/components/providers/BrandProvider';
import EnhancedErrorBoundary from '@/components/common/EnhancedErrorBoundary';
import { ToastProvider } from '@/components/common/Toast';
import { GamificationProvider } from '@/components/gamification/GamificationEngine';
import {
  LayoutDashboard, BookOpen, Route, Award, Hammer, Users, BarChart3,
  Settings, Bell, User, Menu, X, ChevronLeft, ChevronRight, Zap, BookMarked, Palette
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
      { title: 'Content Mgmt', path: '/Admin',          icon: Settings,  adminOnly: true },
      { title: 'Branding',     path: '/BrandSettings',  icon: Palette,   adminOnly: true },
    ]
  },
  {
    label: 'Account',
    items: [
      { title: 'Notifications', path: '/Notifications', icon: Bell, badge: true },
      { title: 'Profile',       path: '/Profile',       icon: User },
    ]
  },
];

function Sidebar({ collapsed, setCollapsed }) {
  const location  = useLocation();
  const { currentUser, unreadCount } = useData();
  const { brand } = useBrand();
  const isAdmin   = currentUser?.role === 'admin';
  const companyName = brand?.company_name || 'LearnFlow';
  const logoUrl     = brand?.logo_url;

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 select-none ${collapsed ? 'w-[68px]' : 'w-[236px]'}`}
      style={{
        background: 'rgba(6, 8, 18, 0.94)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '4px 0 48px rgba(0,0,0,0.6)',
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
           style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.6) 50%, transparent 100%)' }} />

      {/* Logo / Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}
           style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {logoUrl ? (
          <img src={logoUrl} alt="logo" className="w-9 h-9 rounded-xl object-contain flex-shrink-0"
               style={{ background: 'rgba(255,255,255,0.05)', padding: '4px' }} />
        ) : (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #00D4FF, #0EA5E9, #7C3AED)', boxShadow: '0 0 18px rgba(0,212,255,0.45)' }}>
            <Zap className="w-[18px] h-[18px] text-white" />
          </div>
        )}
        {!collapsed && (
          <span className="font-bold text-[17px] tracking-tight text-gradient truncate">
            {companyName}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV_GROUPS.map(group => {
          const visible = group.items.filter(i => !i.adminOnly || isAdmin);
          if (visible.length === 0) return null;
          return (
            <div key={group.label}>
              {!collapsed && (
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] px-3 mb-2"
                     style={{ color: 'rgba(255,255,255,0.18)' }}>
                  {group.label}
                </div>
              )}
              {visible.map(item => {
                const isActive = location.pathname === item.path
                  || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link key={item.path} to={item.path}>
                    <div
                      className={`relative flex items-center gap-3 px-3 py-[10px] rounded-xl mb-0.5 transition-all duration-150 group cursor-pointer ${collapsed ? 'justify-center' : ''}`}
                      style={isActive ? {
                        background: 'rgba(0,212,255,0.10)',
                        border:     '1px solid rgba(0,212,255,0.22)',
                        boxShadow:  '0 0 16px rgba(0,212,255,0.08)',
                      } : {
                        border: '1px solid transparent',
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}}
                    >
                      {/* Active glow bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                             style={{ background: 'linear-gradient(180deg, #00D4FF, #7C3AED)', boxShadow: '0 0 10px rgba(0,212,255,0.9)' }} />
                      )}

                      <item.icon
                        style={{ width: 16, height: 16, flexShrink: 0, transition: 'color 0.15s',
                          color: isActive ? '#00D4FF' : 'rgba(255,255,255,0.30)' }}
                        className="group-hover:!text-white"
                      />

                      {!collapsed && (
                        <span className="text-[13px] font-medium flex-1 truncate"
                              style={{ color: isActive ? '#e0f7ff' : 'rgba(255,255,255,0.42)',
                                       transition: 'color 0.15s' }}
                              onMouseEnter={e => { if (!isActive) e.target.style.color = '#fff'; }}
                              onMouseLeave={e => { if (!isActive) e.target.style.color = 'rgba(255,255,255,0.42)'; }}>
                          {item.title}
                        </span>
                      )}

                      {item.badge && unreadCount > 0 && (
                        <span className={`text-white text-[10px] font-bold rounded-full flex-shrink-0 ${
                          collapsed ? 'absolute top-1 right-1 w-4 h-4 flex items-center justify-center' : 'px-1.5 py-0.5'
                        }`}
                              style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}>
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
          <Link to="/Profile">
            <div className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150"
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                 onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'; }}
                 onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                   style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
                {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.82)' }}>
                  {currentUser?.full_name || 'User'}
                </div>
                <div className="text-[11px] capitalize" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {currentUser?.role || 'user'}
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <Link to="/Profile">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                 style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
              {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </Link>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-[80px] w-6 h-6 rounded-full flex items-center justify-center z-50 transition-all duration-150"
        style={{
          background: 'rgba(10,14,26,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.35)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'; e.currentTarget.style.color = '#00D4FF'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
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
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar collapsed={false} setCollapsed={() => {}} />
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[236px]'}`}>
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
             style={{ background: 'rgba(6,8,18,0.94)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setMobileSidebarOpen(true)} style={{ color: 'rgba(255,255,255,0.45)' }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #00D4FF, #7C3AED)', boxShadow: '0 0 10px rgba(0,212,255,0.4)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[17px] text-gradient">LearnFlow</span>
          </div>
        </div>
        <div className="fade-in">{children}</div>
      </main>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <DataProvider>
      <BrandProvider>
        <EnhancedErrorBoundary fallbackMessage="Something went wrong. Please refresh.">
          <ToastProvider>
            <GamificationProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </GamificationProvider>
          </ToastProvider>
        </EnhancedErrorBoundary>
      </BrandProvider>
    </DataProvider>
  );
}