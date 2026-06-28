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
  Settings, Bell, User, Menu, X, ChevronLeft, ChevronRight,
  GraduationCap, BookMarked, Palette, Zap
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
      { title: 'Process Library', path: '/ProcessLibrary',   icon: BookOpen },
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
      { title: 'Content Mgmt', path: '/Admin',         icon: Settings, adminOnly: true },
      { title: 'Branding',     path: '/BrandSettings', icon: Palette,  adminOnly: true },
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
  const location = useLocation();
  const { currentUser, unreadCount } = useData();
  const { brand } = useBrand();
  const isAdmin     = currentUser?.role === 'admin';
  const companyName = brand?.company_name || 'LearnFlow';
  const logoUrl     = brand?.logo_url;

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 select-none ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', minHeight: 72 }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="logo" className="w-9 h-9 rounded-xl object-contain flex-shrink-0"
               style={{ background: 'rgba(255,255,255,0.08)', padding: 4 }} />
        ) : (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'var(--brand-primary)', boxShadow: '0 4px 12px rgba(79,70,229,0.4)' }}>
            <GraduationCap className="w-[18px] h-[18px] text-white" />
          </div>
        )}
        {!collapsed && (
          <span className="font-bold text-[17px] tracking-tight text-white truncate">{companyName}</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV_GROUPS.map(group => {
          const visible = group.items.filter(i => !i.adminOnly || isAdmin);
          if (!visible.length) return null;
          return (
            <div key={group.label}>
              {!collapsed && (
                <div className="label-xs px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>{group.label}</div>
              )}
              {visible.map(item => {
                const isActive = location.pathname === item.path
                  || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link key={item.path} to={item.path}>
                    <div
                      className={`relative flex items-center gap-3 px-3 py-[9px] rounded-xl mb-0.5 transition-all duration-150 cursor-pointer ${collapsed ? 'justify-center' : ''}`}
                      style={isActive ? {
                        background: 'var(--brand-primary)',
                        boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
                      } : {
                        background: 'transparent',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <item.icon
                        style={{ width: 16, height: 16, flexShrink: 0,
                          color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
                      />
                      {!collapsed && (
                        <span className="text-[13.5px] font-medium flex-1 truncate"
                              style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)' }}>
                          {item.title}
                        </span>
                      )}
                      {item.badge && unreadCount > 0 && (
                        <span className={`text-white text-[10px] font-bold rounded-full flex-shrink-0 ${
                          collapsed ? 'absolute top-1 right-1 w-4 h-4 flex items-center justify-center' : 'px-1.5 py-0.5 min-w-[18px] text-center'
                        }`}
                              style={{ background: '#EF4444' }}>
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
           style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {!collapsed ? (
          <Link to="/Profile">
            <div className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150"
                 style={{ background: 'rgba(255,255,255,0.05)' }}
                 onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                 onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                   style={{ background: 'var(--brand-primary)' }}>
                {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">{currentUser?.full_name || 'User'}</div>
                <div className="text-[11px] capitalize" style={{ color: 'rgba(255,255,255,0.35)' }}>{currentUser?.role || 'user'}</div>
              </div>
            </div>
          </Link>
        ) : (
          <Link to="/Profile">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                 style={{ background: 'var(--brand-primary)' }}>
              {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </Link>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-[80px] w-6 h-6 rounded-full flex items-center justify-center z-50 transition-all duration-150"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          color: '#94A3B8',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.color = 'var(--brand-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#94A3B8'; }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { brand } = useBrand();
  const companyName = brand?.company_name || 'LearnFlow';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--canvas)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar collapsed={false} setCollapsed={() => {}} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      <main className={`flex-1 min-w-0 transition-all duration-300 ${collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}>
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30 bg-white border-b border-slate-100"
             style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <button onClick={() => setMobileOpen(true)} className="text-slate-500">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'var(--brand-primary)' }}>
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>{companyName}</span>
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
              <AppLayout>{children}</AppLayout>
            </GamificationProvider>
          </ToastProvider>
        </EnhancedErrorBoundary>
      </BrandProvider>
    </DataProvider>
  );
}