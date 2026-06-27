import React, { useState, useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Hammer, Search, MapPin, Tag, AlertTriangle, Wrench } from 'lucide-react';

const STATUS_CONFIG = {
  operational:    { label: 'Operational',    color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.25)'  },
  maintenance:    { label: 'Maintenance',    color: '#facc15', bg: 'rgba(250,204,21,0.12)',  border: 'rgba(250,204,21,0.25)'  },
  repair:         { label: 'Under Repair',   color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.25)'  },
  out_of_service: { label: 'Out of Service', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
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
    <div className="min-h-screen p-6 space-y-4" style={{ background: 'hsl(var(--background))' }}>
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-6xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.25)' }}>
              <Hammer className="w-5 h-5 text-orange-400" />
            </div>
            Equipment Library
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{equipment.length} items tracked</p>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = equipment.filter(e => e.status === key).length;
            const isActive = status === key;
            return (
              <button key={key} onClick={() => setStatus(isActive ? 'all' : key)}
                className="p-4 rounded-2xl text-left transition-all"
                style={{
                  background: isActive ? cfg.bg : 'rgba(255,255,255,0.04)',
                  border: isActive ? `1px solid ${cfg.border}` : '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(16px)',
                }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}88` }} />
                  <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                </div>
                <div className="text-2xl font-bold text-white">{count}</div>
              </button>
            );
          })}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or location…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'} />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.7)' }}>
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace('_', ' ')}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                 style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Hammer className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
            <h3 className="text-white font-semibold">No equipment found</h3>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {search || category !== 'all' ? 'Try different filters' : 'Add equipment to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.operational;
              return (
                <div key={item.id} onClick={() => setSelected(item)} className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group"
                     style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}
                     onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)'; }}
                     onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-36 object-cover" style={{ background: 'rgba(255,255,255,0.03)' }} />
                  ) : (
                    <div className="w-full h-36 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <Wrench className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.1)' }} />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-white font-semibold text-sm group-hover:text-cyan-300 transition-colors">{item.name}</h3>
                      <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                            style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: `0 0 6px ${cfg.color}22` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="badge-info text-[11px] px-2 py-0.5 rounded-full font-medium capitalize flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />{item.category?.replace('_', ' ')}
                      </span>
                      {item.location && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                          <MapPin className="w-2.5 h-2.5" />{item.location}
                        </span>
                      )}
                    </div>
                    {(item.model || item.manufacturer) && (
                      <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.28)' }}>
                        {[item.manufacturer, item.model].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="border text-white max-w-xl"
                         style={{ background: 'rgba(10,14,26,0.95)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(24px)' }}>
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-3">
                <Wrench className="w-5 h-5 text-orange-400" />
                {selected?.name}
              </DialogTitle>
            </DialogHeader>
            {selected && (() => {
              const cfg = STATUS_CONFIG[selected.status] || STATUS_CONFIG.operational;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl"
                       style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                    <span className="text-sm font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Category',      value: selected.category?.replace('_', ' ') },
                      { label: 'Location',      value: selected.location },
                      { label: 'Model',         value: selected.model },
                      { label: 'Manufacturer',  value: selected.manufacturer },
                      { label: 'Serial Number', value: selected.serial_number },
                    ].filter(f => f.value).map(f => (
                      <div key={f.label} className="rounded-xl p-3"
                           style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.label}</div>
                        <div className="text-white text-sm capitalize">{f.value}</div>
                      </div>
                    ))}
                  </div>
                  {selected.safety_protocols?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1.5" style={{ color: '#facc15' }}>
                        <AlertTriangle className="w-3.5 h-3.5" /> Safety Protocols
                      </h4>
                      <ul className="space-y-1">
                        {selected.safety_protocols.map((p, i) => (
                          <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            <span style={{ color: '#facc15' }} className="mt-0.5">•</span> {p}
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