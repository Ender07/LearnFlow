import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Image, Video } from 'lucide-react';

export default function MediaManager({ mediaUrls = [], onUpdate }) {
  const [newUrl, setNewUrl] = useState('');

  const addUrl = () => {
    if (newUrl && !mediaUrls.includes(newUrl)) {
      onUpdate([...mediaUrls, newUrl]);
      setNewUrl('');
    }
  };

  const removeUrl = (urlToRemove) => {
    onUpdate(mediaUrls.filter(url => url !== urlToRemove));
  };

  const isImageUrl = (url) => /\.(jpeg|jpg|gif|png)$/i.test(url);
  const isVideoUrl = (url) => /\.(mp4|webm|ogg)$/i.test(url);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="https://... Add image or video URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addUrl()}
        />
        <Button onClick={addUrl}><Plus className="w-4 h-4" /></Button>
      </div>
      
      <div className="space-y-2">
        {mediaUrls.map((url, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-200 rounded flex items-center justify-center">
              {isImageUrl(url) ? <Image className="w-5 h-5 text-slate-500" /> : isVideoUrl(url) ? <Video className="w-5 h-5 text-slate-500" /> : <div/>}
            </div>
            <p className="flex-1 text-sm text-slate-700 truncate">{url}</p>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => removeUrl(url)}>
              <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-500" />
            </Button>
          </div>
        ))}
        {mediaUrls.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-4">No media added yet.</p>
        )}
      </div>
    </div>
  );
}