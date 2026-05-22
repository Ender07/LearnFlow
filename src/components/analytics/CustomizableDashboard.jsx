import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Layout, BarChart3, Target, TrendingUp, Users } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function CustomizableDashboard({ analytics }) {
  const [availableWidgets] = useState([
    { id: 'engagement', title: 'Engagement Rate', icon: Users, enabled: true },
    { id: 'completions', title: 'Completion Velocity', icon: TrendingUp, enabled: true },
    { id: 'scores', title: 'Average Scores', icon: Target, enabled: true },
    { id: 'trends', title: 'Weekly Trends', icon: BarChart3, enabled: false },
    { id: 'risks', title: 'Risk Areas', icon: Target, enabled: false },
    { id: 'categories', title: 'Category Performance', icon: Layout, enabled: false }
  ]);

  const [widgets, setWidgets] = useState(availableWidgets);
  const [layoutStyle, setLayoutStyle] = useState('grid');

  const handleWidgetToggle = (widgetId) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  const handleSave = () => {
    // In a real app, this would save to user preferences
    localStorage.setItem('dashboardConfig', JSON.stringify({ widgets, layoutStyle }));
    // Show success toast
  };

  return (
    <div className="space-y-6">
      {/* Layout Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Layout Style
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              variant={layoutStyle === 'grid' ? 'default' : 'outline'}
              onClick={() => setLayoutStyle('grid')}
            >
              Grid Layout
            </Button>
            <Button 
              variant={layoutStyle === 'list' ? 'default' : 'outline'}
              onClick={() => setLayoutStyle('list')}
            >
              List Layout
            </Button>
            <Button 
              variant={layoutStyle === 'compact' ? 'default' : 'outline'}
              onClick={() => setLayoutStyle('compact')}
            >
              Compact View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Widget Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dashboard Widgets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {widgets.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center justify-between p-4 border rounded-lg ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          } ${widget.enabled ? 'bg-blue-50 border-blue-200' : 'bg-slate-50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <widget.icon className="w-5 h-5 text-slate-600" />
                            <span className="font-medium">{widget.title}</span>
                            {widget.enabled && <Badge variant="secondary">Enabled</Badge>}
                          </div>
                          <Checkbox
                            checked={widget.enabled}
                            onCheckedChange={() => handleWidgetToggle(widget.id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`${layoutStyle === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
            {widgets.filter(w => w.enabled).map(widget => (
              <div key={widget.id} className="p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <widget.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{widget.title}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Dashboard Configuration
        </Button>
      </div>
    </div>
  );
}