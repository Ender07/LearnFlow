import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, 
  Clock, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Eye,
  Download,
  GitCommit
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock version history
const mockVersions = [
  {
    id: 'v1.3.0',
    timestamp: '2024-01-15T10:30:00Z',
    author: 'Sarah Chen',
    changes: [
      'Added new safety checkpoint in step 3',
      'Updated equipment specifications',
      'Corrected measurement tolerances'
    ],
    type: 'major',
    status: 'current'
  },
  {
    id: 'v1.2.1',
    timestamp: '2024-01-10T14:20:00Z',
    author: 'Mike Rodriguez',
    changes: [
      'Fixed typo in step 5 description',
      'Updated reference image'
    ],
    type: 'patch',
    status: 'archived'
  },
  {
    id: 'v1.2.0',
    timestamp: '2024-01-05T09:15:00Z',
    author: 'Lisa Wang',
    changes: [
      'Restructured quality control section',
      'Added AR guidance markers',
      'Enhanced troubleshooting steps'
    ],
    type: 'minor',
    status: 'archived'
  }
];

export default function AdvancedVersionControl({ processId }) {
  const [selectedVersions, setSelectedVersions] = useState(['v1.3.0', 'v1.2.0']);
  const [showDiff, setShowDiff] = useState(false);

  const getVersionBadgeColor = (type) => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800';
      case 'minor': return 'bg-blue-100 text-blue-800';
      case 'patch': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleVersionSelection = (versionId) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        return [prev[1], versionId];
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Version History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-green-500" />
              Version History
            </CardTitle>
            <div className="flex gap-2">
              {selectedVersions.length === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setShowDiff(!showDiff)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {showDiff ? 'Hide' : 'Show'} Diff
                </Button>
              )}
              <Button variant="outline">
                <Download className="w-4 h-4 mr-1" />
                Export History
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockVersions.map((version, index) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  selectedVersions.includes(version.id)
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => toggleVersionSelection(version.id)}
              >
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full relative">
                    {index < mockVersions.length - 1 && (
                      <div className="absolute top-3 left-1/2 w-0.5 h-16 bg-slate-300 transform -translate-x-1/2" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getVersionBadgeColor(version.type)}>
                      {version.id}
                    </Badge>
                    {version.status === 'current' && (
                      <Badge className="bg-green-500 text-white">
                        Current
                      </Badge>
                    )}
                    <Badge className="capitalize">{version.type} Update</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {version.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(version.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {version.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="flex items-start gap-2 text-sm">
                        <GitCommit className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-3 h-3" />
                  </Button>
                  {version.status !== 'current' && (
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Version Comparison */}
      {showDiff && selectedVersions.length === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-500" />
              Version Comparison: {selectedVersions[0]} vs {selectedVersions[1]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">{selectedVersions[0]} (Newer)</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-green-50 border-l-4 border-green-400">
                    + Added new safety checkpoint in step 3
                  </div>
                  <div className="p-2 bg-green-50 border-l-4 border-green-400">
                    + Updated equipment specifications
                  </div>
                  <div className="p-2 bg-blue-50 border-l-4 border-blue-400">
                    ~ Corrected measurement tolerances
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">{selectedVersions[1]} (Older)</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-red-50 border-l-4 border-red-400">
                    - Missing safety checkpoint
                  </div>
                  <div className="p-2 bg-red-50 border-l-4 border-red-400">
                    - Outdated equipment specs
                  </div>
                  <div className="p-2 bg-blue-50 border-l-4 border-blue-400">
                    ~ Previous measurement tolerances
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline">
          Create New Version
        </Button>
        <Button variant="outline">
          Branch from Version
        </Button>
        <Button variant="outline">
          Merge Versions
        </Button>
      </div>
    </div>
  );
}