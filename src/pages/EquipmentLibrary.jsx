import React, { useState, useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Hammer, Search, MapPin, Tag, AlertTriangle, Wrench } from 'lucide-react';

const STATUS = {
  operational:    { label: 'Operational',    dot: '#10B981', bg: '#D1FAE5', text: '#065F46', border: 'rgba(16,185,129,0.2)' },
  maintenance:    { label: 'Maintenance',    dot: '#F59E0B', bg: '#FEF3C7', text: '#92400E', border: 'rgba(245,158,11,0.2)' },
  repair:         { label: 'Under Repair',   dot: '#FB923C', bg: '#FFF7ED', text: '#9A3412', border: 'rgba(251,146,60,0.2)' },
  out_of_service: { label: 'Out of Service', dot: '#EF4444', bg: '#FEE2E2', text: '#991B1B', border: 'rgba(239,68,68,0.2)' },
};

export default function EquipmentLibrary() {
  const { equipment, isLoading } = useData();
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus]     = useState('all');
  const [selected, setSelected] = useState(null);

  const categories = useMemo(() => ['all', ...new Set(equipment.map(e => e.category).filter(Boolean))], [equipment]);

  const filtered = useMemo(() => equipment.filter(e => {
    const q = search.toLowerCase();
    return (!q || e.name?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q))
      && (category === 'all' || e.category === category)
      && (status === 'all' || e.status === status);
  }), [equipment, search, category, status]);

  if (isLoading) return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto" style={{ background: 'var(--canvas)' }}>
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl bg-slate-100" />)}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--canvas)' }}>
      <div className="max-w-6xl mx-auto space-y-6">

        <div>
          <p className="label-xs mb-1">Content</p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Equipment Library</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{equipment.length} items tracked</p>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(STATUS).map(([key, cfg]) => {
            const count = equipment.filter(e => e.status === key).length;
            const active = status === key;
            return (
              <button key={key} onClick={() => setStatus(active ? 'all' : key)}
                className="p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5"
                style={{
                  background: active ? cfg.bg : '#fff',
                  border: active ? `1.5px solid ${cfg.border}` : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
                }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                  <span className="text-xs font-semibold" style={{ color: cfg.text }}>{cfg.label}</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{count}</div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or location…" className="form-input pl-10" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: 180 }}>
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace('_', ' ')}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50"><Hammer className="w-7 h-7 text-slate-300" /></div>
            <h3 className="font-semibold text-xl" style={{ color: 'var(--text-primary)' }}>No equipment found</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{search || category !== 'all' ? 'Try different filters' : 'Add equipment to get started'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => {
              const cfg = STATUS[item.status] || STATUS.operational;
              return (
                <div key={item.id} onClick={() => setSelected(item)}
                  className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)'}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-36 object-cover bg-slate-100" />
                  ) : (
                    <div className="w-full h-36 flex items-center justify-center bg-slate-50 border-b border-slate-100">
                      <Wrench className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-sm group-hover:text-indigo-600 transition-colors" style={{ color: 'var(--text-primary)' }}>{item.name}</h3>
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                            style={{ background: '#EEF2FF', color: '#3730A3' }}>
                        <Tag className="w-2.5 h-2.5 mr-1" />{item.category?.replace('_', ' ')}
                      </span>
                      {item.location && (
                        <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full"
                              style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }}>
                          <MapPin className="w-2.5 h-2.5 mr-1" />{item.location}
                        </span>
                      )}
                    </div>
                    {(item.model || item.manufacturer) && (
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{[item.manufacturer, item.model].filter(Boolean).join(' · ')}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail modal */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-xl" style={{ background: '#fff', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 16px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.14)' }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl" style={{ color: 'var(--text-primary)' }}>
                <Wrench className="w-5 h-5 text-orange-500" />
                {selected?.name}
              </DialogTitle>
            </DialogHeader>
            {selected && (() => {
              const cfg = STATUS[selected.status] || STATUS.operational;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl"
                       style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                    <span className="text-sm font-semibold" style={{ color: cfg.text }}>{cfg.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Category',     value: selected.category?.replace('_', ' ') },
                      { label: 'Location',     value: selected.location },
                      { label: 'Model',        value: selected.model },
                      { label: 'Manufacturer', value: selected.manufacturer },
                      { label: 'Serial No.',   value: selected.serial_number },
                    ].filter(f => f.value).map(f => (
                      <div key={f.label} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                        <div className="label-xs mb-0.5">{f.label}</div>
                        <div className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{f.value}</div>
                      </div>
                    ))}
                  </div>
                  {selected.safety_protocols?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-sm font-semibold" style={{ color: '#92400E' }}>Safety Protocols</span>
                      </div>
                      <ul className="space-y-1">
                        {selected.safety_protocols.map((p, i) => (
                          <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                            <span className="text-amber-500 mt-0.5">•</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}