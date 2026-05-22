import React, { useState, useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Cog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import EquipmentCard from '../components/equipment/EquipmentCard';
import EquipmentForm from '../components/equipment/EquipmentForm';

export default function EquipmentManagement() {
  const { equipment, processes, isLoading, addEquipment, updateEquipment } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all', category: 'all' });

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingEquipment(null);
    setShowForm(true);
  };

  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filters.status === 'all' || item.status === filters.status;
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [equipment, searchTerm, filters]);
  
  const categories = useMemo(() => [...new Set(equipment.map(e => e.category))], [equipment]);

  if (isLoading && equipment.length === 0) {
    return (
      <div className="p-6">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-80" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center">
                <Cog className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-gray-700 bg-clip-text text-transparent">
                Equipment Management
              </h1>
            </div>
            <p className="text-slate-600 text-lg max-w-2xl">
              Track, manage, and link all physical assets to training procedures.
            </p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New Equipment
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search by name or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select value={filters.status} onValueChange={(v) => setFilters(f => ({...f, status: v}))}>
              <SelectTrigger className="w-full md:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.category} onValueChange={(v) => setFilters(f => ({...f, category: v}))}>
              <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Equipment Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredEquipment.map((item, index) => (
              <EquipmentCard 
                key={item.id}
                equipment={item}
                processes={processes}
                onEdit={() => handleEdit(item)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredEquipment.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <Cog className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold">No equipment found</h3>
            <p>Try adjusting your search or filters, or add a new piece of equipment.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <EquipmentForm
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            equipment={editingEquipment}
            onSave={editingEquipment ? updateEquipment : addEquipment}
            processes={processes}
          />
        )}
      </AnimatePresence>
    </div>
  );
}