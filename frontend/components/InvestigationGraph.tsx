'use client';

import { motion } from 'framer-motion';
import { ArrowDown, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface InvestigationGraphProps {
  result: any;
}

const getAgentStatus = (agent: any) => {
  if (agent.status === 'SUCCESS') {
    return { icon: 'success', color: 'text-green-400', label: 'SUCCESS' };
  } else if (agent.status === 'FAILED') {
    return { icon: 'error', color: 'text-red-400', label: 'FAILED' };
  }
  return { icon: 'loading', color: 'text-yellow-400', label: agent.status };
};

export default function InvestigationGraph({ result }: InvestigationGraphProps) {
  const agents = [
    { name: 'Prediction', data: null, custom: true },
    { name: 'Vision Investigator', data: result.investigation.vision_investigator },
    { name: 'Robustness Investigator', data: result.investigation.robustness_investigator },
    { name: 'Uncertainty Investigator', data: result.investigation.uncertainty_investigator },
    { name: 'Failure Analyzer', data: result.investigation.failure_investigator },
    { name: 'Reliability Judge', data: result.investigation.reliability_judge }
  ];

  return (
    <div className="space-y-6">
      {agents.map((agent, idx) => {
        const status = agent.custom ? null : getAgentStatus(agent.data);
        
        return (
          <div key={idx}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card p-4 hover:border-cyan-400/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {agent.custom ? (
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg">
                      🔮
                    </div>
                  ) : status?.icon === 'success' ? (
                    <CheckCircle className={`w-6 h-6 ${status?.color}`} />
                  ) : status?.icon === 'error' ? (
                    <AlertCircle className={`w-6 h-6 ${status?.color}`} />
                  ) : (
                    <Loader className={`w-6 h-6 ${status?.color}`} />
                  )}
                  <div>
                    <p className="font-medium text-white">{agent.name}</p>
                    {agent.data && (
                      <p className="text-xs text-gray-400">
                        {(agent.data.latency_ms).toFixed(0)}ms
                      </p>
                    )}
                  </div>
                </div>
                {status && (
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                )}
              </div>
            </motion.div>
            
            {idx < agents.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="w-5 h-5 text-cyan-500/50" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
