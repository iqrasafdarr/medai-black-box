"""
Investigation Agents
Deterministic modules that investigate different aspects of model predictions
Communicate through structured JSON outputs
"""
import json
import time
import numpy as np
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import traceback


@dataclass
class AgentResult:
    """Base class for agent results"""
    agent_name: str
    status: str  # SUCCESS, FAILED, TIMEOUT, SKIPPED
    start_time: float
    end_time: float
    latency_ms: float
    input_summary: Dict[str, Any]
    output_summary: Dict[str, Any]
    error: Optional[str] = None
    evidence: Dict[str, Any] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        d = asdict(self)
        d['start_time_str'] = datetime.fromtimestamp(self.start_time).isoformat()
        d['end_time_str'] = datetime.fromtimestamp(self.end_time).isoformat()
        if self.evidence is None:
            self.evidence = {}
        return d


class VisionInvestigator:
    """
    Analyzes visual evidence and saliency
    Uses Grad-CAM and Integrated Gradients
    """
    
    def __init__(self, model, explainability_module):
        self.model = model
        self.explainability = explainability_module
    
    def investigate(self, image_data: np.ndarray, prediction: Dict, 
                   mask: Optional[np.ndarray] = None) -> AgentResult:
        """
        Investigate visual evidence
        
        Args:
            image_data: Original image
            prediction: Model prediction
            mask: Optional lesion mask
        
        Returns:
            AgentResult with findings
        """
        start_time = time.time()
        
        try:
            # Generate Grad-CAM
            cam_heatmap = self.explainability.gradcam.generate(
                self.model.preprocess_image(image_data),
                target_class=prediction['predicted_class']
            )
            
            # Generate Integrated Gradients
            ig_attribution = self.explainability.integrated_gradients.generate(
                self.model.preprocess_image(image_data),
                target_class=prediction['predicted_class']
            )
            
            # Compute explanation similarity
            similarity = self.explainability.compute_explanation_similarity(cam_heatmap, ig_attribution)
            
            # Analyze activation regions
            cam_activated_regions = np.sum(cam_heatmap > np.percentile(cam_heatmap, 75))
            cam_concentration = np.percentile(cam_heatmap, 95)  # Concentration at top 5%
            
            # Check mask overlap if provided
            mask_overlap = None
            if mask is not None:
                mask_norm = mask / (mask.max() + 1e-10)
                mask_overlap = np.sum(cam_heatmap * mask_norm) / (np.sum(mask_norm) + 1e-10)
            
            output_summary = {
                'cam_generated': True,
                'ig_generated': True,
                'similarity_score': similarity['cosine_similarity'],
                'activated_region_count': int(cam_activated_regions),
                'activation_concentration': float(cam_concentration),
                'mask_overlap': float(mask_overlap) if mask_overlap else None
            }
            
            evidence = {
                'gradcam_heatmap': cam_heatmap.tolist() if cam_heatmap.size < 10000 else 'large_array',
                'integrated_gradients': ig_attribution.tolist() if ig_attribution.size < 10000 else 'large_array',
                'explanation_similarity': similarity
            }
            
            end_time = time.time()
            
            return AgentResult(
                agent_name='Vision Investigator',
                status='SUCCESS',
                start_time=start_time,
                end_time=end_time,
                latency_ms=(end_time - start_time) * 1000,
                input_summary={'image_shape': image_data.shape, 'target_class': prediction['predicted_class']},
                output_summary=output_summary,
                evidence=evidence
            )
        
        except Exception as e:
            end_time = time.time()
            return AgentResult(
                agent_name='Vision Investigator',
                status='FAILED',
                start_time=start_time,
                end_time=end_time,
                latency_ms=(end_time - start_time) * 1000,
                input_summary={'image_shape': image_data.shape},
                output_summary={},
                error=str(e),
                evidence={}
            )


class RobustnessInvestigator:
    """
    Tests model robustness through controlled perturbations
    """
    
    def __init__(self, model, robustness_module):
        self.model = model
        self.robustness = robustness_module
    
    def investigate(self, image_data: np.ndarray) -> AgentResult:
        """
        Investigate model robustness
        
        Args:
            image_data: Original image
        
        Returns:
            AgentResult with perturbation findings
        """
        start_time = time.time()
        
        try:
            # Run perturbation suite
            results = self.robustness.run_perturbation_suite(image_data)
            
            # Analyze results
            max_confidence_delta = max(abs(r['confidence_delta']) for r in results) if results else 0
            prediction_flips = sum(1 for r in results if r['prediction_changed'])
            avg_delta = np.mean([abs(r['confidence_delta']) for r in results]) if results else 0
            
            # Identify most sensitive perturbation
            if results:
                most_sensitive = max(results, key=lambda r: abs(r['confidence_delta']))
                most_sensitive_type = most_sensitive['perturbation_type']
                most_sensitive_delta = most_sensitive['confidence_delta']
            else:
                most_sensitive_type = 'N/A'
                most_sensitive_delta = 0
            
            output_summary = {
                'perturbations_tested': len(results),
                'max_confidence_delta': float(max_confidence_delta),
                'prediction_flips': int(prediction_flips),
                'average_delta': float(avg_delta),
                'most_sensitive_perturbation': most_sensitive_type,
                'flip_rate': float(prediction_flips / len(results)) if results else 0
            }
            
            evidence = {
                'perturbation_results': results[:5],  # Top 5 most impactful
                'sensitivity_analysis': {
                    'max_delta': float(max_confidence_delta),
                    'avg_delta': float(avg_delta),
                    'total_tested': len(results)
                }
            }
            
            end_time = time.time()
            
            return AgentResult(
                agent_name='Robustness Investigator',
                status='SUCCESS',
                start_time=start_time,
                end_time=end_time,
                latency_ms=(end_time - start_time) * 1000,
                input_summary={'image_shape': image_data.shape, 'perturbations': len(results)},
                output_summary=output_summary,
                evidence=evidence
            )
        
        except Exception as e:
            end_time = time.time()
            return AgentResult(
                agent_name='Robustness Investigator',
                status='FAILED',
                start_time=start_time,
                end_time=end_time,
                latency_ms=(end_time - start_time) * 1000,
                input_summary={'image_shape': image_data.shape},
                output_summary={},
                error=str(e),
                evidence={}
            )


class UncertaintyInvestigator:
    """
    Analyzes model uncertainty
    """
    
    def __init__(self, model, robustness_module):
        self.model = model
        self.robustness = robustness_module
        self.uncertainty_estimator = robustness_module.UncertaintyEstimator(model)
    
    def investigate(self, image_data: np.ndarray, prediction: Dict) -> AgentResult:
        """
        Investigate model uncertainty
        
        Args:
            image_data: Original image
            prediction: Model prediction
        
        Returns:
            AgentResult with uncertainty findings
        """
        start_time = time.time()
        
        try:
            uncertainty = self.uncertainty_estimator.estimate_uncertainty(image_data)
            
            # Determine uncertainty level
            norm_entropy = uncertainty['normalized_entropy']
            if norm_entropy > 0.8:
                uncertainty_level = 'HIGH'
            elif norm_entropy > 0.5:
                uncertainty_level = 'MEDIUM'
            else:
                uncertainty_level = 'LOW'
            
            output_summary = {
                'entropy': float(uncertainty['entropy']),
                'normalized_entropy': float(norm_entropy),
                'uncertainty_level': uncertainty_level,
                'confidence_gap': float(uncertainty['confidence_gap']),
                'top_confidence': float(uncertainty['top_confidence'])
            }
            
            evidence = uncertainty
            
            end_time = time.time()
            
            return AgentResult(
                agent_name='Uncertainty Investigator',
                status='SUCCESS',
                start_time=start_time,
                end_time=end_time,
                latency_ms=(end_time - start_time) * 1000,
                input_summary={'predicted_class': prediction['predicted_class']},
                output_summary=output_summary,
                evidence=evidence
            )
        
        except Exception as e:
            end_time = time.time()
            return AgentResult(
                agent_name='Uncertainty Investigator',
                status='FAILED',
                start_time=start_time,
                end_time=end_time,
                latency_ms=(end_time - start_time) * 1000,
                input_summary={},
                output_summary={},
                error=str(e),
                evidence={}
            )


class FailureAnalysisInvestigator:
    """
    Analyzes potential failure modes
    """
    
    def investigate(self, vision_result: AgentResult, robustness_result: AgentResult,
                   uncertainty_result: AgentResult) -> AgentResult:
        """
        Analyze failure modes from other agents
        
        Args:
            vision_result: Output from Vision Investigator
            robustness_result: Output from Robustness Investigator
            uncertainty_result: Output from Uncertainty Investigator
        
        Returns:
            AgentResult with failure analysis
        """
        start_time = time.time()
        
        try:
            failures = []
            
            # Check robustness
            if robustness_result.status == 'SUCCESS':
                rob_data = robustness_result.output_summary
                if rob_data.get('prediction_flips', 0) > 3:
                    failures.append({
                        'type': 'Prediction Instability',
                        'severity': 'HIGH',
                        'evidence': f"{rob_data.get('prediction_flips', 0)} prediction flips under perturbation",
                        'confidence_delta': rob_data.get('max_confidence_delta', 0)
                    })
                elif rob_data.get('max_confidence_delta', 0) > 0.3:
                    failures.append({
                        'type': 'Confidence Degradation',
                        'severity': 'MEDIUM',
                        'evidence': f"Confidence delta up to {rob_data.get('max_confidence_delta', 0):.1%}",
                        'confidence_delta': rob_data.get('max_confidence_delta', 0)
                    })
            
            # Check uncertainty
            if uncertainty_result.status == 'SUCCESS':
                unc_data = uncertainty_result.output_summary
                if unc_data.get('uncertainty_level') == 'HIGH':
                    failures.append({
                        'type': 'High Uncertainty',
                        'severity': 'MEDIUM',
                        'evidence': f"Entropy: {unc_data.get('entropy', 0):.3f}",
                        'entropy': unc_data.get('entropy', 0)
                    })
            
            # Check explanation agreement
            if vision_result.status == 'SUCCESS':
                vis_data = vision_result.output_summary
                sim = vis_data.get('similarity_score', 0)
                if sim < 0.3:
                    failures.append({
                        'type': 'Explanation Disagreement',
                        'severity': 'MEDIUM',
                        'evidence': f"Low agreement between Grad-CAM and Integrated Gradients: {sim:.2f}",
                        'similarity': sim
                    })
            
            output_summary = {
                'failure_count': len(failures),
                'critical_failures': sum(1 for f in failures if f['severity'] == 'HIGH'),
                'most_critical': failures[0]['type'] if failures else 'None'
            }
            
            evidence = {
                'failures': failures,
                'analysis_complete': True
            }
            
            end_time = time.time()
            
            return AgentResult(
                agent_name='Failure Analysis Investigator',
                status='SUCCESS',
                start_time=start_time,
                end_time=end_time,
                latency_ms=(end_time - start_time) * 1000,
                input_summary={'agents_analyzed': 3},
                output_summary=output_summary,
                evidence=evidence
            )
        
        except Exception as e:
            end_time = time.time()
            return AgentResult(
                agent_name='Failure Analysis Investigator',
                status='FAILED',
                start_time=start_time,
                end_time=end_time,
                latency_ms=(end_time - start_time) * 1000,
                input_summary={},
                output_summary={},
                error=str(e),
                evidence={}
            )


class ReliabilityJudge:
    """
    Makes TRUST/REVIEW/ABSTAIN decision based on all evidence
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or self._default_config()
    
    def _default_config(self) -> Dict:
        """Default decision thresholds"""
        return {
            'high_confidence_threshold': 0.85,
            'low_uncertainty_threshold': 0.3,
            'acceptable_flip_rate': 0.1,
            'acceptable_confidence_delta': 0.15,
            'explanation_agreement_threshold': 0.4
        }
    
    def judge(self, prediction: Dict, vision_result: AgentResult,
             robustness_result: AgentResult, uncertainty_result: AgentResult,
             failure_result: AgentResult) -> AgentResult:
        """
        Make reliability judgment
        
        Returns:
            AgentResult with TRUST/REVIEW/ABSTAIN decision
        """
        start_time = time.time()
        
        try:
            confidence = prediction.get('confidence', 0)
            triggered_rules = []
            evidence_summary = {}
            
            # Extract metrics from other agents
            vision_ok = vision_result.status == 'SUCCESS'
            rob_ok = robustness_result.status == 'SUCCESS'
            unc_ok = uncertainty_result.status == 'SUCCESS'
            
            rob_data = robustness_result.output_summary if rob_ok else {}
            unc_data = uncertainty_result.output_summary if unc_ok else {}
            vis_data = vision_result.output_summary if vision_ok else {}
            fail_data = failure_result.output_summary if failure_result.status == 'SUCCESS' else {}
            
            # Scoring system
            trust_score = 0.0
            
            # Rule 1: High confidence
            if confidence >= self.config['high_confidence_threshold']:
                trust_score += 0.25
                triggered_rules.append('High confidence')
                evidence_summary['confidence_score'] = 'PASS'
            else:
                evidence_summary['confidence_score'] = 'FAIL'
            
            # Rule 2: Low uncertainty
            norm_entropy = unc_data.get('normalized_entropy', 1.0)
            if norm_entropy <= self.config['low_uncertainty_threshold']:
                trust_score += 0.25
                triggered_rules.append('Low uncertainty')
                evidence_summary['uncertainty_score'] = 'PASS'
            else:
                evidence_summary['uncertainty_score'] = 'FAIL'
            
            # Rule 3: Robustness
            flip_rate = rob_data.get('flip_rate', 1.0)
            max_delta = rob_data.get('max_confidence_delta', 1.0)
            if flip_rate <= self.config['acceptable_flip_rate'] and \
               abs(max_delta) <= self.config['acceptable_confidence_delta']:
                trust_score += 0.25
                triggered_rules.append('Stable predictions')
                evidence_summary['robustness_score'] = 'PASS'
            else:
                evidence_summary['robustness_score'] = 'FAIL'
            
            # Rule 4: Explanation agreement
            similarity = vis_data.get('similarity_score', 0)
            if similarity >= self.config['explanation_agreement_threshold']:
                trust_score += 0.25
                triggered_rules.append('Good explanation agreement')
                evidence_summary['explanation_score'] = 'PASS'
            else:
                evidence_summary['explanation_score'] = 'FAIL'
            
            # Make decision
            if trust_score >= 0.75:
                verdict = 'TRUST'
            elif trust_score >= 0.5:
                verdict = 'REVIEW'
            else:
                verdict = 'ABSTAIN'
            
            # Add critical failures
            if fail_data.get('critical_failures', 0) > 0:
                verdict = 'ABSTAIN'
            
            output_summary = {
                'verdict': verdict,
                'trust_score': float(trust_score),
                'triggered_rules': triggered_rules,
                'critical_failures': fail_data.get('critical_failures', 0),
                'reasoning': f"Score {trust_score:.2f}: {', '.join(triggered_rules)}"
            }
            
            evidence = {
                'verdict': verdict,
                'trust_score': float(trust_score),
                'evidence_summary': evidence_summary,
                'triggered_rules': triggered_rules,
                'failure_analysis': fail_data.get('failures', [])
            }
            
            end_time = time.time()
            
            return AgentResult(
                agent_name='Reliability Judge',
                status='SUCCESS',
                start_time=start_time,
                end_time=end_time,
                latency_ms=(end_time - start_time) * 1000,
                input_summary={'all_agents': 4},
                output_summary=output_summary,
                evidence=evidence
            )
        
        except Exception as e:
            end_time = time.time()
            return AgentResult(
                agent_name='Reliability Judge',
                status='FAILED',
                start_time=start_time,
                end_time=end_time,
                latency_ms=(end_time - start_time) * 1000,
                input_summary={},
                output_summary={},
                error=str(e),
                evidence={}
            )
