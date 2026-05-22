import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  GitBranch, 
  Clock, 
  User, 
  FileText, 
  Plus,
  History
} from "lucide-react";
import { motion } from "framer-motion";

export default function VersionControl({ version, onVersionChange }) {
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [newVersionNotes, setNewVersionNotes] = useState("");

  // Mock version history data
  const versionHistory = [
    {
      version: "1.2",
      date: "2024-01-15",
      author: "John Smith",
      changes: "Updated safety protocols and added new quality checkpoints",
      status: "current"
    },
    {
      version: "1.1",
      date: "2024-01-10",
      author: "Sarah Johnson",
      changes: "Added AR guidance steps and improved tool requirements",
      status: "archived"
    },
    {
      version: "1.0",
      date: "2024-01-05",
      author: "Mike Wilson",
      changes: "Initial process creation with basic steps",
      status: "archived"
    }
  ];

  const createNewVersion = () => {
    const currentVersion = parseFloat(version);
    const newVersion = (currentVersion + 0.1).toFixed(1);
    onVersionChange(newVersion);
    setNewVersionNotes("");
  };

  return (
    <div className="space-y-4">
      {/* Current Version Info */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-green-500" />
            Version Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Current Version</h4>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  v{version}
                </Badge>
                <span className="text-sm text-slate-500">Active</span>
              </div>
            </div>
            <Button
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              variant="outline"
              size="sm"
            >
              <History className="w-4 h-4 mr-2" />
              View History
            </Button>
          </div>

          {/* Create New Version */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-800 mb-3">Create New Version</h4>
            <div className="space-y-3">
              <Textarea
                value={newVersionNotes}
                onChange={(e) => setNewVersionNotes(e.target.value)}
                placeholder="Describe changes in this version..."
                className="border-slate-200 focus:border-green-400 h-20"
              />
              <Button
                onClick={createNewVersion}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                disabled={!newVersionNotes.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Version {(parseFloat(version) + 0.1).toFixed(1)}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      {showVersionHistory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {versionHistory.map((ver, index) => (
                  <motion.div
                    key={ver.version}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-2 ${
                      ver.status === 'current'
                        ? 'border-green-200 bg-green-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={
                          ver.status === 'current'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }>
                          v{ver.version}
                        </Badge>
                        {ver.status === 'current' && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ver.date}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">{ver.author}</span>
                    </div>
                    
                    <p className="text-sm text-slate-600">{ver.changes}</p>
                    
                    {ver.status !== 'current' && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          View Changes
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}