import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ComplianceTracker({ processes, userProgress, users }) {

  const safetyProcesses = useMemo(() => {
    return processes.filter(p => p.category === 'safety' || p.hazard_level === 'high' || p.hazard_level === 'critical');
  }, [processes]);

  const complianceData = useMemo(() => {
    return users.map(user => {
      const compliance = {};
      safetyProcesses.forEach(proc => {
        const progress = userProgress.find(p => p.created_by === user.email && p.process_id === proc.id);
        if (progress?.status === 'completed') {
          compliance[proc.id] = 'completed';
        } else if (progress?.status === 'in_progress') {
          compliance[proc.id] = 'in_progress';
        } else {
          compliance[proc.id] = 'not_started';
        }
      });
      return {
        user,
        compliance,
        completionRate: Math.round(
          (Object.values(compliance).filter(c => c === 'completed').length / safetyProcesses.length) * 100
        )
      };
    });
  }, [users, safetyProcesses, userProgress]);

  const StatusIcon = ({ status }) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />;
    if (status === 'in_progress') return <Clock className="w-5 h-5 text-blue-500 mx-auto" />;
    return <XCircle className="w-5 h-5 text-red-500 mx-auto" />;
  };

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Team Safety Compliance Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white/90">Employee</TableHead>
                {safetyProcesses.map(proc => (
                  <TableHead key={proc.id} className="text-center">{proc.title}</TableHead>
                ))}
                <TableHead className="text-right">Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceData.map(data => (
                <TableRow key={data.user.id}>
                  <TableCell className="font-medium sticky left-0 bg-white/90">{data.user.full_name}</TableCell>
                  {safetyProcesses.map(proc => (
                    <TableCell key={proc.id} className="text-center">
                      <StatusIcon status={data.compliance[proc.id]} />
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-semibold">{data.completionRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}