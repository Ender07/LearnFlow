import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BrainCircuit, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Send,
  Sparkles,
  Target
} from 'lucide-react';

export default function LearnFlowAssistant({ 
  currentStep, 
  process, 
  userProgress, 
  onHint,
  onAdaptStep,
  cognitiveProfile 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [assistantInsights, setAssistantInsights] = useState(null);

  useEffect(() => {
    // Analyze step performance and provide proactive insights
    analyzeCurrentStep();
  }, [currentStep, userProgress]);

  const analyzeCurrentStep = () => {
    // Simulate AI analysis of current step performance
    const timeOnStep = Date.now() - (currentStep.startTime || Date.now());
    const avgTimeForStep = 120000; // 2 minutes average
    
    let insights = {
      performance: 'good',
      suggestions: [],
      adaptations: []
    };

    if (timeOnStep > avgTimeForStep * 2) {
      insights.performance = 'struggling';
      insights.suggestions.push("This step is taking longer than usual. Would you like a hint?");
      insights.adaptations.push("Break this step into smaller parts");
    }

    if (cognitiveProfile?.cognitive_capacity?.working_memory < 5) {
      insights.adaptations.push("Simplify instructions based on your learning profile");
    }

    setAssistantInsights(insights);

    // Send proactive message if user is struggling
    if (insights.performance === 'struggling' && chatMessages.length === 0) {
      setTimeout(() => {
        addAssistantMessage("I notice you've been on this step for a while. I'm here to help! What can I clarify for you?");
      }, 2000);
    }
  };

  const addAssistantMessage = (message, type = 'message') => {
    const newMessage = {
      id: Date.now(),
      sender: 'assistant',
      message,
      type,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = generateAIResponse(inputMessage);
      addAssistantMessage(response);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hint') || input.includes('help')) {
      return `For this step "${currentStep.title}", here's what I recommend: Focus on ${currentStep.key_points?.[0] || 'following the safety protocols first'}. Take your time and don't hesitate to ask for clarification on any part.`;
    }
    
    if (input.includes('stuck') || input.includes('confused')) {
      return `I understand this can be challenging. Let me break down "${currentStep.title}" differently: ${currentStep.alternative_explanation || 'Try approaching this step by focusing on one element at a time.'}`;
    }
    
    if (input.includes('safe') || input.includes('danger')) {
      return `Safety is paramount! For this step, make sure to: ${currentStep.safety_warnings?.[0] || 'Follow all posted safety protocols and use required PPE.'}`;
    }
    
    return `I'm analyzing your question about "${currentStep.title}". Based on your learning profile, I suggest taking this step methodically. Is there a specific part you'd like me to explain further?`;
  };

  const handleApplyAdaptation = (adaptation) => {
    onAdaptStep(adaptation);
    addAssistantMessage(`Great! I've applied the adaptation: ${adaptation}. This should make the step clearer for you.`, 'success');
  };

  const QuickActions = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setInputMessage("I need a hint")}
        className="text-xs"
      >
        <Lightbulb className="w-3 h-3 mr-1" />
        Get Hint
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setInputMessage("I'm stuck on this step")}
        className="text-xs"
      >
        <AlertTriangle className="w-3 h-3 mr-1" />
        I'm Stuck
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setInputMessage("Is this step safe?")}
        className="text-xs"
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        Safety Check
      </Button>
    </div>
  );

  return (
    <>
      {/* Assistant Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg transition-all duration-300 ${
          assistantInsights?.performance === 'struggling' 
            ? 'bg-amber-500 hover:bg-amber-600 animate-pulse' 
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
        }`}
      >
        <BrainCircuit className="w-6 h-6 text-white" />
        {assistantInsights?.suggestions.length > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        )}
      </Button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-6 bottom-24 z-50 w-80 max-h-96"
          >
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BrainCircuit className="w-5 h-5 text-purple-600" />
                  LearnFlow Assistant
                  <Badge className="ml-auto bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </CardTitle>
                
                {/* Performance Insights */}
                {assistantInsights && (
                  <div className="mt-2 space-y-2">
                    {assistantInsights.performance === 'struggling' && (
                      <Alert className="p-2 bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                        <div className="text-xs text-amber-700 ml-2">
                          I've noticed you might need some help with this step.
                        </div>
                      </Alert>
                    )}
                    
                    {assistantInsights.adaptations.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-slate-600">Suggested Adaptations:</div>
                        {assistantInsights.adaptations.map((adaptation, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApplyAdaptation(adaptation)}
                            className="text-xs h-6 px-2 w-full justify-start"
                          >
                            <Target className="w-3 h-3 mr-1" />
                            {adaptation}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <QuickActions />
                
                {/* Chat Messages */}
                <div className="h-40 overflow-y-auto space-y-2 mb-3 scroll-smooth">
                  <AnimatePresence>
                    {chatMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs p-2 rounded-lg text-xs ${
                          msg.sender === 'user' 
                            ? 'bg-indigo-600 text-white' 
                            : msg.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {msg.message}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 text-gray-700 p-2 rounded-lg text-xs">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Input Area */}
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    className="text-xs"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}