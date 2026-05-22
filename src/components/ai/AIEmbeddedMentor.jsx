import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Zap, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const mockInterventions = [
  { user: 'Operator 23', text: "Struggling with step 4, 'Torque Application'.", type: 'user' },
  { user: 'AI Mentor', text: "I see you're having trouble. Let's try a different approach. Here is a micro-video showing the correct hand placement. I've also highlighted the torque-to-yield indicator.", type: 'ai' },
  { user: 'Operator 23', text: "Ah, that makes sense. Thank you!", type: 'user' },
  { user: 'AI Mentor', text: "Proactive Tip: The next step involves a critical safety check. Remember to verify the guard is engaged before proceeding.", type: 'ai_proactive' },
];

export default function AIEmbeddedMentor() {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Bot className="w-6 h-6 text-green-500" />
          AI-Embedded Mentor
        </CardTitle>
        <p className="text-sm text-slate-500">
          Simulating a personalized, context-aware AI mentor that assists users during live operations.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-slate-700 mb-3">Current Persona: "Coach"</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Encouraging</Badge>
            <Badge variant="secondary">Direct</Badge>
            <Badge variant="secondary">Safety-Focused</Badge>
            <Badge variant="outline">Adaptability: High</Badge>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-700 mb-3">Live Intervention Log</h4>
          <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-lg border">
            {mockInterventions.map((intervention, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`flex items-start gap-3 ${intervention.type === 'user' ? '' : 'justify-end'}`}
              >
                {intervention.type === 'user' && (
                  <Avatar className="w-8 h-8 border-2 border-white">
                    <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={`p-3 rounded-xl max-w-sm ${
                  intervention.type === 'user' ? 'bg-white shadow-sm' :
                  intervention.type === 'ai_proactive' ? 'bg-yellow-100 border border-yellow-200' :
                  'bg-green-100 border border-green-200'
                }`}>
                  <p className="text-sm text-slate-800">{intervention.text}</p>
                  {intervention.type === 'ai' && <Zap className="w-3 h-3 text-green-600 mt-1" />}
                  {intervention.type === 'ai_proactive' && <Lightbulb className="w-3 h-3 text-yellow-600 mt-1" />}
                </div>
                {intervention.type !== 'user' && (
                  <Avatar className="w-8 h-8 border-2 border-green-200">
                    <AvatarFallback className="bg-green-500 text-white"><Bot className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}