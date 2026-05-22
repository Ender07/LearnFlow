import React, { useState, useMemo } from "react";
import { useData } from "@/components/providers/DataProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Search, 
  List, 
  Grid,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import ProcessCard from "../components/library/ProcessCard";
import FilterPanel from "../components/library/FilterPanel";

export default function ProcessLibrary() {
  const { processes, userProgress, isLoading } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    difficulty_level: "all",
    content_type: "all",
    status: "all"
  });

  const uniqueFilterOptions = useMemo(() => {
    if (!processes) return { categories: [], difficulties: [], contentTypes: [] };
    const categories = new Set(processes.map(p => p.category).filter(Boolean));
    const difficulties = new Set(processes.map(p => p.difficulty_level).filter(Boolean));
    const contentTypes = new Set(processes.map(p => p.content_type).filter(Boolean));
    return {
      categories: ['all', ...Array.from(categories)],
      difficulties: ['all', ...Array.from(difficulties)],
      contentTypes: ['all', ...Array.from(contentTypes)]
    };
  }, [processes]);
  
  const filteredProcesses = useMemo(() => {
    if (!processes) return [];
    
    return processes.filter(process => {
      const progress = userProgress?.find(p => p.process_id === process.id);
      
      const matchesSearch = (process.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (process.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || process.category === filters.category;
      const matchesDifficulty = filters.difficulty_level === 'all' || process.difficulty_level === filters.difficulty_level;
      const matchesContentType = filters.content_type === 'all' || process.content_type === filters.content_type;
      
      const matchesStatus = filters.status === 'all' ||
        (filters.status === 'completed' && progress?.status === 'completed') ||
        (filters.status === 'in_progress' && progress?.status === 'in_progress') ||
        (filters.status === 'not_started' && !progress);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesContentType && matchesStatus;
    });
  }, [processes, searchTerm, filters, userProgress]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Skeleton className="h-24 w-full mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-80" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
              Process Library
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl">
            Browse, search, and start training on all available manufacturing processes.
          </p>
        </motion.div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-400 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-12 ${showFilters ? "bg-indigo-50 border-indigo-200" : ""}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="bg-white p-1 rounded-lg shadow-sm border">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <FilterPanel 
                filters={filters}
                onFilterChange={setFilters}
                options={uniqueFilterOptions}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {filteredProcesses.length > 0 ? (
              <div className={`gap-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}`}>
                {filteredProcesses.map((process, index) => (
                  <ProcessCard
                    key={process.id}
                    process={process}
                    userProgress={userProgress?.find(p => p.process_id === process.id)}
                    viewMode={viewMode}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700">No Processes Found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}