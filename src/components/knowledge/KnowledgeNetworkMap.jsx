import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Network, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

const NODE_COLORS = {
  tip: '#3b82f6',
  best_practice: '#22c55e',
  troubleshooting: '#f97316',
  safety_note: '#ef4444',
  efficiency_improvement: '#a855f7',
  quality_insight: '#14b8a6',
};

export default function KnowledgeNetworkMap() {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [selected, setSelected] = useState(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [contributions, processes] = await Promise.all([
        base44.entities.KnowledgeContribution.list('-validation_score', 60),
        base44.entities.Process.list(),
      ]);

      // Build process nodes
      const procNodes = processes.slice(0, 15).map((p, i) => ({
        id: `proc_${p.id}`,
        label: p.title?.slice(0, 20) || 'Process',
        type: 'process',
        color: '#1e40af',
        radius: 18,
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50,
        vx: 0, vy: 0,
        data: p,
      }));

      // Build contribution nodes
      const contribNodes = contributions.slice(0, 30).map((c) => ({
        id: `contrib_${c.id}`,
        label: c.title?.slice(0, 18) || 'Insight',
        type: 'contribution',
        color: NODE_COLORS[c.contribution_type] || '#64748b',
        radius: 10 + Math.min((c.validation_score || 0) / 5, 8),
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50,
        vx: 0, vy: 0,
        data: c,
      }));

      const allNodes = [...procNodes, ...contribNodes];

      // Build edges: contrib → process
      const edgeList = [];
      contribNodes.forEach((cn) => {
        const procNode = procNodes.find((pn) => pn.data.id === cn.data.process_id);
        if (procNode) edgeList.push({ source: cn.id, target: procNode.id });
      });

      // Cross-process edges from related_contribution_ids
      contribNodes.forEach((cn) => {
        (cn.data.related_contribution_ids || []).forEach((relId) => {
          const relNode = contribNodes.find((n) => n.data.id === relId);
          if (relNode) edgeList.push({ source: cn.id, target: relNode.id, cross: true });
        });
      });

      setNodes(allNodes);
      setEdges(edgeList);
      nodesRef.current = allNodes;
      setLoading(false);
    };
    load();
  }, []);

  // Force-directed layout simulation
  useEffect(() => {
    if (nodes.length === 0) return;
    const simulate = () => {
      const ns = nodesRef.current.map(n => ({ ...n }));
      const k = 80;

      // Repulsion
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[j].x - ns[i].x;
          const dy = ns[j].y - ns[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (k * k) / dist;
          ns[i].vx -= (dx / dist) * force * 0.01;
          ns[i].vy -= (dy / dist) * force * 0.01;
          ns[j].vx += (dx / dist) * force * 0.01;
          ns[j].vy += (dy / dist) * force * 0.01;
        }
      }

      // Attraction along edges
      edges.forEach(({ source, target }) => {
        const s = ns.find(n => n.id === source);
        const t = ns.find(n => n.id === target);
        if (!s || !t) return;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - k) * 0.005;
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
        t.vx -= (dx / dist) * force;
        t.vy -= (dy / dist) * force;
      });

      // Apply velocity + damping + bounds
      ns.forEach(n => {
        n.vx *= 0.8; n.vy *= 0.8;
        n.x = Math.max(20, Math.min(780, n.x + n.vx));
        n.y = Math.max(20, Math.min(480, n.y + n.vy));
      });

      nodesRef.current = ns;
      setNodes([...ns]);
    };

    let tick = 0;
    const loop = () => {
      if (tick < 120) { simulate(); tick++; }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [edges]);

  // Canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);

    // Draw edges
    edges.forEach(({ source, target, cross }) => {
      const s = nodes.find(n => n.id === source);
      const t = nodes.find(n => n.id === target);
      if (!s || !t) return;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = cross ? 'rgba(168,85,247,0.25)' : 'rgba(100,116,139,0.2)';
      ctx.lineWidth = cross ? 1 : 0.8;
      ctx.setLineDash(cross ? [4, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw nodes
    nodes.forEach(n => {
      const isSelected = selected?.id === n.id;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius + (isSelected ? 3 : 0), 0, Math.PI * 2);
      ctx.fillStyle = n.color + (isSelected ? 'ff' : 'cc');
      ctx.fill();
      if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Label
      ctx.font = `${n.type === 'process' ? 'bold ' : ''}10px sans-serif`;
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, n.x, n.y + n.radius + 12);
    });

    ctx.restore();
  }, [nodes, edges, scale, selected]);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / scale;
    const my = (e.clientY - rect.top) / scale;
    const hit = nodes.find(n => Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2) < n.radius + 6);
    setSelected(hit || null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 bg-slate-800/30 rounded-2xl border border-slate-700">
      <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mr-2" />
      <span className="text-slate-400 text-sm">Building knowledge network…</span>
    </div>
  );

  return (
    <div className="bg-[#1a2540] border border-slate-700 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-400" />
          <span className="text-white font-semibold">Knowledge Network Map</span>
          <span className="text-slate-500 text-xs">({nodes.filter(n => n.type === 'contribution').length} insights · {nodes.filter(n => n.type === 'process').length} processes)</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.4, s - 0.1))} className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-500 text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onClick={handleCanvasClick}
          className="w-full cursor-pointer bg-[#0f1729]"
          style={{ height: '420px' }}
        />

        {/* Selected node tooltip */}
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-semibold text-sm">{selected.data.title || selected.data.name || 'Node'}</span>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
            </div>
            {selected.type === 'contribution' && (
              <div className="space-y-1">
                <div className="text-slate-400 text-xs line-clamp-2">{selected.data.content}</div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 capitalize">{selected.data.contribution_type?.replace(/_/g, ' ')}</span>
                  {selected.data.is_verified && <span className="text-green-400 text-xs">✓ Verified</span>}
                  {selected.data.validation_score > 0 && <span className="text-slate-500 text-xs">👍 {selected.data.validation_score}</span>}
                </div>
              </div>
            )}
            {selected.type === 'process' && (
              <div className="text-slate-400 text-xs">{selected.data.description?.slice(0, 120) || 'Process node'}</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-slate-700 flex flex-wrap gap-4">
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-slate-400 text-xs capitalize">{type.replace(/_/g, ' ')}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-800" />
          <span className="text-slate-400 text-xs">Process</span>
        </div>
      </div>
    </div>
  );
}