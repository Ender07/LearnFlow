import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Type, 
  Layout, 
  Eye, 
  Save, 
  RotateCcw,
  Download,
  Upload
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from './theme-provider';

const presetThemes = {
  corporate: {
    name: 'Corporate Blue',
    color_scheme: {
      primary: '#1E40AF',
      secondary: '#059669',
      accent: '#DC2626',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B'
    }
  },
  dark: {
    name: 'Dark Mode',
    color_scheme: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9'
    }
  },
  warm: {
    name: 'Warm Tones',
    color_scheme: {
      primary: '#EA580C',
      secondary: '#DC2626',
      accent: '#D97706',
      background: '#FEF7ED',
      surface: '#FFFFFF',
      text: '#1C1917'
    }
  },
  nature: {
    name: 'Nature Green',
    color_scheme: {
      primary: '#059669',
      secondary: '#0D9488',
      accent: '#84CC16',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#14532D'
    }
  }
};

export default function CustomThemeEditor({ isOpen, onClose }) {
  const { theme, updateTheme, resetTheme } = useTheme();
  const [previewTheme, setPreviewTheme] = useState(theme);
  const [activeTab, setActiveTab] = useState('colors');

  const handleColorChange = (colorKey, value) => {
    setPreviewTheme({
      ...previewTheme,
      color_scheme: {
        ...previewTheme.color_scheme,
        [colorKey]: value
      }
    });
  };

  const handleTypographyChange = (key, value) => {
    setPreviewTheme({
      ...previewTheme,
      typography: {
        ...previewTheme.typography,
        [key]: value
      }
    });
  };

  const applyPreset = (preset) => {
    setPreviewTheme({
      ...previewTheme,
      ...preset
    });
  };

  const saveTheme = () => {
    updateTheme(previewTheme);
    onClose?.();
  };

  const exportTheme = () => {
    const themeData = JSON.stringify(previewTheme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learnflow-theme.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTheme = JSON.parse(e.target.result);
          setPreviewTheme(importedTheme);
        } catch (error) {
          console.error('Invalid theme file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex h-full">
          {/* Editor Panel */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Theme Customization</h2>
                    <p className="text-sm text-slate-600">Personalize your LearnFlow experience</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportTheme}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={importTheme}
                    />
                  </label>
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="m-6 mb-0">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="typography">Typography</TabsTrigger>
                  <TabsTrigger value="presets">Presets</TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="colors" className="mt-0 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {Object.entries(previewTheme.color_scheme).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label className="capitalize">{key.replace('_', ' ')}</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={value}
                              onChange={(e) => handleColorChange(key, e.target.value)}
                              className="w-16 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={value}
                              onChange={(e) => handleColorChange(key, e.target.value)}
                              className="font-mono"
                              placeholder="#FFFFFF"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="typography" className="mt-0 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select 
                          value={previewTheme.typography.font_family}
                          onValueChange={(value) => handleTypographyChange('font_family', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Lato">Lato</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Base Font Size</Label>
                        <Select 
                          value={previewTheme.typography.font_size}
                          onValueChange={(value) => handleTypographyChange('font_size', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (14px)</SelectItem>
                            <SelectItem value="medium">Medium (16px)</SelectItem>
                            <SelectItem value="large">Large (18px)</SelectItem>
                            <SelectItem value="xl">Extra Large (20px)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="presets" className="mt-0 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(presetThemes).map(([key, preset]) => (
                        <Card 
                          key={key} 
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => applyPreset(preset)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold">{preset.name}</h3>
                              <div className="flex gap-1">
                                {Object.values(preset.color_scheme).slice(0, 3).map((color, i) => (
                                  <div 
                                    key={i}
                                    className="w-4 h-4 rounded-full border border-white shadow"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-slate-600">
                              Click to apply this preset
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <div className="p-6 border-t bg-slate-50">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setPreviewTheme(theme)}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Changes
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetTheme}>
                    Reset to Default
                  </Button>
                  <Button onClick={saveTheme}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Theme
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="w-80 bg-slate-50 border-l overflow-auto">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Preview Elements */}
              <Card style={{ 
                backgroundColor: previewTheme.color_scheme.surface,
                color: previewTheme.color_scheme.text 
              }}>
                <CardHeader>
                  <CardTitle 
                    style={{ 
                      color: previewTheme.color_scheme.primary,
                      fontFamily: previewTheme.typography.font_family 
                    }}
                  >
                    Sample Card
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ fontFamily: previewTheme.typography.font_family }}>
                    This is how your content will look with the selected theme.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge style={{ backgroundColor: previewTheme.color_scheme.primary }}>
                      Primary
                    </Badge>
                    <Badge style={{ backgroundColor: previewTheme.color_scheme.secondary }}>
                      Secondary
                    </Badge>
                    <Badge style={{ backgroundColor: previewTheme.color_scheme.accent }}>
                      Accent
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="p-3 rounded-lg" style={{ backgroundColor: previewTheme.color_scheme.background }}>
                <p style={{ 
                  color: previewTheme.color_scheme.text,
                  fontFamily: previewTheme.typography.font_family 
                }}>
                  Background color preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}