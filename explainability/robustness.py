"""
Robustness Testing Module
Performs controlled perturbations to test model stability
"""
import numpy as np
import cv2
import torch
from typing import Dict, List, Optional, Tuple
import time


class PerturbationTester:
    """
    Performs various perturbations on images to test model robustness
    """
    
    def __init__(self, model, device: str = 'cpu'):
        self.model = model
        self.device = torch.device(device)
    
    def brightness_perturbation(self, image: np.ndarray, factor: float) -> np.ndarray:
        """Adjust brightness"""
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV).astype(np.float32)
        hsv[:, :, 2] = cv2.multiply(hsv[:, :, 2], factor)
        hsv[:, :, 2] = np.clip(hsv[:, :, 2], 0, 255)
        return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)
    
    def contrast_perturbation(self, image: np.ndarray, factor: float) -> np.ndarray:
        """Adjust contrast"""
        adjusted = cv2.convertScaleAbs(image.astype(np.float32), alpha=factor, beta=0)
        return np.clip(adjusted, 0, 255).astype(np.uint8)
    
    def gaussian_noise_perturbation(self, image: np.ndarray, std: float) -> np.ndarray:
        """Add Gaussian noise"""
        noise = np.random.normal(0, std, image.shape)
        noisy = image.astype(np.float32) + noise
        return np.clip(noisy, 0, 255).astype(np.uint8)
    
    def blur_perturbation(self, image: np.ndarray, kernel_size: int) -> np.ndarray:
        """Apply Gaussian blur"""
        if kernel_size % 2 == 0:
            kernel_size += 1
        return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)
    
    def rotation_perturbation(self, image: np.ndarray, angle: float) -> np.ndarray:
        """Rotate image"""
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, matrix, (w, h), borderMode=cv2.BORDER_REFLECT)
        return rotated
    
    def occlusion_perturbation(self, image: np.ndarray, mask_size: int, x: int, y: int, 
                               occlusion_value: int = 0) -> np.ndarray:
        """Occlude a region of the image"""
        occluded = image.copy()
        x_end = min(x + mask_size, image.shape[1])
        y_end = min(y + mask_size, image.shape[0])
        occluded[y:y_end, x:x_end] = occlusion_value
        return occluded
    
    def masking_perturbation(self, image: np.ndarray, mask: np.ndarray, 
                             fill_value: int = 0) -> np.ndarray:
        """Apply binary mask to image"""
        masked = image.copy()
        if mask.shape[:2] != image.shape[:2]:
            mask = cv2.resize(mask, (image.shape[1], image.shape[0]))
        mask_3d = np.stack([mask] * 3, axis=2) if len(mask.shape) == 2 else mask
        masked[mask_3d == 0] = fill_value
        return masked
    
    def test_perturbation(self, image: np.ndarray, perturbation_type: str, 
                         param: float) -> Dict:
        """
        Test a single perturbation
        
        Args:
            image: Original image
            perturbation_type: Type of perturbation
            param: Perturbation parameter
        
        Returns:
            Dictionary with results
        """
        # Create perturbed image
        if perturbation_type == 'brightness':
            perturbed = self.brightness_perturbation(image, param)
        elif perturbation_type == 'contrast':
            perturbed = self.contrast_perturbation(image, param)
        elif perturbation_type == 'gaussian_noise':
            perturbed = self.gaussian_noise_perturbation(image, param)
        elif perturbation_type == 'blur':
            perturbed = self.blur_perturbation(image, int(param))
        elif perturbation_type == 'rotation':
            perturbed = self.rotation_perturbation(image, param)
        else:
            return {'error': f'Unknown perturbation type: {perturbation_type}'}
        
        # Get predictions
        start_time = time.time()
        original_pred = self.model.predict(image)
        perturbed_pred = self.model.predict(perturbed)
        latency_ms = (time.time() - start_time) * 1000
        
        # Compute deltas
        pred_changed = original_pred['predicted_class'] != perturbed_pred['predicted_class']
        confidence_delta = perturbed_pred['confidence'] - original_pred['confidence']
        entropy_delta = perturbed_pred['entropy'] - original_pred['entropy']
        
        return {
            'perturbation_type': perturbation_type,
            'parameter': float(param),
            'original_prediction': original_pred['predicted_class'],
            'original_label': original_pred['predicted_label'],
            'original_confidence': original_pred['confidence'],
            'perturbed_prediction': perturbed_pred['predicted_class'],
            'perturbed_label': perturbed_pred['predicted_label'],
            'perturbed_confidence': perturbed_pred['confidence'],
            'prediction_changed': bool(pred_changed),
            'confidence_delta': float(confidence_delta),
            'entropy_delta': float(entropy_delta),
            'latency_ms': float(latency_ms),
            'original_entropy': original_pred['entropy'],
            'perturbed_entropy': perturbed_pred['entropy']
        }
    
    def run_perturbation_suite(self, image: np.ndarray) -> List[Dict]:
        """
        Run a comprehensive suite of perturbations
        
        Returns:
            List of perturbation results sorted by sensitivity
        """
        results = []
        
        # Brightness variations
        for factor in [0.7, 0.8, 0.9, 1.1, 1.2, 1.3]:
            result = self.test_perturbation(image, 'brightness', factor)
            results.append(result)
        
        # Contrast variations
        for factor in [0.7, 0.8, 0.9, 1.1, 1.2, 1.3]:
            result = self.test_perturbation(image, 'contrast', factor)
            results.append(result)
        
        # Gaussian noise
        for std in [5, 10, 15, 20, 30]:
            result = self.test_perturbation(image, 'gaussian_noise', std)
            results.append(result)
        
        # Blur
        for kernel_size in [3, 5, 7, 11]:
            result = self.test_perturbation(image, 'blur', kernel_size)
            results.append(result)
        
        # Rotation
        for angle in [-15, -10, -5, 5, 10, 15]:
            result = self.test_perturbation(image, 'rotation', angle)
            results.append(result)
        
        # Remove errors
        results = [r for r in results if 'error' not in r]
        
        # Sort by confidence delta magnitude
        results.sort(key=lambda x: abs(x['confidence_delta']), reverse=True)
        
        return results


class UncertaintyEstimator:
    """
    Estimate model uncertainty through multiple methods
    """
    
    def __init__(self, model, device: str = 'cpu'):
        self.model = model
        self.device = torch.device(device)
    
    def estimate_uncertainty(self, image: np.ndarray) -> Dict[str, float]:
        """
        Estimate uncertainty through multiple methods
        
        Args:
            image: Input image
        
        Returns:
            Dictionary with uncertainty metrics
        """
        pred = self.model.predict(image)
        
        # Entropy (already computed)
        entropy = pred['entropy']
        
        # Normalized entropy (0-1)
        n_classes = len(pred['class_names'])
        max_entropy = np.log(n_classes)
        normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0
        
        # Confidence gap (difference between top-2 predictions)
        probs = np.array(pred['probabilities'])
        top_indices = np.argsort(probs)[-2:]
        confidence_gap = probs[top_indices[1]] - probs[top_indices[0]]
        
        # Margin (difference between top and runner-up)
        margin = probs.max() - np.partition(probs, -2)[-2]
        
        # Calibration uncertainty (1 - max_prob)
        calibration_uncertainty = 1 - probs.max()
        
        return {
            'entropy': float(entropy),
            'normalized_entropy': float(normalized_entropy),
            'confidence_gap': float(confidence_gap),
            'margin': float(margin),
            'calibration_uncertainty': float(calibration_uncertainty),
            'top_confidence': float(probs.max()),
            'second_highest_class': pred['class_names'][top_indices[0]],
            'second_highest_prob': float(probs[top_indices[0]])
        }


def identify_model_weakness(perturbation_results: List[Dict]) -> Dict:
    """
    Identify computational weakness from perturbation results
    
    Args:
        perturbation_results: List of perturbation test results
    
    Returns:
        Dictionary with weakness analysis
    """
    if not perturbation_results:
        return {'error': 'No perturbation results'}
    
    # Find most sensitive perturbation
    max_delta_idx = max(range(len(perturbation_results)), 
                       key=lambda i: abs(perturbation_results[i]['confidence_delta']))
    most_sensitive = perturbation_results[max_delta_idx]
    
    # Count prediction flips
    prediction_flips = sum(1 for r in perturbation_results if r['prediction_changed'])
    
    # Identify failure pattern
    if most_sensitive['confidence_delta'] < -0.3:
        failure_mode = 'Confidence degradation'
        severity = 'High' if most_sensitive['confidence_delta'] < -0.5 else 'Medium'
    elif most_sensitive['prediction_changed']:
        failure_mode = 'Prediction instability'
        severity = 'High'
    else:
        failure_mode = 'Minor instability'
        severity = 'Low'
    
    return {
        'most_sensitive_perturbation': most_sensitive['perturbation_type'],
        'most_sensitive_parameter': most_sensitive['parameter'],
        'largest_confidence_change': float(most_sensitive['confidence_delta']),
        'prediction_flips_total': int(prediction_flips),
        'flip_rate': float(prediction_flips / len(perturbation_results)) if perturbation_results else 0,
        'failure_mode': failure_mode,
        'severity': severity,
        'average_confidence_delta': float(np.mean([abs(r['confidence_delta']) for r in perturbation_results]))
    }
