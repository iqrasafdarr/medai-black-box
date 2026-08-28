'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface VerdictCardProps {
  result: any;
}

export default function VerdictCard({ result }: VerdictCardProps) {
  const verdict = result.verdict;
  const trustScore = result.trust_score;

  const verdictConfig = {
    TRUST: {
      bg: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/50',
      icon: CheckCircle,
      color: 'text-green-400',
      label: 'TRUST',
      description: 'Prediction is reliable - recommend deployment'
    },
    REVIEW: {
      bg: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/50',
      icon: AlertCircle,
      color: 'text-yellow-400',
      label: 'REVIEW',
      description: 'Prediction requires expert review'
    },
    ABSTAIN: {
      bg: 'from-red-500/20 to-pink-500/20',
      border: 'border-red-500/50',
      icon: XCircle,
      color: 'text-red-400',
      label: 'ABSTAIN',
      description: 'System cannot reliably assess this case'
    }
  };

  const config = verdictConfig[verdict as keyof typeof verdictConfig] || verdictConfig.REVIEW;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`glass-card bg-gradient-to-br ${config.bg} border ${config.border} p-8`}
    >
      <div className="flex items-start gap-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex-shrink-0"
        >
          <Icon className={`w-16 h-16 ${config.color}`} />
        </motion.div>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-4xl font-bold ${config.color} mb-2`}>
                {config.label}
              </h1>
              <p className="text-gray-300 text-lg">{config.description}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm mb-1">RELIABILITY SCORE</p>
              <p className={`text-5xl font-bold ${config.color}`}>
                {(trustScore * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-gray-300">{result.reasoning}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
