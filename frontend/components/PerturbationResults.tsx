'use client';

interface PerturbationResultsProps {
  result: any;
}

export default function PerturbationResults({ result }: PerturbationResultsProps) {
  const robustness = result.investigation.robustness_investigator;

  if (robustness.status !== 'SUCCESS') {
    return (
      <div className="glass-card p-8 text-gray-400">
        <p className="text-red-400 font-semibold mb-2">Robustness analysis failed or unavailable</p>
        {robustness.error && (
          <p className="text-sm text-gray-500 font-mono">{robustness.error}</p>
        )}
      </div>z
    );
  }

  const data = robustness.output_summary;

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Robustness Analysis</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 bg-slate/50">
            <p className="text-gray-400 text-sm mb-2">Perturbations Tested</p>
            <p className="text-3xl font-bold text-cyan-400">{data.perturbations_tested}</p>
          </div>
          
          <div className="glass-card p-4 bg-slate/50">
            <p className="text-gray-400 text-sm mb-2">Prediction Flips</p>
            <p className="text-3xl font-bold text-yellow-400">{data.prediction_flips}</p>
            <p className="text-xs text-gray-400 mt-1">({(data.flip_rate * 100).toFixed(1)}%)</p>
          </div>
          
          <div className="glass-card p-4 bg-slate/50">
            <p className="text-gray-400 text-sm mb-2">Max Confidence Δ</p>
            <p className="text-3xl font-bold text-orange-400">
              {(Math.abs(data.max_confidence_delta) * 100).toFixed(1)}%
            </p>
          </div>
          
          <div className="glass-card p-4 bg-slate/50">
            <p className="text-gray-400 text-sm mb-2">Most Sensitive</p>
            <p className="text-lg font-bold text-cyan-400">{data.most_sensitive_perturbation}</p>
          </div>
        </div>

        <div className="glass-card p-6 bg-slate/50 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Model Stability Assessment</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Prediction Stability</span>
                <span className="text-cyan-400">
                  {data.flip_rate <= 0.1 ? 'STABLE' : data.flip_rate <= 0.3 ? 'MODERATE' : 'UNSTABLE'}
                </span>
              </div>
              <div className="w-full bg-slate/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (1 - data.flip_rate) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Confidence Stability</span>
                <span className="text-cyan-400">
                  {Math.abs(data.max_confidence_delta) <= 0.15 ? 'STABLE' : data.max_confidence_delta <= 0.3 ? 'MODERATE' : 'UNSTABLE'}
                </span>
              </div>
              <div className="w-full bg-slate/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (1 - Math.abs(data.max_confidence_delta)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 bg-slate/50">
          <h3 className="text-lg font-semibold text-white mb-3">Interpretation</h3>
          <p className="text-gray-300">
            The model was tested against {data.perturbations_tested} controlled perturbations including brightness changes, 
            contrast adjustments, noise, blur, and rotations. {data.prediction_flips} cases resulted in prediction changes, 
            and the largest confidence change was {(Math.abs(data.max_confidence_delta) * 100).toFixed(1)}%.
          </p>
        </div>
      </div>
    </div>
  );
}
