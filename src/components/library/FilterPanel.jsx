import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';

const FilterSelect = ({ label, value, onValueChange, options }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={`All ${label}s`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            <span className="capitalize">{option.replace(/_/g, ' ')}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default function FilterPanel({ filters, onFilterChange, options }) {
  const handleFilter = (key, value) => {
    onFilterChange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FilterSelect
              label="Category"
              value={filters.category}
              onValueChange={(value) => handleFilter('category', value)}
              options={options.categories || ['all']}
            />
            <FilterSelect
              label="Difficulty"
              value={filters.difficulty_level}
              onValueChange={(value) => handleFilter('difficulty_level', value)}
              options={options.difficulties || ['all']}
            />
            <FilterSelect
              label="Content Type"
              value={filters.content_type}
              onValueChange={(value) => handleFilter('content_type', value)}
              options={options.contentTypes || ['all']}
            />
            <FilterSelect
              label="Status"
              value={filters.status}
              onValueChange={(value) => handleFilter('status', value)}
              options={['all', 'not_started', 'in_progress', 'completed']}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}