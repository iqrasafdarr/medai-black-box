'use client';

interface EvidenceTimelineProps {
  result: any;
}

export default function EvidenceTimeline({ result }: EvidenceTimelineProps) {
  const prediction = result.prediction;
  const uncertainty = result.investigation.uncertainty_investigator.output_summary;
  const robustness = result.investigation.robustness_investigator.output_summary;

  const stages = [
    {
      name: 'Initial Prediction',
      value: `${prediction.predicted_label}`,
      confidence: `${(prediction.confidence * 100).toFixed(1)}%`,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      name: 'Visual Evidence',
      value: 'Analyzed',
      confidence: 'Vision OK',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Robustness Test',
      value: `${robustness.prediction_flips} flips`,
      confidence: `Δ${(robustness.max_confidence_delta * 100).toFixed(1)}%`,
      color: uncertainty.uncertainty_level === 'HIGH' ? 'from-yellow-500 to-orange-500' : 'from-green-500 to-emerald-500'
    },
    {
      name: 'Uncertainty Check',
      value: uncertainty.uncertainty_level,
      confidence: `${(uncertainty.normalized_entropy * 100).toFixed(1)}%`,
      color: uncertainty.uncertainty_level === 'HIGH' ? 'from-red-500 to-pink-500' : 'from-green-500 to-emerald-500'
    },
    {
      name: 'Final Verdict',
      value: result.verdict,
      confidence: `${(result.trust_score * 100).toFixed(1)}%`,
      color: result.verdict === 'TRUST' ? 'from-green-500 to-emerald-500' : 
             result.verdict === 'REVIEW' ? 'from-yellow-500 to-orange-500' : 
             'from-red-500 to-pink-500'
    }
  ];

  return (
    <div className="space-y-4">
      {stages.map((stage, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
              {idx + 1}
            </div>
            {idx < stages.length - 1 && (
              <div className={`w-1 h-12 bg-gradient-to-b ${stage.color}`} />
            )}
          </div>
          <div className="glass-card p-4 flex-grow">
            <p className="text-sm font-medium text-gray-400 mb-1">{stage.name}</p>
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold text-white">{stage.value}</p>
              <span className="text-sm text-gray-400">{stage.confidence}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
