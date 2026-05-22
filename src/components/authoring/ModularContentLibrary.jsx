import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Blocks, 
  Search, 
  Plus, 
  Copy, 
  Star, 
  Tag,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock modular content data
const mockModules = [
  {
    id: 'safety-ppe-check',
    title: 'PPE Safety Check',
    description: 'Standard personal protective equipment verification steps',
    category: 'safety',
    usage_count: 45,
    rating: 4.8,
    tags: ['safety', 'ppe', 'verification'],
    content: {
      type: 'checklist',
      items: [
        'Verify hard hat is properly secured',
        'Check safety glasses for cracks or damage',
        'Ensure safety boots are steel-toed and in good condition',
        'Confirm high-visibility vest is clean and visible'
      ]
    }
  },
  {
    id: 'machine-startup-sequence',
    title: 'Machine Startup Sequence',
    description: 'Generic startup procedure for manufacturing equipment',
    category: 'operation',
    usage_count: 32,
    rating: 4.6,
    tags: ['startup', 'machine', 'operation'],
    content: {
      type: 'steps',
      items: [
        'Perform visual inspection of machine',
        'Check fluid levels and pressure gauges',
        'Initialize control systems',
        'Run diagnostic self-test',
        'Verify safety systems are operational'
      ]
    }
  },
  {
    id: 'quality-measurement',
    title: 'Quality Measurement Template',
    description: 'Standard quality control measurement procedures',
    category: 'quality',
    usage_count: 28,
    rating: 4.7,
    tags: ['quality', 'measurement', 'inspection'],
    content: {
      type: 'measurement',
      items: [
        'Calibrate measuring instruments',
        'Record ambient conditions',
        'Take measurements at specified points',
        'Document results in quality log',
        'Compare against specification limits'
      ]
    }
  }
];

export default function ModularContentLibrary({ onSelectModule }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredModules, setFilteredModules] = useState(mockModules);

  useEffect(() => {
    let filtered = mockModules;

    if (searchTerm) {
      filtered = filtered.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(module => module.category === selectedCategory);
    }

    setFilteredModules(filtered);
  }, [searchTerm, selectedCategory]);

  const categories = ['all', ...new Set(mockModules.map(m => m.category))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Blocks className="w-5 h-5 text-purple-500" />
          Modular Content Library
        </CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="capitalize">{module.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        {module.rating}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {module.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {module.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                      <span>Used {module.usage_count} times</span>
                      <span>{module.content.items.length} items</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {/* Preview module */}}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => onSelectModule && onSelectModule(module)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredModules.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Blocks className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No modules found matching your criteria.</p>
          </div>
        )}
        
        <div className="flex justify-center mt-6">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Module
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}