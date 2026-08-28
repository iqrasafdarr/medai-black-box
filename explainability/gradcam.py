"""
Grad-CAM: Gradient-weighted Class Activation Mapping
Generates visual explanations for model decisions
"""
import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Optional, Tuple
import cv2


class GradCAM:
    """
    Grad-CAM implementation for visual explanations
    Computes class activation maps using gradients
    """
    
    def __init__(self, model: nn.Module, target_layer: str = 'features'):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self._register_hooks()
    
    def _register_hooks(self):
        """Register forward and backward hooks"""
        # Get the target layer - handle both EfficientNet and ResNet
        if self.target_layer == 'features':
            # Try EfficientNet first
            if hasattr(self.model, 'features'):
                target = self.model.features[-1]
            # Fallback to ResNet layer4
            elif hasattr(self.model, 'layer4'):
                target = self.model.layer4[-1]
            else:
                # Last available conv layer
                target = list(self.model.modules())[-2]
        else:
            target = getattr(self.model, self.target_layer)
        
        def forward_hook(module, input, output):
            self.activations = output.detach()
        
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()
        
        target.register_forward_hook(forward_hook)
        target.register_full_backward_hook(backward_hook)
    
    def generate(self, input_tensor: torch.Tensor, target_class: Optional[int] = None) -> np.ndarray:
        """
        Generate Grad-CAM heatmap
        
        Args:
            input_tensor: Input image tensor (B, C, H, W)
            target_class: Target class index for which to generate CAM
        
        Returns:
            Grad-CAM heatmap (H, W)
        """
        self.model.eval()
        
        # Forward pass
        output = self.model(input_tensor)
        
        # Get target class if not specified
        if target_class is None:
            target_class = torch.argmax(output, dim=1).item()
        
        # Backward pass
        self.model.zero_grad()
        score = output[0, target_class]
        score.backward()
        
        # Compute Grad-CAM
        gradients = self.gradients[0]  # (C, H, W)
        activations = self.activations[0]  # (C, H, W)
        
        # Weight each channel by its gradient
        weights = gradients.mean(dim=(1, 2))  # (C,)
        
        # Weighted activation sum
        cam = torch.zeros(activations.shape[1:], device=activations.device)
        for i, w in enumerate(weights):
            cam += w * activations[i]
        
        # ReLU to keep only positive contributions
        cam = torch.relu(cam)
        
        # Normalize to [0, 1]
        cam_min = cam.min()
        cam_max = cam.max()
        if cam_max > cam_min:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = torch.zeros_like(cam)
        
        return cam.cpu().numpy()
    
    def overlay_on_image(self, image: np.ndarray, cam: np.ndarray, alpha: float = 0.5) -> np.ndarray:
        """
        Overlay Grad-CAM heatmap on original image
        
        Args:
            image: Original image (H, W, 3) in range [0, 255]
            cam: Grad-CAM heatmap (H, W) in range [0, 1]
            alpha: Transparency of overlay
        
        Returns:
            Overlaid image (H, W, 3)
        """
        # Resize CAM to match image size
        h, w = image.shape[:2]
        cam_resized = cv2.resize(cam, (w, h))
        
        # Convert to heatmap (jet colormap)
        heatmap = cv2.applyColorMap((cam_resized * 255).astype('uint8'), cv2.COLORMAP_JET)
        
        # Blend with original image
        overlaid = cv2.addWeighted(image, 1 - alpha, heatmap, alpha, 0)
        
        return overlaid


class IntegratedGradients:
    """
    Integrated Gradients for model-agnostic feature attribution
    Integrates gradients along a straight line from baseline to input
    """
    
    def __init__(self, model: nn.Module, device: str = 'cpu'):
        self.model = model
        self.device = torch.device(device)
    
    def generate(self, input_tensor: torch.Tensor, target_class: Optional[int] = None,
                 steps: int = 50, baseline: Optional[torch.Tensor] = None) -> np.ndarray:
        """
        Generate Integrated Gradients attribution
        
        Args:
            input_tensor: Input image tensor (B, C, H, W)
            target_class: Target class for attribution
            steps: Number of integration steps
            baseline: Baseline image (default: black image)
        
        Returns:
            Integrated Gradients attribution map
        """
        self.model.eval()
        
        if baseline is None:
            baseline = torch.zeros_like(input_tensor)
        
        # Get target class if not specified
        with torch.no_grad():
            output = self.model(input_tensor)
            if target_class is None:
                target_class = torch.argmax(output, dim=1).item()
        
        # Accumulate gradients
        accumulated_grads = torch.zeros_like(input_tensor)
        
        for step in range(steps):
            # Interpolate between baseline and input
            alpha = step / steps
            interpolated = baseline + alpha * (input_tensor - baseline)
            interpolated.requires_grad_(True)
            
            # Forward pass
            output = self.model(interpolated)
            score = output[0, target_class]
            
            # Backward pass
            if interpolated.grad is not None:
                interpolated.grad.zero_()
            
            score.backward(retain_graph=(step < steps - 1))
            
            # Accumulate gradients
            accumulated_grads += interpolated.grad
        
        # Integrate
        integrated_grads = (input_tensor - baseline) * accumulated_grads / steps
        
        # Take absolute value and average across channels
        attribution = torch.abs(integrated_grads).mean(dim=1)[0]
        
        # Normalize to [0, 1]
        attr_min = attribution.min()
        attr_max = attribution.max()
        if attr_max > attr_min:
            attribution = (attribution - attr_min) / (attr_max - attr_min)
        else:
            attribution = torch.zeros_like(attribution)
        
        return attribution.detach().cpu().numpy()
    
    def overlay_on_image(self, image: np.ndarray, attribution: np.ndarray, alpha: float = 0.5) -> np.ndarray:
        """
        Overlay Integrated Gradients on original image
        
        Args:
            image: Original image (H, W, 3) in range [0, 255]
            attribution: Attribution map (H, W) in range [0, 1]
            alpha: Transparency of overlay
        
        Returns:
            Overlaid image (H, W, 3)
        """
        # Resize attribution to match image size
        h, w = image.shape[:2]
        attribution_resized = cv2.resize(attribution, (w, h))
        
        # Convert to heatmap (hot colormap for integrated gradients)
        heatmap = cv2.applyColorMap((attribution_resized * 255).astype('uint8'), cv2.COLORMAP_HOT)
        
        # Blend with original image
        overlaid = cv2.addWeighted(image, 1 - alpha, heatmap, alpha, 0)
        
        return overlaid


def compute_explanation_overlap(cam: np.ndarray, ig: np.ndarray) -> float:
    """
    Compute overlap between Grad-CAM and Integrated Gradients
    Measures if both explainability methods agree on important regions
    
    Args:
        cam: Grad-CAM heatmap (H, W) in [0, 1]
        ig: Integrated Gradients attribution (H, W) in [0, 1]
    
    Returns:
        Overlap score in [0, 1] (higher = better agreement)
    """
    # Threshold at 50th percentile
    cam_binary = (cam > np.percentile(cam, 50)).astype(float)
    ig_binary = (ig > np.percentile(ig, 50)).astype(float)
    
    # Compute intersection over union
    intersection = np.sum(cam_binary * ig_binary)
    union = np.sum(np.maximum(cam_binary, ig_binary))
    
    if union == 0:
        return 0.0
    
    iou = intersection / union
    return float(iou)


def compute_explanation_similarity(cam: np.ndarray, ig: np.ndarray) -> Dict[str, float]:
    """
    Compute multiple similarity measures between explanations
    
    Args:
        cam: Grad-CAM heatmap
        ig: Integrated Gradients attribution
    
    Returns:
        Dictionary with multiple similarity metrics
    """
    # Ensure same shape
    h, w = cam.shape
    ig_resized = cv2.resize(ig, (w, h))
    
    # Cosine similarity
    cam_flat = cam.flatten()
    ig_flat = ig_resized.flatten()
    
    cosine_sim = np.dot(cam_flat, ig_flat) / (np.linalg.norm(cam_flat) * np.linalg.norm(ig_flat) + 1e-10)
    
    # Pearson correlation
    cam_centered = cam_flat - np.mean(cam_flat)
    ig_centered = ig_flat - np.mean(ig_flat)
    pearson = np.dot(cam_centered, ig_centered) / (np.linalg.norm(cam_centered) * np.linalg.norm(ig_centered) + 1e-10)
    
    # Overlap (IoU)
    overlap = compute_explanation_overlap(cam, ig_resized)
    
    return {
        'cosine_similarity': float(cosine_sim),
        'pearson_correlation': float(pearson),
        'overlap_iou': float(overlap)
    }
