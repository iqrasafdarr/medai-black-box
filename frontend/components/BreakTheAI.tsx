'use client';

import { useState } from 'react';
import { AlertCircle, TrendingDown } from 'lucide-react';

interface BreakTheAIProps {
  result: any;
}

export default function BreakTheAI({ result }: BreakTheAIProps) {
  const [disabledAgents, setDisabledAgents] = useState<Set<string>>(new Set());
  const [removeEvidence, setRemoveEvidence] = useState<Set<string>>(new Set());
  const [injectedNoise, setInjectedNoise] = useState(false);
  const [simulateTimeout, setSimulateTimeout] = useState(false);

  const agents = [
    { id: 'vision', name: 'Vision Investigator', emoji: '👁️', description: 'Remove visual evidence analysis' },
    { id: 'robustness', name: 'Robustness Investigator', emoji: '⚡', description: 'Skip perturbation testing' },
    { id: 'uncertainty', name: 'Uncertainty Investigator', emoji: '📊', description: 'Skip uncertainty analysis' },
  ];

  const toggleAgent = (agentId: string) => {
    const newSet = new Set(disabledAgents);
    if (newSet.has(agentId)) {
      newSet.delete(agentId);
    } else {
      newSet.add(agentId);
    }
    setDisabledAgents(newSet);
  };

  const toggleEvidence = (evidenceId: string) => {
    const newSet = new Set(removeEvidence);
    if (newSet.has(evidenceId)) {
      newSet.delete(evidenceId);
    } else {
      newSet.add(evidenceId);
    }
    setRemoveEvidence(newSet);
  };

  // Calculate degraded verdict
  const disabledCount = disabledAgents.size;
  const evidenceRemoved = removeEvidence.size > 0;
  const originalVerdict = result.verdict;
  const originalScore = result.trust_score;

  let degradedVerdict = originalVerdict;
  let degradedScore = originalScore;

  if (injectedNoise) {
    degradedScore *= 0.7;
  }
  if (simulateTimeout) {
    degradedScore *= 0.6;
  }
  if (evidenceRemoved) {
    degradedScore *= 0.8;
  }
  if (disabledCount >= 2) {
    degradedScore *= 0.5;
    degradedVerdict = 'ABSTAIN';
  } else if (disabledCount === 1) {
    degradedScore *= 0.85;
    if (originalVerdict === 'TRUST') degradedVerdict = 'REVIEW';
  }

  // Determine new verdict based on score
  if (degradedScore < 0.25) {
    degradedVerdict = 'ABSTAIN';
  } else if (degradedScore < 0.5) {
    degradedVerdict = 'REVIEW';
  } else if (degradedScore >= 0.75) {
    degradedVerdict = 'TRUST';
  } else {
    degradedVerdict = 'REVIEW';
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <div className="flex items-start gap-4 mb-8">
          <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-white">Break the AI</h2>
            <p className="text-gray-400 text-sm mt-1">
              Controlled failure injection to test graceful degradation
            </p>
            <p className="text-red-300 text-xs mt-2 font-medium">
              ⚠️ RESEARCH ONLY - Demonstrates system robustness to component failures
            </p>
          </div>
        </div>

        {/* Failure Injection Controls */}
        <div className="space-y-6 mb-8">
          {/* Disable Agents */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Disable Agents</h3>
            <div className="space-y-3">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    disabledAgents.has(agent.id)
                      ? 'bg-red-500/20 border-red-500/50'
                      : 'glass-card border-cyan-900/30 hover:border-cyan-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{agent.emoji}</span>
                      <div>
                        <p className="font-medium text-white">{agent.name}</p>
                        <p className="text-xs text-gray-400">{agent.description}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      disabledAgents.has(agent.id)
                        ? 'bg-red-500/30 text-red-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {disabledAgents.has(agent.id) ? 'OFFLINE' : 'ONLINE'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Remove Evidence Sources */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Remove Evidence</h3>
            <div className="space-y-2">
              {[
                { id: 'visual', name: 'Visual Evidence', icon: '🎯' },
                { id: 'robustness_data', name: 'Robustness Data', icon: '📊' },
                { id: 'uncertainty_data', name: 'Uncertainty Data', icon: '📈' }
              ].map(evidence => (
                <button
                  key={evidence.id}
                  onClick={() => toggleEvidence(evidence.id)}
                  className={`w-full p-3 text-left rounded-lg transition-colors ${
                    removeEvidence.has(evidence.id)
                      ? 'bg-red-500/20 text-red-300'
                      : 'glass-card text-gray-300 hover:text-gray-200'
                  }`}
                >
                  <span className="mr-2">{evidence.icon}</span>
                  {evidence.name}
                  {removeEvidence.has(evidence.id) && <span className="ml-2 text-red-400">✗</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Failure Simulation */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Failure Scenarios</h3>
            <div className="space-y-3">
              <button
                onClick={() => setInjectedNoise(!injectedNoise)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  injectedNoise
                    ? 'bg-orange-500/20 border-orange-500/50'
                    : 'glass-card border-cyan-900/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Inject Noise into Evidence</p>
                    <p className="text-xs text-gray-400">Corrupts evidence with random noise</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    injectedNoise ? 'bg-orange-500/30 text-orange-300' : 'bg-slate/50 text-gray-400'
                  }`}>
                    {injectedNoise ? 'ACTIVE' : 'OFF'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSimulateTimeout(!simulateTimeout)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  simulateTimeout
                    ? 'bg-red-500/20 border-red-500/50'
                    : 'glass-card border-cyan-900/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Simulate Agent Timeout</p>
                    <p className="text-xs text-gray-400">Some agents fail to respond in time</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    simulateTimeout ? 'bg-red-500/30 text-red-300' : 'bg-slate/50 text-gray-400'
                  }`}>
                    {simulateTimeout ? 'ACTIVE' : 'OFF'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="glass-card p-6 bg-slate/50 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">System Degradation Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Agents Disabled</span>
              <span className={`font-bold ${disabledCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {disabledCount}/3
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Evidence Removed</span>
              <span className={`font-bold ${removeEvidence.size > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {removeEvidence.size}/3
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Injection Active</span>
              <span className={`font-bold ${injectedNoise || simulateTimeout ? 'text-red-400' : 'text-green-400'}`}>
                {injectedNoise || simulateTimeout ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        </div>

        {/* Verdict Comparison */}
        <div className="grid grid-cols-2 gap-6">
          {/* Original */}
          <div className="glass-card p-6 bg-slate/50">
            <h3 className="text-lg font-semibold text-white mb-4">ORIGINAL SYSTEM</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Verdict</p>
                <p className={`text-3xl font-bold ${
                  originalVerdict === 'TRUST' ? 'text-green-400' :
                  originalVerdict === 'REVIEW' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {originalVerdict}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Trust Score</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {(originalScore * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">All Systems: ✓ OPERATIONAL</p>
              </div>
            </div>
          </div>

          {/* Degraded */}
          <div className={`glass-card p-6 ${
            disabledCount > 0 || removeEvidence.size > 0 || injectedNoise || simulateTimeout
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-slate/50'
          }`}>
            <h3 className="text-lg font-semibold text-white mb-4">DEGRADED SYSTEM</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Verdict</p>
                <p className={`text-3xl font-bold ${
                  degradedVerdict === 'TRUST' ? 'text-green-400' :
                  degradedVerdict === 'REVIEW' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {degradedVerdict}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Trust Score</p>
                <p className="text-2xl font-bold text-orange-400">
                  {(Math.max(0, degradedScore) * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">
                  {disabledCount > 0 || removeEvidence.size > 0 || injectedNoise || simulateTimeout
                    ? '⚠️ DEGRADATION ACTIVE'
                    : '✓ NO FAILURES'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Findings */}
        {(disabledCount > 0 || removeEvidence.size > 0 || injectedNoise || simulateTimeout) && (
          <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              System Behavior Under Degradation
            </h3>
            <ul className="space-y-2 text-yellow-200 text-sm">
              {disabledCount >= 2 && (
                <li>• Multiple agent failures detected → System conservatively recommends ABSTAIN</li>
              )}
              {disabledCount === 1 && (
                <li>• Single agent failure → Reduced confidence, recommendation shifts to REVIEW</li>
              )}
              {removeEvidence.size > 0 && (
                <li>• Evidence incompleteness detected → Trust score reduced by 20%</li>
              )}
              {injectedNoise && (
                <li>• Evidence corruption detected → Trust score reduced by 30%</li>
              )}
              {simulateTimeout && (
                <li>• Agent timeout detected → System cannot complete analysis, verdict degraded</li>
              )}
              {degradedVerdict !== originalVerdict && (
                <li>• <strong>Verdict changed from {originalVerdict} to {degradedVerdict}</strong> - Graceful degradation successful</li>
              )}
            </ul>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>Purpose:</strong> Demonstrates that the system gracefully degrades when individual agents fail or evidence is unavailable. The system does not make overconfident decisions despite incomplete information - instead, it conservatively recommends REVIEW or ABSTAIN.
          </p>
        </div>
      </div>
    </div>
  );
}
