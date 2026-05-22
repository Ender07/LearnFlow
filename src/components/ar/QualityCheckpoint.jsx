import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QualityCheckpoint({ criteria, onPass, onFail }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40"
    >
      <Card className="w-[600px] bg-indigo-900/80 border-2 border-indigo-500 text-white backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-indigo-300">
            <Target className="w-6 h-6" />
            Quality Checkpoint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-indigo-200">Verify the following criteria before continuing:</p>
          <ul className="space-y-2 mb-6 list-disc list-inside bg-indigo-800/30 p-4 rounded-lg">
            {criteria.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <div className="flex gap-4">
            <Button onClick={onPass} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
              <Check className="w-5 h-5 mr-2" /> Pass
            </Button>
            {onFail && (
              <Button onClick={onFail} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                <X className="w-5 h-5 mr-2" /> Fail
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}