'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AgentFlightRecorderProps {
  result: any;
}

export default function AgentFlightRecorder({ result }: AgentFlightRecorderProps) {
  const [expanded, setExpanded] = useState<string | null>('reliability_judge');

  const agents = [
    { key: 'vision_investigator', name: 'Vision Investigator', emoji: '👁️' },
    { key: 'robustness_investigator', name: 'Robustness Investigator', emoji: '⚡' },
    { key: 'uncertainty_investigator', name: 'Uncertainty Investigator', emoji: '📊' },
    { key: 'failure_investigator', name: 'Failure Investigator', emoji: '🔍' },
    { key: 'reliability_judge', name: 'Reliability Judge', emoji: '⚖️' }
  ];

  return (
    <div className="space-y-4">
      <div className="glass-card p-6 mb-6">
        <h2 className="text-2xl font-bold text-white">Agent Flight Recorder</h2>
        <p className="text-gray-400 text-sm mt-2">
          Detailed execution log of each investigation module
        </p>
      </div>

      {agents.map(agent => {
        const agentData = result.investigation[agent.key as keyof typeof result.investigation];
        const isExpanded = expanded === agent.key;

        return (
          <div key={agent.key} className="glass-card overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : agent.key)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{agent.emoji}</span>
                <div className="text-left">
                  <p className="font-medium text-white">{agent.name}</p>
                  <p className="text-xs text-gray-400">
                    {agentData.latency_ms.toFixed(2)}ms • {agentData.status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  agentData.status === 'SUCCESS'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {agentData.status}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {isExpanded && (
              <div className="px-6 py-4 border-t border-cyan-900/30 bg-slate/20 space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Execution Time</p>
                  <p className="font-mono text-cyan-400">
                    {agentData.start_time_str} → {agentData.end_time_str}
                  </p>
                </div>

                {agentData.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 font-mono text-sm">{agentData.error}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-400 mb-2">Input Summary</p>
                  <pre className="bg-slate/50 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(agentData.input_summary, null, 2)}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Output Summary</p>
                  <pre className="bg-slate/50 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(agentData.output_summary, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
