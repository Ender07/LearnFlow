import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { AuditLog } from '@/entities/all';

export default function AuditLogger() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      const auditLogs = await AuditLog.list('-created_date', 50);
      setLogs(auditLogs);
      setIsLoading(false);
    };

    fetchLogs();
  }, []);

  const getRiskBadge = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          System Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading audit logs...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.created_date).toLocaleString()}</TableCell>
                  <TableCell>{log.user_id}</TableCell>
                  <TableCell>{log.action_type.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{log.resource_type.replace(/_/g, ' ')}</TableCell>
                  <TableCell>
                    <Badge className={getRiskBadge(log.risk_level)}>{log.risk_level}</Badge>
                  </TableCell>
                  <TableCell>{log.ip_address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}