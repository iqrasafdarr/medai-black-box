'use client';

import { useState } from 'react';

interface CounterfactualLabProps {
  result: any;
}

export default function CounterfactualLab({ result }: CounterfactualLabProps) {
  const [brightness, setBrightness] = useState(1.0);
  const [noise, setNoise] = useState(0);
  const [blur, setBlur] = useState(0);
  const [maskRegion, setMaskRegion] = useState(false);

  const originalConfidence = result.prediction.confidence;
  const originalVerd = result.verdict;

  // Simulated counterfactual effects
  const perturbedConfidence = Math.max(0, originalConfidence - (brightness - 1) * 0.2 - noise * 0.01 - blur * 0.02);
  const confidenceDelta = perturbedConfidence - originalConfidence;

  const getCounterfactualVerdict = () => {
    if (perturbedConfidence < 0.5) return 'ABSTAIN';
    if (Math.abs(confidenceDelta) > 0.2) return 'REVIEW';
    return originalVerd;
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Counterfactual Lab</h2>
        <p className="text-gray-400 text-sm mb-6">
          Modify evidence and observe how the verdict changes. This is a descriptive analysis only - not causal.
        </p>

        {/* Controls */}
        <div className="space-y-6 mb-8">
          {/* Brightness */}
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-gray-300 font-medium">Brightness</label>
              <span className="text-cyan-400">{brightness.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={brightness}
              onChange={(e) => setBrightness(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">Original = 1.0</div>
          </div>

          {/* Noise */}
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-gray-300 font-medium">Gaussian Noise (σ)</label>
              <span className="text-cyan-400">{noise}</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={noise}
              onChange={(e) => setNoise(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Blur */}
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-gray-300 font-medium">Blur (kernel size)</label>
              <span className="text-cyan-400">{blur}</span>
            </div>
            <input
              type="range"
              min="0"
              max="11"
              step="2"
              value={blur}
              onChange={(e) => setBlur(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Region Mask */}
          <div className="flex items-center gap-4">
            <label className="text-gray-300 font-medium">Mask Central Region</label>
            <button
              onClick={() => setMaskRegion(!maskRegion)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                maskRegion
                  ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                  : 'bg-slate/50 text-gray-400 border border-gray-600/30'
              }`}
            >
              {maskRegion ? 'Masked' : 'Unmasked'}
            </button>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-2 gap-6">
          {/* Original */}
          <div className="glass-card p-6 bg-slate/50">
            <h3 className="text-lg font-semibold text-white mb-4">BEFORE</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Prediction</p>
                <p className="text-2xl font-bold text-cyan-400">{result.prediction.predicted_label}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Confidence</p>
                <p className="text-2xl font-bold text-cyan-400">{(originalConfidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Verdict</p>
                <p className={`text-lg font-bold ${
                  originalVerd === 'TRUST' ? 'text-green-400' :
                  originalVerd === 'REVIEW' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {originalVerd}
                </p>
              </div>
            </div>
          </div>

          {/* Counterfactual */}
          <div className="glass-card p-6 bg-slate/50">
            <h3 className="text-lg font-semibold text-white mb-4">AFTER</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Prediction</p>
                <p className="text-2xl font-bold text-cyan-400">{result.prediction.predicted_label}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Confidence</p>
                <p className="text-2xl font-bold text-orange-400">
                  {(Math.max(0, perturbedConfidence) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Verdict</p>
                <p className={`text-lg font-bold ${
                  getCounterfactualVerdict() === 'TRUST' ? 'text-green-400' :
                  getCounterfactualVerdict() === 'REVIEW' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {getCounterfactualVerdict()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delta */}
        <div className="mt-6 glass-card p-4 bg-slate/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm mb-1">Confidence Δ</p>
              <p className={`text-xl font-bold ${confidenceDelta < 0 ? 'text-orange-400' : 'text-green-400'}`}>
                {confidenceDelta > 0 ? '+' : ''}{(confidenceDelta * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Verdict Change</p>
              <p className={`text-xl font-bold ${getCounterfactualVerdict() !== originalVerd ? 'text-yellow-400' : 'text-green-400'}`}>
                {getCounterfactualVerdict() !== originalVerd ? 'YES' : 'NO'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Sensitivity</p>
              <p className="text-xl font-bold text-cyan-400">
                {Math.abs(confidenceDelta) > 0.15 ? 'High' : 'Low'}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-sm">
            <strong>Important:</strong> This analysis is descriptive only. Changes in computational evidence do not imply clinical causality or pathological relationships. Use for understanding model behavior only.
          </p>
        </div>
      </div>
    </div>
  );
}
