import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Wifi
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

  useEffect(() => {
    loadData();
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
        api_key: fullKey, // In production, this would be hashed
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
    // In a real app, you'd show a toast notification
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent">
              API & Integrations
            </h1>
          </div>
          <p className="text-slate-600 mt-2 text-lg max-w-2xl mx-auto">
            Manage API keys, mobile devices, and hardware integrations for your LearnFlow ecosystem.
          </p>
        </motion.div>

        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile Devices
            </TabsTrigger>
            <TabsTrigger value="hardware" className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Hardware
            </TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">API Keys</h2>
              <Button onClick={() => setShowNewKeyForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </div>

            {/* New API Key Form */}
            {showNewKeyForm && (
              <Card>
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
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availablePermissions.map(permission => (
                        <label key={permission.id} className="flex items-center space-x-2 p-2 border rounded">
                          <input
                            type="checkbox"
                            checked={newKeyData.permissions.includes(permission.id)}
                            onChange={(e) => {
                              const newPermissions = e.target.checked
                                ? [...newKeyData.permissions, permission.id]
                                : newKeyData.permissions.filter(p => p !== permission.id);
                              setNewKeyData({...newKeyData, permissions: newPermissions});
                            }}
                          />
                          <div>
                            <div className="font-medium text-sm">{permission.label}</div>
                            <div className="text-xs text-slate-600">{permission.description}</div>
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
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">Expires At (Optional)</label>
                      <Input
                        type="datetime-local"
                        value={newKeyData.expires_at}
                        onChange={(e) => setNewKeyData({...newKeyData, expires_at: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={createAPIKey}>Create Key</Button>
                    <Button variant="outline" onClick={() => setShowNewKeyForm(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Keys List */}
            <div className="grid gap-4">
              {apiKeys.map(key => (
                <Card key={key.id} className={key.is_active ? '' : 'opacity-50'}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{key.key_name}</h3>
                        <p className="text-sm text-slate-600">Created {new Date(key.created_date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {key.is_active ? 'Active' : 'Revoked'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">API Key</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type={visibleKeys.has(key.id) ? 'text' : 'password'}
                            value={visibleKeys.has(key.id) ? key.api_key : key.key_prefix}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {visibleKeys.has(key.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(key.api_key)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Rate Limit:</span>
                          <div>{key.rate_limit}/hour</div>
                        </div>
                        <div>
                          <span className="font-medium">Usage:</span>
                          <div>{key.usage_count || 0} calls</div>
                        </div>
                        <div>
                          <span className="font-medium">Last Used:</span>
                          <div>{key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}</div>
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span>
                          <div>{key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Never'}</div>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium block mb-2">Permissions:</span>
                        <div className="flex flex-wrap gap-1">
                          {key.permissions?.map(permission => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {availablePermissions.find(p => p.id === permission)?.label || permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {key.is_active && (
                        <div className="flex justify-end">
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
              ))}
            </div>
          </TabsContent>

          {/* Mobile Devices Tab */}
          <TabsContent value="mobile" className="space-y-6">
            <h2 className="text-2xl font-bold">Mobile Device Management</h2>
            
            {/* Mobile App Download Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  LearnFlow Mobile Apps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center p-6 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">iOS App</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Download LearnFlow for iPhone and iPad with offline sync capabilities.
                    </p>
                    <Button className="w-full" disabled>
                      Download from App Store
                      <small className="block text-xs opacity-70">Coming Soon</small>
                    </Button>
                  </div>
                  
                  <div className="text-center p-6 border rounded-lg">
                    <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Android App</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Download LearnFlow for Android devices with AR support.
                    </p>
                    <Button className="w-full" disabled>
                      Download from Play Store
                      <small className="block text-xs opacity-70">Coming Soon</small>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Device Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Mobile Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mobileDevices.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Smartphone className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No mobile sessions recorded yet.</p>
                      <p className="text-sm">Mobile apps will appear here once launched.</p>
                    </div>
                  ) : (
                    mobileDevices.map(device => (
                      <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-slate-500" />
                          <div>
                            <div className="font-medium">{device.device_info?.device_type || 'Unknown Device'}</div>
                            <div className="text-sm text-slate-600">
                              {device.user_id} • {device.session_type}
                            </div>
                          </div>
                        </div>
                        <Badge className={device.sync_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Hardware Device
              </Button>
            </div>

            <div className="grid gap-4">
              {hardwareDevices.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Wifi className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <h3 className="font-semibold mb-2">No Hardware Connected</h3>
                    <p className="text-slate-600 mb-4">
                      Connect IoT sensors, AR/VR devices, and other hardware to enhance your training experience.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="p-4 border rounded-lg text-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-sm font-medium">AR Headsets</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Activity className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-sm font-medium">IoT Sensors</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Shield className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-sm font-medium">Safety Monitors</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Settings className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="text-sm font-medium">Industrial Scanners</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                hardwareDevices.map(device => (
                  <Card key={device.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{device.device_name}</h3>
                          <p className="text-slate-600">{device.device_type} • {device.location}</p>
                        </div>
                        <Badge className={device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {device.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Connection:</span>
                          <div>{device.connection_protocol}</div>
                        </div>
                        <div>
                          <span className="font-medium">Device ID:</span>
                          <div className="font-mono">{device.device_id}</div>
                        </div>
                        <div>
                          <span className="font-medium">Firmware:</span>
                          <div>{device.firmware_version || 'Unknown'}</div>
                        </div>
                        <div>
                          <span className="font-medium">Last Maintenance:</span>
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