import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Search, Grid, List, BookOpen, Clock, AlertTriangle, CheckCircle2, Play, ChevronRight, Shield, Layers, Zap, Eye, Filter } from 'lucide-react';

const HAZARD_COLOR = {
  low:      { bg: '#D1FAE5', text: '#065F46', border: 'rgba(16,185,129,0.2)' },
  medium:   { bg: '#FEF3C7', text: '#92400E', border: 'rgba(245,158,11,0.2)' },
  high:     { bg: '#FEE2E2', text: '#991B1B', border: 'rgba(239,68,68,0.2)' },
  critical: { bg: '#FEE2E2', text: '#7F1D1D', border: 'rgba(239,68,68,0.35)' },
};
const DIFF_COLOR = {
  beginner:     { bg: '#D1FAE5', text: '#065F46' },
  intermediate: { bg: '#EEF2FF', text: '#3730A3' },
  advanced:     { bg: '#FEF3C7', text: '#92400E' },
  expert:       { bg: '#FEE2E2', text: '#991B1B' },
};
const CONTENT_ICONS = {
  ar_guided: '🥽', vr_simulation: '🎮', interactive: '🖥️',
  video: '🎬', document: '📄', quiz: '❓', checklist: '✅',
};

function Pill({ bg, text, border, children }) {
  return (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
          style={{ background: bg, color: text, border: `1px solid ${border || 'transparent'}` }}>
      {children}
    </span>
  );
}

export default function ProcessLibrary() {
  const { processes, userProgress, isLoading } = useData();
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [sortBy, setSortBy]         = useState('newest');
  const [viewMode, setViewMode]     = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => ['all', ...new Set(processes.map(p => p.category).filter(Boolean))], [processes]);

  const filtered = useMemo(() => {
    let list = processes.filter(p => {
      const q = search.toLowerCase();
      return (!q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
        && (category === 'all' || p.category === category)
        && (difficulty === 'all' || p.difficulty_level === difficulty);
    });
    if (sortBy === 'duration') list = [...list].sort((a, b) => (a.estimated_duration || 0) - (b.estimated_duration || 0));
    else if (sortBy === 'title') list = [...list].sort((a, b) => a.title?.localeCompare(b.title));
    return list;
  }, [processes, search, category, difficulty, sortBy]);

  const getProgress = (id) => userProgress.find(p => p.process_id === id);

  if (isLoading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-4" style={{ background: 'var(--canvas)' }}>
      <Skeleton className="h-10 w-64 rounded-xl bg-slate-100" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl bg-slate-100" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--canvas)' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="label-xs mb-1">Content</p>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Process Library</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{processes.length} processes available</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
              style={showFilters ? { borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' } : {}}>
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="flex p-1 rounded-xl gap-1 border border-slate-200 bg-white">
              {[{ m: 'grid', I: Grid }, { m: 'list', I: List }].map(({ m, I }) => (
                <button key={m} onClick={() => setViewMode(m)}
                  className="p-2 rounded-lg transition-all text-sm"
                  style={viewMode === m
                    ? { background: 'var(--brand-primary)', color: '#fff' }
                    : { color: '#94A3B8' }}>
                  <I className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search + sort */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input placeholder="Search processes…" value={search} onChange={e => setSearch(e.target.value)}
              className="form-input pl-10" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: 160 }}>
            <option value="newest">Newest First</option>
            <option value="title">A–Z</option>
            <option value="duration">By Duration</option>
          </select>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-4"
               style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            {[
              { label: 'Category',   value: category,   set: setCategory,   opts: categories },
              { label: 'Difficulty', value: difficulty, set: setDifficulty, opts: ['all', 'beginner', 'intermediate', 'advanced', 'expert'] },
            ].map(f => (
              <div key={f.label}>
                <div className="label-xs mb-2">{f.label}</div>
                <select value={f.value} onChange={e => f.set(e.target.value)} className="form-input" style={{ padding: '8px 12px' }}>
                  {f.opts.map(o => <option key={o} value={o}>{o === 'all' ? 'All' : o.replace('_', ' ')}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="label-xs">{filtered.length} results</div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100"
               style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No results found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
               style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}>
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Process</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(process => {
                  const prog = getProgress(process.id);
                  const isCompleted  = prog?.status === 'completed';
                  const isInProgress = prog?.status === 'in_progress';
                  const haz = HAZARD_COLOR[process.hazard_level] || HAZARD_COLOR.low;
                  return (
                    <tr key={process.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{CONTENT_ICONS[process.content_type] || '📋'}</span>
                          <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{process.title}</div>
                            <Pill {...haz}>{process.hazard_level || 'low'}</Pill>
                          </div>
                        </div>
                      </td>
                      <td className="capitalize">{process.category?.replace('_', ' ') || '—'}</td>
                      <td>
                        {process.difficulty_level && (
                          <Pill {...(DIFF_COLOR[process.difficulty_level] || DIFF_COLOR.beginner)}>{process.difficulty_level}</Pill>
                        )}
                      </td>
                      <td>{process.estimated_duration || 30}m</td>
                      <td>
                        {isCompleted  && <Pill bg="#D1FAE5" text="#065F46">✓ Completed</Pill>}
                        {isInProgress && <Pill bg="#EEF2FF" text="#3730A3">In Progress</Pill>}
                        {!isCompleted && !isInProgress && <span style={{ color: 'var(--text-muted)' }}>Not started</span>}
                      </td>
                      <td>
                        <Link to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
                          <button className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                            {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'} <ChevronRight className="w-3 h-3" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(process => {
              const prog = getProgress(process.id);
              const isCompleted  = prog?.status === 'completed';
              const isInProgress = prog?.status === 'in_progress';
              const haz  = HAZARD_COLOR[process.hazard_level] || HAZARD_COLOR.low;
              const diff = DIFF_COLOR[process.difficulty_level] || DIFF_COLOR.beginner;
              return (
                <Link key={process.id} to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
                  <div className="bg-white rounded-2xl border border-black/[0.06] h-full flex flex-col overflow-hidden transition-all duration-200 cursor-pointer group hover:-translate-y-0.5"
                       style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}
                       onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)'}
                       onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)'}>
                    {process.hazard_level === 'critical' && (
                      <div className="px-4 py-2 flex items-center gap-2 bg-red-50 border-b border-red-100">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-red-700 text-[11px] font-bold tracking-wide uppercase">Critical Hazard</span>
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{CONTENT_ICONS[process.content_type] || '📋'}</span>
                        <div className="flex items-center gap-1">
                          {isCompleted  && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {isInProgress && <Play className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />}
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {process.title}
                      </h3>
                      <p className="text-xs mb-4 line-clamp-2 flex-1" style={{ color: 'var(--text-muted)' }}>{process.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Pill {...haz}>{process.hazard_level || 'low'}</Pill>
                        <Pill {...diff}>{process.difficulty_level || 'beginner'}</Pill>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {process.estimated_duration || 30}m</span>
                        <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {process.steps?.length || 0} steps</span>
                        {process.requires_supervisor && <span className="flex items-center gap-1 text-amber-600"><Shield className="w-3 h-3" /> Supervised</span>}
                      </div>
                      {isInProgress && (
                        <div className="mb-3">
                          <Progress value={prog?.completion_percentage || 0} className="h-1.5" />
                          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{prog?.completion_percentage || 0}%</div>
                        </div>
                      )}
                      <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                              style={isCompleted
                                ? { background: '#D1FAE5', color: '#065F46' }
                                : isInProgress
                                ? { background: '#EEF2FF', color: '#3730A3' }
                                : { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                        {isCompleted ? <><Eye className="w-3 h-3" />Review</>
                          : isInProgress ? <><Play className="w-3 h-3" />Continue</>
                          : <><Zap className="w-3 h-3" />Start</>}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}