import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Users, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { loginLocalUser } = useAuth();
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState('user');

  const handlePredefinedLogin = (roleType) => {
    if (roleType === 'admin') {
      loginLocalUser({
        id: 'usr-admin',
        full_name: 'Alex Mercer',
        email: 'alex.mercer@learnflow.industrial',
        role: 'admin'
      });
    } else {
      loginLocalUser({
        id: 'usr-operator',
        full_name: 'John Doe',
        email: 'john.doe@learnflow.industrial',
        role: 'user'
      });
    }
    // Redirect to home/dashboard
    window.location.href = '/';
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      alert('Please fill out your name and email.');
      return;
    }
    loginLocalUser({
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      full_name: customName,
      email: customEmail,
      role: customRole
    });
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0f1729] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-[#0d1526] border-slate-800 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          
          <CardHeader className="text-center pt-8 pb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome to LearnFlow</CardTitle>
            <CardDescription className="text-slate-400 text-sm mt-1">
              Select a simulation profile or enter custom details to explore the platform.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-8">
            {/* Simulation Profiles */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quick Profile Login
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handlePredefinedLogin('user')}
                  className="flex items-center gap-3 p-4 bg-[#1e293b]/40 hover:bg-[#1e293b]/80 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all duration-250 group"
                >
                  <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">Learner Operator</div>
                    <div className="text-xs text-slate-400">John Doe (user)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePredefinedLogin('admin')}
                  className="flex items-center gap-3 p-4 bg-[#1e293b]/40 hover:bg-[#1e293b]/80 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all duration-250 group"
                >
                  <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">Supervisor / Admin</div>
                    <div className="text-xs text-slate-400">Alex Mercer (admin)</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 bg-[#0d1526] text-xs font-semibold text-slate-450 uppercase">
                Or Custom Login
              </span>
            </div>

            {/* Custom Details */}
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-350">Full Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Jane Foster"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-white placeholder-slate-650"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-350">Work Email</label>
                <Input
                  type="email"
                  placeholder="e.g. jane.foster@company.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-white placeholder-slate-650"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-350">Platform Role</label>
                <select
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-900 border border-slate-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-slate-700"
                >
                  <option value="user">User (Learner)</option>
                  <option value="admin">Admin (Supervisor)</option>
                </select>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white mt-2">
                Launch Workspace
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
