import React, { useState } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Settings, BookOpen, Route, Award, Hammer, Users, Search, XCircle } from 'lucide-react';

function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl overflow-hidden ${className}`}
         style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
      {children}
    </div>
  );
}

function AdminTable({ items, columns, emptyText }) {
  if (items.length === 0) return (
    <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>{emptyText}</div>
  );
  return (
    <GlassCard>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {columns.map(col => (
                <th key={col.key} className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id || i} className="transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {columns.map(col => (
                  <td key={col.key} className="px-5 py-3.5">
                    {col.render
                      ? col.render(item[col.key], item)
                      : <span className="text-white text-sm">{item[col.key] || '—'}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

const TABS = [
  { value: 'processes',      icon: BookOpen, label: 'Processes',      dataKey: 'processes' },
  { value: 'paths',          icon: Route,    label: 'Learning Paths',  dataKey: 'learningPaths' },
  { value: 'certifications', icon: Award,    label: 'Certifications',  dataKey: 'certifications' },
  { value: 'equipment',      icon: Hammer,   label: 'Equipment',       dataKey: 'equipment' },
  { value: 'users',          icon: Users,    label: 'Users',           dataKey: 'users' },
];

export default function Admin() {
  const { currentUser, processes, learningPaths, certifications, equipment, users, isLoading, refetchData } = useData();
  const [search, setSearch]   = useState('');
  const [activeTab, setActiveTab] = useState('processes');
  const [toggling, setToggling] = useState(null);

  if (!currentUser || currentUser.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="text-center rounded-2xl p-10"
           style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.25)' }}>
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
             style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <XCircle className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-white font-bold text-xl mb-2">Admin Only</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>This area requires administrator privileges.</p>
      </div>
    </div>
  );

  const togglePublished = async (process) => {
    setToggling(process.id);
    try { await base44.entities.Process.update(process.id, { is_published: !process.is_published }); await refetchData(); }
    catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  const q = search.toLowerCase();
  const filteredProcs = processes.filter(p => !q || p.title?.toLowerCase().includes(q));
  const filteredPaths = learningPaths.filter(p => !q || p.title?.toLowerCase().includes(q));
  const filteredCerts = certifications.filter(c => !q || c.title?.toLowerCase().includes(q));
  const filteredEquip = equipment.filter(e => !q || e.name?.toLowerCase().includes(q));
  const filteredUsers = users.filter(u => !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));

  const dataMap = { processes: filteredProcs, paths: filteredPaths, certifications: filteredCerts, equipment: filteredEquip, users: filteredUsers };
  const counts  = { processes: processes.length, paths: learningPaths.length, certifications: certifications.length, equipment: equipment.length, users: users.length };

  if (isLoading) return (
    <div className="min-h-screen p-6 space-y-4" style={{ background: 'hsl(var(--background))' }}>
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)' }}>
              <Settings className="w-5 h-5 text-red-400" />
            </div>
            Content Management
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Manage all platform content</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search across all content…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'} />
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={activeTab === tab.value
                ? { background: 'rgba(239,68,68,0.14)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }
                : { color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Processes */}
        {activeTab === 'processes' && (
          <AdminTable items={filteredProcs} emptyText="No processes found" columns={[
            { key: 'title',          label: 'Title' },
            { key: 'category',       label: 'Category',   render: v => <span className="capitalize text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{v?.replace('_', ' ')}</span> },
            { key: 'difficulty_level', label: 'Difficulty', render: v => <span className="badge-info text-[11px] px-2 py-0.5 rounded-full font-medium capitalize">{v}</span> },
            { key: 'is_published',   label: 'Published',  render: (v, item) => (
              <Switch checked={!!v} disabled={toggling === item.id} onCheckedChange={() => togglePublished(item)}
                className="data-[state=checked]:bg-emerald-500" />
            )},
          ]} />
        )}

        {activeTab === 'paths' && (
          <AdminTable items={filteredPaths} emptyText="No learning paths found" columns={[
            { key: 'title',       label: 'Title' },
            { key: 'target_role', label: 'Role',      render: v => <span className="badge-violet text-[11px] px-2 py-0.5 rounded-full font-medium capitalize">{v?.replace('_', ' ')}</span> },
            { key: 'process_sequence', label: 'Processes', render: v => <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{v?.length || 0} processes</span> },
            { key: 'estimated_total_duration', label: 'Duration', render: v => <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{v || 'N/A'} min</span> },
          ]} />
        )}

        {activeTab === 'certifications' && (
          <AdminTable items={filteredCerts} emptyText="No certifications found" columns={[
            { key: 'title',               label: 'Title' },
            { key: 'issuing_authority',   label: 'Issuer',   render: v => <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{v || 'Internal'}</span> },
            { key: 'validity_period_months', label: 'Validity', render: v => <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{v ? `${v} months` : 'Perpetual'}</span> },
          ]} />
        )}

        {activeTab === 'equipment' && (
          <AdminTable items={filteredEquip} emptyText="No equipment found" columns={[
            { key: 'name',     label: 'Name' },
            { key: 'category', label: 'Category', render: v => <span className="badge-info text-[11px] px-2 py-0.5 rounded-full font-medium capitalize">{v?.replace('_', ' ')}</span> },
            { key: 'location', label: 'Location', render: v => <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{v || '—'}</span> },
            { key: 'status',   label: 'Status',   render: v => {
              const s = { operational: 'badge-success', maintenance: 'badge-warning', repair: 'badge-warning', out_of_service: 'badge-danger' };
              return <span className={`${s[v] || ''} text-[11px] px-2 py-0.5 rounded-full font-medium capitalize`}>{v?.replace('_', ' ')}</span>;
            }},
          ]} />
        )}

        {activeTab === 'users' && (
          <AdminTable items={filteredUsers} emptyText="No users found" columns={[
            { key: 'full_name', label: 'Name' },
            { key: 'email',     label: 'Email',  render: v => <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>{v}</span> },
            { key: 'role',      label: 'Role',   render: v => <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${v === 'admin' ? 'badge-violet' : 'badge-info'}`}>{v}</span> },
            { key: 'gamification_points', label: 'XP', render: v => <span className="font-bold text-sm" style={{ color: '#F59E0B' }}>{v || 0}</span> },
          ]} />
        )}
      </div>
    </div>
  );
}