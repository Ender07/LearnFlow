import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CommunityPulse({ contributions = [] }) {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-green-500" />
            Community Pulse
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to={createPageUrl('KnowledgeHub')}>
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contributions && contributions.length > 0 ? (
          <ul className="space-y-4">
            {contributions.slice(0, 3).map((item, index) => (
              <motion.li 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="flex items-start gap-3 pb-4 border-b border-slate-200/60 last:border-b-0"
              >
                <Avatar>
                  <AvatarFallback>{item.created_by.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    <span className="font-normal text-slate-600">{item.created_by.split('@')[0]} shared a tip:</span> {item.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    in {item.process_title || "General"}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-slate-500 py-4">
            <p>No recent community activity.</p>
            <p className="text-xs mt-1">Be the first to share knowledge!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}