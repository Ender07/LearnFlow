import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const ProcessCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-16 bg-slate-200 rounded"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-20 bg-slate-200 rounded"></div>
          <div className="h-6 w-16 bg-slate-200 rounded"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const EquipmentCardSkeleton = () => (
  <Card className="animate-pulse h-64">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
        <div className="h-6 w-20 bg-slate-200 rounded"></div>
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    </CardContent>
  </Card>
);

export const KnowledgeCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-slate-200 rounded w-2/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-4/5"></div>
            <div className="h-4 bg-slate-200 rounded w-3/5"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-slate-200 rounded"></div>
            <div className="h-6 w-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DashboardStatSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-8 bg-slate-200 rounded w-16"></div>
          <div className="h-3 bg-slate-200 rounded w-20"></div>
        </div>
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
      </div>
    </CardContent>
  </Card>
);

export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className="animate-pulse">
    {Array(columns).fill(0).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
      </td>
    ))}
  </tr>
);