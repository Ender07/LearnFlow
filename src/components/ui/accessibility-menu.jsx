import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  Type, 
  Pause,
  Keyboard,
  Volume2,
  Contrast,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './theme-provider';

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, updateTheme } = useTheme();

  const handleAccessibilityChange = (key, value) => {
    updateTheme({
      accessibility: {
        ...theme.accessibility,
        [key]: value
      }
    });
  };

  const handleTypographyChange = (key, value) => {
    updateTheme({
      typography: {
        ...theme.typography,
        [key]: value
      }
    });
  };

  const handleLayoutChange = (key, value) => {
    updateTheme({
      layout_preferences: {
        ...theme.layout_preferences,
        [key]: value
      }
    });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full"
        aria-label="Accessibility Options"
      >
        <Eye className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute right-0 top-12 z-50 w-80"
            >
              <Card className="shadow-2xl border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="w-5 h-5 text-blue-600" />
                    Accessibility Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Vision Accessibility */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2 text-slate-800">
                      <Contrast className="w-4 h-4" />
                      Vision
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">High Contrast</label>
                        <Switch
                          checked={theme.accessibility.high_contrast}
                          onCheckedChange={(checked) => handleAccessibilityChange('high_contrast', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Screen Reader Optimized</label>
                        <Switch
                          checked={theme.accessibility.screen_reader_optimized}
                          onCheckedChange={(checked) => handleAccessibilityChange('screen_reader_optimized', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2 text-slate-800">
                      <Type className="w-4 h-4" />
                      Typography
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Font Size</label>
                        <Select 
                          value={theme.typography.font_size}
                          onValueChange={(value) => handleTypographyChange('font_size', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="xl">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Font Family</label>
                        <Select 
                          value={theme.typography.font_family}
                          onValueChange={(value) => handleTypographyChange('font_family', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter (Default)</SelectItem>
                            <SelectItem value="Georgia">Georgia (Serif)</SelectItem>
                            <SelectItem value="Arial">Arial (Sans-serif)</SelectItem>
                            <SelectItem value="OpenDyslexic">OpenDyslexic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Motion & Interaction */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2 text-slate-800">
                      <Pause className="w-4 h-4" />
                      Motion & Interaction
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Reduce Motion</label>
                        <Switch
                          checked={theme.accessibility.reduced_motion}
                          onCheckedChange={(checked) => handleAccessibilityChange('reduced_motion', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Enhanced Keyboard Navigation</label>
                        <Switch
                          checked={theme.accessibility.keyboard_navigation}
                          onCheckedChange={(checked) => handleAccessibilityChange('keyboard_navigation', checked)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Animation Level</label>
                        <Select 
                          value={theme.layout_preferences.animation_level}
                          onValueChange={(value) => handleLayoutChange('animation_level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Animations</SelectItem>
                            <SelectItem value="reduced">Reduced Animations</SelectItem>
                            <SelectItem value="none">No Animations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        updateTheme({
                          accessibility: {
                            high_contrast: false,
                            reduced_motion: false,
                            keyboard_navigation: true,
                            screen_reader_optimized: false
                          },
                          typography: {
                            font_family: 'Inter',
                            font_size: 'medium',
                            line_height: 1.5
                          },
                          layout_preferences: {
                            ...theme.layout_preferences,
                            animation_level: 'full'
                          }
                        });
                      }}
                      className="w-full text-sm"
                    >
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}