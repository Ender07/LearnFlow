import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function ScenarioSelector({ scenarios, onSelectScenario, isLoading }) {
  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'expert': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const SkeletonCard = () => (
    <div className="animate-pulse bg-slate-800/50 rounded-lg p-4 space-y-3">
      <div className="h-5 bg-slate-700 rounded w-3/4"></div>
      <div className="h-4 bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-700 rounded w-2/3"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-slate-700 rounded w-20"></div>
        <div className="h-9 bg-slate-700 rounded w-24"></div>
      </div>
    </div>
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          Choose a Simulation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : scenarios.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No VR scenarios available.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 flex flex-col justify-between hover:border-purple-500 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">{scenario.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4">{scenario.description}</p>
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className={getDifficultyColor(scenario.difficulty_level)}>
                    {scenario.difficulty_level}
                  </Badge>
                  <Button size="sm" onClick={() => onSelectScenario(scenario)} className="bg-purple-600 hover:bg-purple-700">
                    <Play className="w-4 h-4 mr-1" /> Start
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}