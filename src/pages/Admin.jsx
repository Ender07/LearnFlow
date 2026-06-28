import React, { useState } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Settings, BookOpen, Route, Award, Hammer, Users, Search, ShieldOff } from 'lucide-react';

const TABS = [
  { value: 'processes',      icon: BookOpen, label: 'Processes' },
  { value: 'paths',          icon: Route,    label: 'Learning Paths' },
  { value: 'certifications', icon: Award,    label: 'Certifications' },
  { value: 'equipment',      icon: Hammer,   label: 'Equipment' },
  { value: 'users',          icon: Users,    label: 'Users' },
];

function Pill({ bg, text, children }) {
  return (
    <span className="inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: bg, color: text }}>
      {children}
    </span>
  );
}

export default function Admin() {
  const { currentUser, processes, learningPaths, certifications, equipment, users, isLoading, refetchData } = useData();
  const [search, setSearch]     = useState('');
  const [activeTab, setActiveTab] = useState('processes');
  const [toggling, setToggling]   = useState(null);

  const togglePublished = async (process) => {
    setToggling(process.id);
    try { await base44.entities.Process.update(process.id, { is_published: !process.is_published }); await refetchData(); }
    catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  if (!currentUser || currentUser.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--canvas)' }}>
      <div className="bg-white rounded-2xl p-10 text-center border border-red-100"
           style={{ boxShadow: '0 4px 24px rgba(239,68,68,0.1)' }}>
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-red-50">
          <ShieldOff className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Admin Only</h3>
        <p style={{ color: 'var(--text-muted)' }}>Administrator privileges required.</p>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto" style={{ background: 'var(--canvas)' }}>
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl bg-slate-100" />)}
    </div>
  );

  const q = search.toLowerCase();
  const filteredProcs = processes.filter(p => !q || p.title?.toLowerCase().includes(q));
  const filteredPaths = learningPaths.filter(p => !q || p.title?.toLowerCase().includes(q));
  const filteredCerts = certifications.filter(c => !q || c.title?.toLowerCase().includes(q));
  const filteredEquip = equipment.filter(e => !q || e.name?.toLowerCase().includes(q));
  const filteredUsers = users.filter(u => !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));

  const counts = {
    processes: processes.length, paths: learningPaths.length,
    certifications: certifications.length, equipment: equipment.length, users: users.length,
  };
  const dataMap = { processes: filteredProcs, paths: filteredPaths, certifications: filteredCerts, equipment: filteredEquip, users: filteredUsers };

  const TABLE_COLS = {
    processes: [
      { label: 'Title',      render: (p) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.title}</span> },
      { label: 'Category',   render: (p) => <Pill bg="#F1F5F9" text="#475569">{p.category?.replace('_', ' ') || '—'}</Pill> },
      { label: 'Difficulty', render: (p) => p.difficulty_level ? <Pill bg="#EEF2FF" text="#3730A3">{p.difficulty_level}</Pill> : '—' },
      { label: 'Published',  render: (p) => <Switch checked={!!p.is_published} disabled={toggling === p.id} onCheckedChange={() => togglePublished(p)} className="data-[state=checked]:bg-emerald-500" /> },
    ],
    paths: [
      { label: 'Title',     render: (p) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.title}</span> },
      { label: 'Role',      render: (p) => <Pill bg="#EDE9FE" text="#5B21B6">{p.target_role?.replace('_', ' ') || '—'}</Pill> },
      { label: 'Processes', render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.process_sequence?.length || 0}</span> },
    ],
    certifications: [
      { label: 'Title',   render: (c) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.title}</span> },
      { label: 'Issuer',  render: (c) => <span style={{ color: 'var(--text-muted)' }}>{c.issuing_authority || 'Internal'}</span> },
      { label: 'Validity', render: (c) => <span style={{ color: 'var(--text-muted)' }}>{c.validity_period_months ? `${c.validity_period_months}mo` : 'Perpetual'}</span> },
    ],
    equipment: [
      { label: 'Name',     render: (e) => <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{e.name}</span> },
      { label: 'Category', render: (e) => <Pill bg="#EEF2FF" text="#3730A3">{e.category?.replace('_', ' ') || '—'}</Pill> },
      { label: 'Location', render: (e) => <span style={{ color: 'var(--text-muted)' }}>{e.location || '—'}</span> },
      { label: 'Status',   render: (e) => {
        const s = { operational: { bg: '#D1FAE5', text: '#065F46' }, maintenance: { bg: '#FEF3C7', text: '#92400E' }, repair: { bg: '#FEF3C7', text: '#92400E' }, out_of_service: { bg: '#FEE2E2', text: '#991B1B' } };
        const cfg = s[e.status] || s.operational;
        return <Pill {...cfg}>{e.status?.replace('_', ' ')}</Pill>;
      }},
    ],
    users: [
      { label: 'Name',  render: (u) => <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--brand-primary)' }}>
          {u.full_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.full_name || '—'}</span>
      </div>},
      { label: 'Email',  render: (u) => <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</span> },
      { label: 'Role',   render: (u) => <Pill bg={u.role === 'admin' ? '#EEF2FF' : '#F1F5F9'} text={u.role === 'admin' ? '#3730A3' : '#475569'}>{u.role}</Pill> },
      { label: 'XP',     render: (u) => <span className="font-bold" style={{ color: '#F59E0B' }}>{u.gamification_points || 0}</span> },
    ],
  };

  const cols   = TABLE_COLS[activeTab] || [];
  const items  = dataMap[activeTab] || [];

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--canvas)' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <p className="label-xs mb-1">Admin</p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Content Management</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Manage all platform content</p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search across all content…" className="form-input pl-10" />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-1.5 rounded-2xl bg-slate-100">
          {TABS.map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={activeTab === tab.value
                ? { background: '#fff', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: 'var(--text-muted)' }}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className="ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500">
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden"
             style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}>
          {items.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No items found</div>
          ) : (
            <table className="data-table w-full">
              <thead>
                <tr>{cols.map((c, i) => <th key={i}>{c.label}</th>)}</tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id || i}>
                    {cols.map((col, j) => <td key={j}>{col.render(item)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}