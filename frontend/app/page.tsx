'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Zap, Eye, Shield, TrendingUp, Brain } from 'lucide-react';
import Investigation from '@/components/Investigation';

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'investigate'>('landing');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInvestigate = () => {
    setCurrentView('investigate');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setSelectedFile(null);
  };

  if (currentView === 'investigate') {
    return <Investigation onBack={handleBackToLanding} initialFile={selectedFile} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir via-slate to-noir overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 217, 255, 0.1) 25%, rgba(0, 217, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.1) 75%, rgba(0, 217, 255, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 217, 255, 0.1) 25%, rgba(0, 217, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.1) 75%, rgba(0, 217, 255, 0.1) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cyan-900/30 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔬</div>
              <div>
                <h1 className="text-2xl font-bold text-white">MEDAI BLACK BOX</h1>
                <p className="text-cyan-400 text-sm">Medical AI Forensics Laboratory</p>
              </div>
            </div>
            <div className="text-cyan-400 text-xs font-mono">v1.0.0</div>
          </div>
        </header>

        {/* Hero section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-bold mb-6 text-white"
            >
              Can You <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Trust the AI?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-400 mb-8"
            >
              An interactive forensic laboratory for investigating how medical AI behaves, where it fails, and when it should abstain.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm font-medium"
            >
              Research Prototype • Not a Clinical Diagnostic System
            </motion.div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: <Eye className="w-8 h-8" />,
                title: "Visual Evidence",
                description: "Grad-CAM and Integrated Gradients explainability"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Attack Testing",
                description: "Controlled perturbations reveal weaknesses"
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Uncertainty Analysis",
                description: "Measures trust vs confidence difference"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Robustness Analysis",
                description: "Identify computational failure modes"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Reliability Judgment",
                description: "TRUST • REVIEW • ABSTAIN"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Agent Observability",
                description: "Flight recorder for investigation modules"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
                className="glass-card p-6 hover:border-cyan-400/50 transition-colors group"
              >
                <div className="text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-card p-12 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Start Investigation
            </h3>
            <p className="text-gray-400 text-center mb-8">
              Upload a brain MRI image to begin forensic analysis
            </p>
            
            <div className="flex flex-col items-center gap-6">
              <label className="cursor-pointer">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="px-8 py-6 border-2 border-dashed border-cyan-400/50 rounded-lg hover:border-cyan-400 transition-colors text-center">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
                    <p className="text-white font-medium">Click to upload image</p>
                    <p className="text-gray-400 text-sm">or drag and drop</p>
                  </div>
                </div>
              </label>
              
              {selectedFile && (
                <div className="text-center">
                  <p className="text-cyan-400 font-medium mb-4">
                    Selected: {selectedFile.name}
                  </p>
                  <button
                    onClick={handleInvestigate}
                    className="btn-primary"
                  >
                    Start Investigation
                  </button>
                </div>
              )}
              
              <div className="w-full flex gap-4 pt-4">
                <div className="flex-1 h-px bg-gray-600" />
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-1 h-px bg-gray-600" />
              </div>
              
              <button
                onClick={() => alert('Demo cases coming soon - upload a real MRI image to test!')}
                className="btn-secondary"
              >
                Load Demo Case
              </button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-cyan-900/30 mt-20 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
            <p>MEDAI BLACK BOX • Interactive Forensic Laboratory for Medical AI Auditing</p>
            <p className="mt-2">Research Prototype • Not for Clinical Deployment</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
