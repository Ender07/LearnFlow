import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent mb-2">
                Welcome to LearnFlow!
              </h1>
              <p className="text-slate-600 text-lg">
                Your manufacturing training journey starts here.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Welcome to LearnFlow - your comprehensive manufacturing training platform. 
                Explore the sidebar to discover processes, learning paths, and more.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Process Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Browse through our comprehensive library of manufacturing processes and training materials.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Learning Paths</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Follow structured learning paths designed to build your manufacturing expertise step by step.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}