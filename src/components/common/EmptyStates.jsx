import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Reusable empty state components
export function EmptyProcesses({ onCreateNew }) {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📚</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No Processes Yet</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Get started by creating your first training process to share knowledge with your team.
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="bg-gradient-to-r from-blue-500 to-indigo-500">
            Create Your First Process
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyResults({ title, description, onReset }) {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">{description}</p>
        {onReset && (
          <Button variant="outline" onClick={onReset}>
            Clear Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}