import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EquipmentCard({ equipment, processes, onEdit, index }) {
  const statusConfig = {
    operational: { color: 'bg-green-100 text-green-800', label: 'Operational' },
    maintenance: { color: 'bg-yellow-100 text-yellow-800', label: 'Maintenance' },
    repair: { color: 'bg-orange-100 text-orange-800', label: 'Repair' },
    out_of_service: { color: 'bg-red-100 text-red-800', label: 'Out of Service' },
  };

  const relatedProcedures = processes.filter(p => p.equipment_needed?.includes(equipment.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold">{equipment.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                <DropdownMenuItem><LinkIcon className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600"><AlertTriangle className="w-4 h-4 mr-2" /> Report Issue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-slate-500">{equipment.model}</p>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="aspect-video bg-slate-100 rounded-lg mb-4 overflow-hidden">
            <img src={equipment.image_url || 'https://via.placeholder.com/400x300.png?text=No+Image'} alt={equipment.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex justify-between items-center mb-2">
            <Badge className={statusConfig[equipment.status]?.color || 'bg-gray-100 text-gray-800'}>
              {statusConfig[equipment.status]?.label || 'Unknown'}
            </Badge>
            <Badge variant="outline">{equipment.category}</Badge>
          </div>
          <div className="text-sm text-slate-600">
            <strong>Location:</strong> {equipment.location}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start">
          <h4 className="font-semibold text-sm mb-2">Related Procedures:</h4>
          {relatedProcedures.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {relatedProcedures.slice(0, 3).map(p => (
                <Badge key={p.id} variant="secondary">{p.title}</Badge>
              ))}
              {relatedProcedures.length > 3 && <Badge variant="secondary">+{relatedProcedures.length - 3} more</Badge>}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No linked procedures.</p>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}