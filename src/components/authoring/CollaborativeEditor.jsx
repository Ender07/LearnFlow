import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Edit3, 
  Save,
  Undo
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simulated collaborative editing with presence indicators
export default function CollaborativeEditor({ 
  processId, 
  initialContent, 
  onSave, 
  collaborators = [] 
}) {
  const [content, setContent] = useState(initialContent);
  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [editHistory, setEditHistory] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(0);
  const editorRef = useRef(null);

  // Simulate real-time collaboration
  useEffect(() => {
    const mockCollaborators = [
      { id: '1', name: 'Sarah Chen', avatar: null, cursor_position: 45, color: '#3B82F6' },
      { id: '2', name: 'Mike Rodriguez', avatar: null, cursor_position: 128, color: '#10B981' }
    ];
    setActiveCollaborators(mockCollaborators);

    // Simulate periodic collaborative updates
    const interval = setInterval(() => {
      setActiveCollaborators(prev => 
        prev.map(collab => ({
          ...collab,
          cursor_position: Math.random() * 200
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleContentChange = (newContent) => {
    // Save to edit history
    setEditHistory(prev => [...prev, { content: content, timestamp: new Date() }]);
    setContent(newContent);
    setCurrentVersion(prev => prev + 1);
  };

  const handleUndo = () => {
    if (editHistory.length > 0) {
      const lastEdit = editHistory[editHistory.length - 1];
      setContent(lastEdit.content);
      setEditHistory(prev => prev.slice(0, -1));
      setCurrentVersion(prev => prev - 1);
    }
  };

  const addComment = (commentText) => {
    const newComment = {
      id: Date.now(),
      text: commentText,
      author: 'Current User',
      timestamp: new Date(),
      resolved: false,
      selectedText: selectedText
    };
    setComments(prev => [...prev, newComment]);
    setShowCommentForm(false);
    setSelectedText('');
  };

  const resolveComment = (commentId) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, resolved: true }
          : comment
      )
    );
  };

  return (
    <div className="h-full flex">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 m-0 rounded-none border-0">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                Collaborative Editor
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={editHistory.length === 0}
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSave(content)}
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Badge variant="outline">
                  v{currentVersion}
                </Badge>
              </div>
            </div>
            
            {/* Active Collaborators */}
            {activeCollaborators.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Active:</span>
                {activeCollaborators.map(collab => (
                  <div key={collab.id} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: collab.color }}
                    />
                    <span className="text-xs text-slate-600">{collab.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 p-0">
            <div className="relative h-full">
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onMouseUp={() => {
                  const selection = window.getSelection();
                  if (selection.toString()) {
                    setSelectedText(selection.toString());
                    setShowCommentForm(true);
                  }
                }}
                className="w-full h-full p-6 resize-none border-0 focus:outline-none font-mono text-sm"
                placeholder="Start writing your process content..."
              />
              
              {/* Collaborator Cursors */}
              {activeCollaborators.map(collab => (
                <motion.div
                  key={collab.id}
                  className="absolute pointer-events-none"
                  style={{
                    top: `${Math.min(collab.cursor_position, 300)}px`,
                    left: '20px'
                  }}
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div 
                    className="w-0.5 h-5"
                    style={{ backgroundColor: collab.color }}
                  />
                  <div 
                    className="text-xs px-2 py-1 rounded text-white whitespace-nowrap"
                    style={{ backgroundColor: collab.color }}
                  >
                    {collab.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments Sidebar */}
      <div className="w-80 border-l bg-slate-50">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comments ({comments.length})
          </h3>
        </div>
        
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {comments.map(comment => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-3 rounded-lg border ${
                  comment.resolved 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {comment.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{comment.author}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {comment.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                {comment.selectedText && (
                  <div className="text-xs bg-yellow-100 p-2 rounded mb-2">
                    "{comment.selectedText}"
                  </div>
                )}
                
                <p className="text-sm text-slate-700 mb-2">{comment.text}</p>
                
                {!comment.resolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveComment(comment.id)}
                    className="text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resolve
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Comment Form */}
        {showCommentForm && (
          <div className="p-4 border-t">
            <div className="space-y-2">
              {selectedText && (
                <div className="text-xs bg-yellow-100 p-2 rounded">
                  Selected: "{selectedText}"
                </div>
              )}
              <textarea
                placeholder="Add a comment..."
                className="w-full p-2 text-sm border rounded resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    addComment(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    const textarea = e.target.closest('.space-y-2').querySelector('textarea');
                    addComment(textarea.value);
                    textarea.value = '';
                  }}
                >
                  Comment
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCommentForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}