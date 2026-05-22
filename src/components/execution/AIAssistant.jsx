import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BrainCircuit, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InvokeLLM } from '@/integrations/Core';

export default function AIAssistant({ currentStep, processTitle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    // Welcome message when component loads or step changes
    setMessages([
      {
        sender: 'ai',
        text: `I'm your AI Assistant. How can I help you with Step: "${currentStep?.title || 'Current Step'}"? You can ask for clarification, safety info, or tool usage.`,
      },
    ]);
  }, [currentStep]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const llmResponse = await InvokeLLM({
        prompt: `As a helpful AI assistant for manufacturing training, answer the user's question based on the following context. Be concise and helpful.
        
        Process: "${processTitle}"
        Current Step: "${currentStep.title}"
        Step Description: "${currentStep.description}"
        Safety Warnings: ${JSON.stringify(currentStep.safety_warnings)}
        Quality Criteria: ${JSON.stringify(currentStep.quality_criteria)}
        
        User's Question: "${input}"`,
      });
      
      const aiMessage = { sender: 'ai', text: llmResponse };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error invoking LLM:", error);
      const errorMessage = { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-1/2">
      <h4 className="font-semibold text-slate-700 p-4 border-b border-slate-200 flex items-center gap-2">
        <BrainCircuit className="w-5 h-5 text-indigo-500" />
        AI Assistant
      </h4>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
              >
                {msg.sender === 'ai' && (
                  <Avatar className="w-8 h-8 bg-indigo-100 text-indigo-600">
                    <AvatarFallback><Sparkles className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs rounded-2xl p-3 text-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isThinking && (
             <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <Avatar className="w-8 h-8 bg-indigo-100 text-indigo-600">
                    <AvatarFallback><Sparkles className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="bg-slate-200 text-slate-800 rounded-2xl p-3 rounded-bl-none">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                    </div>
                </div>
             </motion.div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="pr-10"
            disabled={isThinking}
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            disabled={isThinking || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}