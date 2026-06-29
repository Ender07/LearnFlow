import React, { useState, useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Hammer, Search, Filter, MapPin, Tag, AlertTriangle, CheckCircle2, Clock, X, Wrench, Info } from 'lucide-react';

const STATUS_CONFIG = {
  operational: { label: 'Operational', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', dot: 'bg-emerald-400' },
  maintenance: { label: 'In Maintenance', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', dot: 'bg-amber-400' },
  repair: { label: 'Under Repair', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', dot: 'bg-orange-400' },
  out_of_service: { label: 'Out of Service', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30', dot: 'bg-rose-400' },
};

export default function EquipmentLibrary() {
  const { equipment, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);

  const categories = useMemo(() => ['all', ...new Set(equipment.map(e => e.category).filter(Boolean))], [equipment]);

  const filtered = useMemo(() => equipment.filter(e => {
    const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.location?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || e.category === category;
    const matchStatus = status === 'all' || e.status === status;
    return matchSearch && matchCat && matchStatus;
  }), [equipment, search, category, status]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f1729] p-6 space-y-4">
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 bg-slate-700 rounded-xl" />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            Equipment Library
          </h1>
          <p className="text-slate-400 mt-1 text-sm">{equipment.length} items tracked</p>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = equipment.filter(e => e.status === key).length;
            return (
              <button key={key} onClick={() => setStatus(status === key ? 'all' : key)}
                className={`p-3 rounded-xl border text-left transition-all ${status === key ? `${cfg.bg} ${cfg.border}` : 'bg-[#1a2540] border-slate-700/50 hover:border-slate-600'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className="text-2xl font-bold text-white">{count}</div>
              </button>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or location..."
              className="pl-10 bg-[#1a2540] border-slate-600 text-white placeholder:text-slate-500" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48 bg-[#1a2540] border-slate-600 text-slate-300">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2540] border-slate-600 text-white">
              {categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c === 'all' ? 'All Categories' : c.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Equipment Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Hammer className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-semibold">No equipment found</h3>
            <p className="text-slate-400 text-sm mt-1">{search || category !== 'all' ? 'Try different filters' : 'Add equipment to get started'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.operational;
              return (
                <Card key={item.id} className="bg-[#1a2540] border border-slate-700/50 hover:border-slate-600 cursor-pointer transition-all group"
                  onClick={() => setSelected(item)}>
                  <CardContent className="p-5">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-36 object-cover rounded-lg mb-4 bg-slate-800" />
                    ) : (
                      <div className="w-full h-36 bg-slate-800 rounded-lg mb-4 flex items-center justify-center">
                        <Wrench className="w-10 h-10 text-slate-600" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">{item.name}</h3>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs flex-shrink-0 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs capitalize">
                        <Tag className="w-2.5 h-2.5 mr-1" />{item.category?.replace('_', ' ')}
                      </Badge>
                      {item.location && (
                        <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs">
                          <MapPin className="w-2.5 h-2.5 mr-1" />{item.location}
                        </Badge>
                      )}
                    </div>
                    {item.model && <p className="text-slate-500 text-xs">Model: {item.model}</p>}
                    {item.manufacturer && <p className="text-slate-500 text-xs">{item.manufacturer}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="bg-[#1a2540] border border-slate-700 text-white max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-3">
                <Wrench className="w-5 h-5 text-orange-400" />
                {selected?.name}
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className={`flex items-center gap-2 p-3 rounded-lg border ${(STATUS_CONFIG[selected.status] || STATUS_CONFIG.operational).bg} ${(STATUS_CONFIG[selected.status] || STATUS_CONFIG.operational).border}`}>
                  <div className={`w-2 h-2 rounded-full ${(STATUS_CONFIG[selected.status] || STATUS_CONFIG.operational).dot}`} />
                  <span className={`text-sm font-medium ${(STATUS_CONFIG[selected.status] || STATUS_CONFIG.operational).color}`}>
                    {(STATUS_CONFIG[selected.status] || STATUS_CONFIG.operational).label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Category', value: selected.category?.replace('_', ' ') },
                    { label: 'Location', value: selected.location },
                    { label: 'Model', value: selected.model },
                    { label: 'Manufacturer', value: selected.manufacturer },
                    { label: 'Serial Number', value: selected.serial_number },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} className="bg-[#0f1729] rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-0.5">{f.label}</div>
                      <div className="text-white text-sm capitalize">{f.value}</div>
                    </div>
                  ))}
                </div>
                {selected.safety_protocols?.length > 0 && (
                  <div>
                    <h4 className="text-amber-400 font-medium text-sm mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Safety Protocols
                    </h4>
                    <ul className="space-y-1">
                      {selected.safety_protocols.map((p, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}