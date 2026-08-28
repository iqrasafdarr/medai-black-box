'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, CheckCircle, AlertCircle, Brain, BarChart3, Shield } from 'lucide-react';
import axios from 'axios';
import InvestigationGraph from './InvestigationGraph';
import EvidenceTimeline from './EvidenceTimeline';
import VerdictCard from './VerdictCard';
import BreakTheAI from './BreakTheAI';
import CounterfactualLab from './CounterfactualLab';
import AgentFlightRecorder from './AgentFlightRecorder';
import PerturbationResults from './PerturbationResults';

interface InvestigationProps {
  onBack: () => void;
  initialFile?: File | null;
}

interface AutopsyResult {
  status: string;
  case: any;
  prediction: any;
  investigation: {
    vision_investigator: any;
    robustness_investigator: any;
    uncertainty_investigator: any;
    failure_investigator: any;
    reliability_judge: any;
  };
  verdict: string;
  trust_score: number;
  reasoning: string;
  executive_summary: any;
}

export default function Investigation({ onBack, initialFile }: InvestigationProps) {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutopsyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'demo' | 'research'>('demo');
  const [activeTab, setActiveTab] = useState<'overview' | 'explainability' | 'robustness' | 'counterfactual' | 'breakai' | 'agents'>('overview');

  useEffect(() => {
    if (file) {
      runAutopsy();
    }
  }, [file]);

  const runAutopsy = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('http://localhost:8000/api/autopsy', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to run analysis');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir via-slate to-noir overflow-hidden">
      {/* Header with back button */}
      <header className="border-b border-cyan-900/30 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Lab
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔬</div>
            <div>
              <h1 className="text-xl font-bold text-white">Investigation</h1>
              {file && <p className="text-cyan-400 text-xs">{file.name}</p>}
            </div>
          </div>
          
          <div className="flex gap-2">
            {['demo', 'research'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m as 'demo' | 'research')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)} Mode
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-6xl"
          >
            🔍
          </motion.div>
          <div className="ml-8">
            <h2 className="text-2xl font-bold text-white mb-2">Running Investigation...</h2>
            <p className="text-gray-400">Analyzing medical image with forensic precision</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="glass-card border-red-500/50 bg-red-500/10 p-8">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-300 mb-2">Analysis Failed</h3>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="mt-6 btn-secondary"
            >
              Return to Lab
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Verdict section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VerdictCard result={result} />
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-cyan-900/30 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'explainability', label: 'Explainability', icon: '🎯' },
              { id: 'robustness', label: 'Robustness', icon: '⚡' },
              { id: 'counterfactual', label: 'Counterfactual', icon: '🔄' },
              { id: 'breakai', label: 'Break the AI', icon: '💥' },
              { id: 'agents', label: 'Agents', icon: '📡' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Investigation graph */}
                  <div className="glass-card p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Investigation Flow</h2>
                    <InvestigationGraph result={result} />
                  </div>

                  {/* Evidence timeline */}
                  <div className="glass-card p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Evidence Timeline</h2>
                    <EvidenceTimeline result={result} />
                  </div>

                  {/* Executive summary */}
                  <div className="glass-card p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Executive Summary</h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">CONFIDENCE</p>
                        <p className="text-3xl font-bold text-cyan-400">
                          {(result.executive_summary.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">RELIABILITY</p>
                        <p className="text-3xl font-bold text-cyan-400">
                          {(result.trust_score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-cyan-900/30">
                      <p className="text-gray-300 mb-4">{result.reasoning}</p>
                      {result.executive_summary.concerns?.length > 0 && (
                        <div>
                          <p className="text-yellow-300 text-sm font-medium mb-3">Key Concerns:</p>
                          <ul className="space-y-2">
                            {result.executive_summary.concerns.map((concern: any, i: number) => (
                              <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                                <span className="text-yellow-300 mt-1">▸</span>
                                <span>{concern.type}: {concern.evidence}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'explainability' && (
                <motion.div
                  key="explainability"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Visual Evidence</h2>
                  <div className="glass-card p-6 bg-slate/50 mb-6">
                    <p className="text-gray-400 mb-4">
                      The Vision Investigator analyzed explainability using Grad-CAM and Integrated Gradients.
                    </p>
                    {result.investigation.vision_investigator.status === 'SUCCESS' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Explanation Agreement</p>
                            <p className="text-2xl font-bold text-cyan-400">
                              {(result.investigation.vision_investigator.output_summary.similarity_score * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Activation Regions</p>
                            <p className="text-2xl font-bold text-cyan-400">
                              {result.investigation.vision_investigator.output_summary.activated_region_count}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm pt-4 border-t border-cyan-900/30">
                          Grad-CAM and Integrated Gradients show {
                            result.investigation.vision_investigator.output_summary.similarity_score > 0.5
                              ? 'good agreement on important regions'
                              : 'different perspectives on important regions'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'robustness' && (
                <motion.div
                  key="robustness"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <PerturbationResults result={result} />
                </motion.div>
              )}

              {activeTab === 'counterfactual' && (
                <motion.div
                  key="counterfactual"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <CounterfactualLab result={result} />
                </motion.div>
              )}

              {activeTab === 'breakai' && (
                <motion.div
                  key="breakai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <BreakTheAI result={result} />
                </motion.div>
              )}

              {activeTab === 'agents' && (
                <motion.div
                  key="agents"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AgentFlightRecorder result={result} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
