import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SafetyOverlay({ warnings, onAcknowledge }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="w-[500px] bg-red-900/50 border-2 border-red-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-red-300">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              Critical Safety Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-red-200">
              Before proceeding, you must read and understand the following safety warnings:
            </p>
            <ul className="space-y-3 mb-6 list-disc list-inside bg-red-800/30 p-4 rounded-lg">
              {warnings.map((warning, index) => (
                <li key={index} className="text-lg">{warning}</li>
              ))}
            </ul>
            <Button
              onClick={onAcknowledge}
              className="w-full bg-red-500 hover:bg-red-600 text-white text-lg font-bold py-6"
            >
              <ShieldCheck className="w-5 h-5 mr-2" />
              I Understand and Acknowledge
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}