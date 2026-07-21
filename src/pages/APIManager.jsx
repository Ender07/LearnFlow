import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Settings, 
  Activity,
  Shield,
  Code,
  Smartphone,
  Wifi,
  Download,
  Upload,
  Brain,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { APIKey, MobileSession, HardwareIntegration } from '@/entities/all';

export default function APIManager() {
  const [apiKeys, setApiKeys] = useState([]);
  const [mobileDevices, setMobileDevices] = useState([]);
  const [hardwareDevices, setHardwareDevices] = useState([]);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    key_name: '',
    permissions: [],
    rate_limit: 1000,
    expires_at: ''
  });
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  
  // Custom API key state for Gemini integration
  const [geminiKey, setGeminiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  useEffect(() => {
    loadData();
    const savedKey = localStorage.getItem('lf_gemini_api_key') || '';
    setGeminiKey(savedKey);
  }, []);

  const loadData = async () => {
    try {
      const [keys, mobile, hardware] = await Promise.all([
        APIKey.list(),
        MobileSession.list(),
        HardwareIntegration.list()
      ]);
      setApiKeys(keys);
      setMobileDevices(mobile);
      setHardwareDevices(hardware);
    } catch (error) {
      console.error('Error loading API data:', error);
    }
  };

  const saveGeminiKey = () => {
    localStorage.setItem('lf_gemini_api_key', geminiKey);
    alert('Gemini API Key saved successfully!');
  };

  const clearGeminiKey = () => {
    localStorage.removeItem('lf_gemini_api_key');
    setGeminiKey('');
    alert('Gemini API Key cleared.');
  };

  // Local Storage Database Export/Import
  const exportDatabase = () => {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('lf_')) {
        backup[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importDatabase = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        Object.entries(backup).forEach(([key, value]) => {
          if (key.startsWith('lf_')) {
            localStorage.setItem(key, value);
          }
        });
        alert('Database restored successfully! Reloading page to apply changes.');
        window.location.reload();
      } catch (err) {
        alert('Failed to parse backup file. Please ensure it is a valid LearnFlow backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const generateAPIKey = () => {
    return 'lf_' + Array.from({length: 32}, () => 
      Math.random().toString(36)[2] || '0'
    ).join('');
  };

  const createAPIKey = async () => {
    try {
      const fullKey = generateAPIKey();
      const keyData = {
        ...newKeyData,
        api_key: fullKey,
        key_prefix: fullKey.substring(0, 8) + '...',
        created_date: new Date().toISOString()
      };
      
      const newKey = await APIKey.create(keyData);
      setApiKeys([...apiKeys, newKey]);
      setShowNewKeyForm(false);
      setNewKeyData({
        key_name: '',
        permissions: [],
        rate_limit: 1000,
        expires_at: ''
      });
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const toggleKeyVisibility = (keyId) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const revokeAPIKey = async (keyId) => {
    try {
      await APIKey.update(keyId, { is_active: false });
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, is_active: false } : key
      ));
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const availablePermissions = [
    { id: 'read_processes', label: 'Read Processes', description: 'View process definitions and steps' },
    { id: 'write_processes', label: 'Write Processes', description: 'Create and modify processes' },
    { id: 'read_progress', label: 'Read Progress', description: 'View user training progress' },
    { id: 'write_progress', label: 'Write Progress', description: 'Update user training progress' },
    { id: 'read_users', label: 'Read Users', description: 'View user information' },
    { id: 'write_users', label: 'Write Users', description: 'Create and modify users' },
    { id: 'read_analytics', label: 'Read Analytics', description: 'Access training analytics data' },
    { id: 'admin_access', label: 'Admin Access', description: 'Full system administration' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-300 to-indigo-300 bg-clip-text text-transparent">
              API & Offline Integrations
            </h1>
          </div>
          <p className="text-slate-400 mt-2 text-lg max-w-2xl mx-auto">
            Manage API credentials, configure offline data backups, and configure Google Gemini AI keys.
          </p>
        </motion.div>

        {/* Offline & AI Config Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Settings */}
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Google Gemini API Configuration
              </CardTitle>
              <CardDescription className="text-slate-400">
                Supply your own Gemini API Key to enable real AI generation, compliance reviews, and expert scanning.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Gemini Developer API Key</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="bg-slate-900 border-slate-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button onClick={saveGeminiKey} className="bg-purple-600 hover:bg-purple-700 text-white">
                    Save Key
                  </Button>
                </div>
              </div>
              {geminiKey && (
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-750">
                  <span className="text-xs text-slate-400">Key is active locally</span>
                  <Button onClick={clearGeminiKey} variant="destructive" size="sm" className="flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup Panel */}
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Local Backup & Restore
              </CardTitle>
              <CardDescription className="text-slate-400">
                Export all local databases (processes, training, feedback, progress) as a file or restore from a backup.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button onClick={exportDatabase} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Backup (.json)
              </Button>
              <label className="flex-1">
                <div className="w-full h-10 px-4 rounded-md font-medium text-sm flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white cursor-pointer transition-colors border border-transparent">
                  <Upload className="w-4 h-4" /> Import Backup (.json)
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={importDatabase}
                  className="hidden"
                />
              </label>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
            <TabsTrigger value="api-keys" className="flex items-center gap-2 text-slate-350 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2 text-slate-350 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Smartphone className="w-4 h-4" />
              Mobile Devices
            </TabsTrigger>
            <TabsTrigger value="hardware" className="flex items-center gap-2 text-slate-350 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Wifi className="w-4 h-4" />
              Hardware
            </TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">API Keys</h2>
              <Button onClick={() => setShowNewKeyForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </div>

            {showNewKeyForm && (
              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle>Create New API Key</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Key Name</label>
                    <Input
                      placeholder="e.g., Production Integration"
                      value={newKeyData.key_name}
                      onChange={(e) => setNewKeyData({...newKeyData, key_name: e.target.value})}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availablePermissions.map(permission => (
                        <label key={permission.id} className="flex items-center space-x-2 p-3 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newKeyData.permissions.includes(permission.id)}
                            onChange={(e) => {
                              const newPermissions = e.target.checked
                                ? [...newKeyData.permissions, permission.id]
                                : newKeyData.permissions.filter(p => p !== permission.id);
                              setNewKeyData({...newKeyData, permissions: newPermissions});
                            }}
                            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                          />
                          <div>
                            <div className="font-medium text-sm">{permission.label}</div>
                            <div className="text-xs text-slate-400">{permission.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">Rate Limit (per hour)</label>
                      <Input
                        type="number"
                        value={newKeyData.rate_limit}
                        onChange={(e) => setNewKeyData({...newKeyData, rate_limit: parseInt(e.target.value)})}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">Expires At (Optional)</label>
                      <Input
                        type="datetime-local"
                        value={newKeyData.expires_at}
                        onChange={(e) => setNewKeyData({...newKeyData, expires_at: e.target.value})}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={createAPIKey} className="bg-blue-600 hover:bg-blue-700 text-white">Create Key</Button>
                    <Button variant="outline" onClick={() => setShowNewKeyForm(false)} className="border-slate-700 text-slate-350 hover:bg-slate-700">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-800/40 rounded-xl border border-slate-800">
                  <Key className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                  <p>No integration API keys generated yet.</p>
                </div>
              ) : (
                apiKeys.map(key => (
                  <Card key={key.id} className={`bg-slate-800 border-slate-700 text-white ${key.is_active ? '' : 'opacity-50'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{key.key_name}</h3>
                          <p className="text-sm text-slate-400">Created {new Date(key.created_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={key.is_active ? 'bg-green-900/50 text-green-300 border-green-700/50' : 'bg-red-900/50 text-red-300 border-red-700/50'}>
                            {key.is_active ? 'Active' : 'Revoked'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-slate-450">API Key</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type={visibleKeys.has(key.id) ? 'text' : 'password'}
                              value={visibleKeys.has(key.id) ? key.api_key : key.key_prefix}
                              readOnly
                              className="font-mono text-sm bg-slate-900 border-slate-700 text-white"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleKeyVisibility(key.id)}
                              className="border-slate-700 text-slate-350 hover:bg-slate-700"
                            >
                              {visibleKeys.has(key.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => copyToClipboard(key.api_key)}
                              className="border-slate-700 text-slate-350 hover:bg-slate-700"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-900/50 p-4 rounded-lg border border-slate-750">
                          <div>
                            <span className="font-medium text-slate-400">Rate Limit:</span>
                            <div>{key.rate_limit}/hour</div>
                          </div>
                          <div>
                            <span className="font-medium text-slate-400">Usage:</span>
                            <div>{key.usage_count || 0} calls</div>
                          </div>
                          <div>
                            <span className="font-medium text-slate-400">Last Used:</span>
                            <div>{key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-slate-400">Expires:</span>
                            <div>{key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Never'}</div>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium block mb-2 text-slate-400">Permissions:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {key.permissions?.map(permission => (
                              <Badge key={permission} variant="outline" className="text-xs bg-slate-900 border-slate-750 text-slate-300">
                                {availablePermissions.find(p => p.id === permission)?.label || permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {key.is_active && (
                          <div className="flex justify-end pt-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => revokeAPIKey(key.id)}
                            >
                              Revoke Key
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Mobile Devices Tab */}
          <TabsContent value="mobile" className="space-y-6">
            <h2 className="text-2xl font-bold">Mobile Device Management</h2>
            
            <Card className="bg-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  LearnFlow Mobile Apps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center p-6 border border-slate-700 bg-slate-900/50 rounded-xl">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 text-white">iOS App</h3>
                    <p className="text-sm text-slate-450 mb-4">
                      Download LearnFlow for iPhone and iPad with offline sync capabilities.
                    </p>
                    <Button className="w-full bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed" disabled>
                      Coming Soon
                    </Button>
                  </div>
                  
                  <div className="text-center p-6 border border-slate-700 bg-slate-900/50 rounded-xl">
                    <div className="w-16 h-16 bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="font-semibold mb-2 text-white">Android App</h3>
                    <p className="text-sm text-slate-450 mb-4">
                      Download LearnFlow for Android devices with AR support.
                    </p>
                    <Button className="w-full bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle>Recent Mobile Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mobileDevices.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-900/50 rounded-xl">
                      <Smartphone className="w-12 h-12 mx-auto mb-2 text-slate-700" />
                      <p>No mobile sessions recorded yet.</p>
                    </div>
                  ) : (
                    mobileDevices.map(device => (
                      <div key={device.id} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-slate-400" />
                          <div>
                            <div className="font-medium text-white">{device.device_info?.device_type || 'Unknown Device'}</div>
                            <div className="text-sm text-slate-400">
                              {device.user_id} • {device.session_type}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-900/50 text-green-300 border-green-700/50">
                          {device.sync_status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hardware Integration Tab */}
          <TabsContent value="hardware" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Hardware Integrations</h2>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Hardware Device
              </Button>
            </div>

            <div className="grid gap-4">
              {hardwareDevices.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardContent className="p-8 text-center bg-slate-900/20">
                    <Wifi className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <h3 className="font-semibold mb-2">No Hardware Connected</h3>
                    <p className="text-slate-400 mb-4 max-w-md mx-auto">
                      Connect IoT sensors, AR/VR devices, and safety hardware to sync with execution parameters.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="p-4 bg-slate-900/50 border border-slate-750 rounded-xl text-center">
                        <div className="w-8 h-8 bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Eye className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-sm font-medium">AR Headsets</div>
                      </div>
                      <div className="p-4 bg-slate-900/50 border border-slate-750 rounded-xl text-center">
                        <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Activity className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-sm font-medium">IoT Sensors</div>
                      </div>
                      <div className="p-4 bg-slate-900/50 border border-slate-750 rounded-xl text-center">
                        <div className="w-8 h-8 bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Shield className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="text-sm font-medium">Safety Monitors</div>
                      </div>
                      <div className="p-4 bg-slate-900/50 border border-slate-750 rounded-xl text-center">
                        <div className="w-8 h-8 bg-orange-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Settings className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="text-sm font-medium">Industrial Scanners</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                hardwareDevices.map(device => (
                  <Card key={device.id} className="bg-slate-800 border-slate-700 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{device.device_name}</h3>
                          <p className="text-slate-400">{device.device_type} • {device.location}</p>
                        </div>
                        <Badge className="bg-green-900/50 text-green-300 border-green-700/50">
                          {device.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-900/50 p-4 rounded-lg border border-slate-750">
                        <div>
                          <span className="font-medium text-slate-400">Connection:</span>
                          <div>{device.connection_protocol}</div>
                        </div>
                        <div>
                          <span className="font-medium text-slate-400">Device ID:</span>
                          <div className="font-mono">{device.device_id}</div>
                        </div>
                        <div>
                          <span className="font-medium text-slate-400">Firmware:</span>
                          <div>{device.firmware_version || 'Unknown'}</div>
                        </div>
                        <div>
                          <span className="font-medium text-slate-400">Last Maintenance:</span>
                          <div>{device.last_maintenance ? new Date(device.last_maintenance).toLocaleDateString() : 'Never'}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}