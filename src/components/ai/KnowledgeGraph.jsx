import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const mockGraphData = {
  nodes: [
    { id: 'skill_welding', type: 'Skill', name: 'MIG Welding' },
    { id: 'process_123', type: 'Process', name: 'Frame Assembly' },
    { id: 'equip_xyz', type: 'Equipment', name: 'Welding Robot Arm XYZ' },
    { id: 'product_abc', type: 'Product', name: 'Chassis Model A' },
  ],
  relationships: [
    { source: 'process_123', target: 'skill_welding', type: 'Requires' },
    { source: 'process_123', target: 'equip_xyz', type: 'Uses' },
    { source: 'product_abc', target: 'process_123', type: 'Produced By' },
    { source: 'skill_welding', target: 'equip_xyz', type: 'Operates' },
  ]
};

const typeColors = {
  Skill: 'bg-blue-100 text-blue-800',
  Process: 'bg-green-100 text-green-800',
  Equipment: 'bg-orange-100 text-orange-800',
  Product: 'bg-purple-100 text-purple-800',
};

export default function KnowledgeGraph() {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <BrainCircuit className="w-6 h-6 text-indigo-500" />
          Organizational Knowledge Graph (Simplified View)
        </CardTitle>
        <p className="text-sm text-slate-500">
          Visualizing the interconnected relationships between skills, processes, equipment, and products.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Key Entities (Nodes)</h4>
            <div className="flex flex-wrap gap-2">
              {mockGraphData.nodes.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Badge className={`px-3 py-1 text-sm ${typeColors[node.type]}`}>{node.name}</Badge>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-3">Core Relationships</h4>
            <div className="space-y-2">
              {mockGraphData.relationships.map((rel, i) => {
                const sourceNode = mockGraphData.nodes.find(n => n.id === rel.source);
                const targetNode = mockGraphData.nodes.find(n => n.id === rel.target);
                if (!sourceNode || !targetNode) return null;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-md"
                  >
                    <Badge className={typeColors[sourceNode.type]}>{sourceNode.name}</Badge>
                    <div className="flex items-center gap-1 text-slate-500">
                      <ArrowRight className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">{rel.type}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <Badge className={typeColors[targetNode.type]}>{targetNode.name}</Badge>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}