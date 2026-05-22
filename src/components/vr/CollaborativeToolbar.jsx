import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, MessageSquare, Hand, Share2 } from 'lucide-react';

const CollaborativeToolbar = ({ session }) => {
  const [isMuted, setIsMuted] = useState(false);
  
  return (
    <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-2 bg-black/80 backdrop-blur-md border-purple-500/30">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-green-400" />}
        </Button>
        <Button variant="ghost" size="icon">
          <MessageSquare className="w-5 h-5 text-blue-400" />
        </Button>
        <Button variant="ghost" size="icon">
          <Hand className="w-5 h-5 text-yellow-400" />
        </Button>
        <Button variant="ghost" size="icon">
          <Share2 className="w-5 h-5 text-white" />
        </Button>
      </div>
    </Card>
  );
};

export default CollaborativeToolbar;