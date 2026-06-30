import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { WifiOff, Wifi, Download, Trash2, CheckCircle, Clock, RefreshCw, HardDrive, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const STORAGE_KEY = 'learnflow_offline_processes';

function getOfflineData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function saveOfflineData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function bytesToMB(b) { return (b / (1024 * 1024)).toFixed(2); }

export default function OfflineSyncPanel() {
  const [processes, setProcesses] = useState([]);
  const [offlineCache, setOfflineCache] = useState({});
  const [syncing, setSyncing] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageUsed, setStorageUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const procs = await base44.entities.Process.list('-updated_date', 30);
      setProcesses(procs);
      const cached = getOfflineData();
      setOfflineCache(cached);
      // Estimate storage
      const raw = localStorage.getItem(STORAGE_KEY) || '';
      setStorageUsed(new Blob([raw]).size);
      setLoading(false);
    };
    load();
  }, []);

  const downloadProcess = async (proc) => {
    if (!isOnline) return;
    setSyncing(s => ({ ...s, [proc.id]: true }));
    try {
      // Serialize process + steps into localStorage
      const cached = getOfflineData();
      cached[proc.id] = {
        ...proc,
        cachedAt: new Date().toISOString(),
        version: proc.updated_date,
      };
      saveOfflineData(cached);
      setOfflineCache({ ...cached });
      const raw = localStorage.getItem(STORAGE_KEY) || '';
      setStorageUsed(new Blob([raw]).size);
    } finally {
      setSyncing(s => ({ ...s, [proc.id]: false }));
    }
  };

  const removeProcess = (procId) => {
    const cached = getOfflineData();
    delete cached[procId];
    saveOfflineData(cached);
    setOfflineCache({ ...cached });
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    setStorageUsed(new Blob([raw]).size);
  };

  const downloadAll = async () => {
    for (const proc of processes) {
      if (!offlineCache[proc.id]) await downloadProcess(proc);
    }
  };

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setOfflineCache({});
    setStorageUsed(0);
  };

  const cachedCount = Object.keys(offlineCache).length;
  const staleCount = processes.filter(p => {
    const c = offlineCache[p.id];
    return c && c.version !== p.updated_date;
  }).length;

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isOnline ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOnline ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
          {isOnline ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-orange-400" />}
        </div>
        <div>
          <div className={`font-semibold ${isOnline ? 'text-green-400' : 'text-orange-400'}`}>
            {isOnline ? 'Connected — Sync Available' : 'Offline Mode Active'}
          </div>
          <div className="text-slate-400 text-xs">
            {isOnline
              ? `${cachedCount} processes cached · ${staleCount > 0 ? `${staleCount} need updating` : 'all up to date'}`
              : `${cachedCount} processes available offline`}
          </div>
        </div>
        {isOnline && staleCount > 0 && (
          <button onClick={downloadAll} className="ml-auto text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Update All
          </button>
        )}
      </div>

      {/* Storage stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Cached Processes', value: cachedCount, icon: BookOpen, color: 'text-blue-400' },
          { label: 'Storage Used', value: `${bytesToMB(storageUsed)} MB`, icon: HardDrive, color: 'text-purple-400' },
          { label: 'Stale Caches', value: staleCount, icon: Clock, color: staleCount > 0 ? 'text-amber-400' : 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={downloadAll} disabled={!isOnline || loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="w-4 h-4 mr-2" /> Download All Processes
        </Button>
        {cachedCount > 0 && (
          <Button onClick={clearAll} variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-2" /> Clear All Cache
          </Button>
        )}
      </div>

      {/* Process list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-700/30 rounded-xl h-16" />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/30 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <span className="text-white font-semibold">Available Processes</span>
            <span className="text-slate-500 text-xs">{processes.length} total</span>
          </div>
          <div className="divide-y divide-slate-700/40">
            {processes.map(proc => {
              const cached = offlineCache[proc.id];
              const isStale = cached && cached.version !== proc.updated_date;
              const isCached = !!cached && !isStale;
              const isLoading = syncing[proc.id];
              return (
                <div key={proc.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{proc.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-slate-500 text-xs">{proc.steps?.length || 0} steps</span>
                      {isCached && <span className="text-green-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Cached</span>}
                      {isStale && <span className="text-amber-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Stale</span>}
                      {cached?.cachedAt && <span className="text-slate-600 text-xs">{new Date(cached.cachedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCached && (
                      <button onClick={() => removeProcess(proc.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => downloadProcess(proc)}
                      disabled={!isOnline || isLoading || isCached}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        isCached
                          ? 'border-green-500/30 text-green-400 bg-green-500/10 cursor-default'
                          : isLoading
                          ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                          : !isOnline
                          ? 'border-slate-600 text-slate-500 cursor-not-allowed'
                          : 'border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                      }`}
                    >
                      {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : isCached ? <CheckCircle className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                      {isLoading ? 'Syncing' : isCached ? 'Cached' : isStale ? 'Update' : 'Download'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}