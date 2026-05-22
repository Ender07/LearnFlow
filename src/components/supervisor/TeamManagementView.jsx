import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User, Calendar, PlusCircle } from "lucide-react";

export default function TeamManagementView({ members, userProgress, onAssignTraining }) {
  const getUserStats = (email) => {
    if (!userProgress) return { completionRate: 0, overdue: 0 };
    const memberProgress = userProgress.filter(p => p.created_by === email);
    const total = memberProgress.length;
    const completed = memberProgress.filter(p => p.status === 'completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const overdue = memberProgress.filter(p => p.due_date && new Date(p.due_date) < new Date() && p.status !== 'completed').length;
    return { completionRate, overdue };
  };

  if (!members || !Array.isArray(members)) {
    return (
      <div className="text-center text-slate-500 p-8">
        No team members to display.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Completion Rate</TableHead>
            <TableHead>Overdue Tasks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map(member => {
            const stats = getUserStats(member.email);
            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.full_name}</span>
                  </div>
                </TableCell>
                <TableCell>{member.job_title}</TableCell>
                <TableCell>{stats.completionRate}%</TableCell>
                <TableCell>
                  <Badge variant={stats.overdue > 0 ? "destructive" : "default"}>
                    {stats.overdue}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <User className="w-4 h-4 mr-2" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssignTraining(member)}>
                        <PlusCircle className="w-4 h-4 mr-2" /> Assign Training
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="w-4 h-4 mr-2" /> Start Review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}