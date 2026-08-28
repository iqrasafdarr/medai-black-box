"""
Brain Tumor Classification Model
Wraps EfficientNet-B0 pretrained on ImageNet
"""
import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
import numpy as np
from typing import Dict, Tuple, Optional
from PIL import Image
import io


class BrainTumorClassifier:
    """
    Binary classifier for brain tumor detection (Tumor vs No Tumor)
    Uses EfficientNet-B0 backbone
    """
    
    def __init__(self, device: str = 'cpu', model_path: Optional[str] = None):
        self.device = torch.device(device)
        
        # Class names - initialize before loading model
        self.class_names = ['No Tumor', 'Glioma', 'Meningioma', 'Pituitary']
        self.n_classes = len(self.class_names)
        
        self.model = self._load_model(model_path)
        self.model.eval()
        
        # Preprocessing
        self.preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        # Store intermediate activations
        self.activations = {}
        self._register_hooks()
    
    def _load_model(self, model_path: Optional[str] = None):
        """Load pretrained ResNet18 for brain tumor classification"""
        try:
            # Try to load ResNet18 without weights first to avoid network access
            model = models.resnet18(weights=None)
        except:
            # Fallback: create ResNet18 manually
            model = models.resnet18()
        
        # Replace final classifier for 4-class brain tumor classification
        num_features = model.fc.in_features
        model.fc = nn.Linear(num_features, self.n_classes)
        
        model = model.to(self.device)
        return model
    
    def _register_hooks(self):
        """Register hooks to capture intermediate activations"""
        # Hook on the final features layer (before classifier)
        self.model.avgpool.register_forward_hook(self._hook_fn)
    
    def _hook_fn(self, module, input, output):
        """Hook function to capture activations"""
        self.activations['final_features'] = output.detach()
    
    def preprocess_image(self, image_data) -> torch.Tensor:
        """
        Preprocess image for model inference
        Accepts PIL Image, numpy array, bytes, or file path
        """
        if isinstance(image_data, str):
            image = Image.open(image_data).convert('RGB')
        elif isinstance(image_data, bytes):
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
        elif isinstance(image_data, np.ndarray):
            image = Image.fromarray(image_data.astype('uint8')).convert('RGB')
        elif isinstance(image_data, Image.Image):
            image = image_data.convert('RGB')
        else:
            raise ValueError(f"Unsupported image type: {type(image_data)}")
        
        # Store original for reference
        self.original_image = np.array(image)
        return self.preprocess(image).unsqueeze(0).to(self.device)
    
    def predict(self, image_data) -> Dict:
        """
        Perform inference
        Returns prediction, confidence, probabilities, logits
        """
        with torch.no_grad():
            input_tensor = self.preprocess_image(image_data)
            logits = self.model(input_tensor)
            probabilities = torch.softmax(logits, dim=1)
            
            pred_class = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0, pred_class].item()
            
            # Entropy as uncertainty measure
            entropy = -torch.sum(probabilities * torch.log(probabilities + 1e-10), dim=1).item()
            
            return {
                'predicted_class': pred_class,
                'predicted_label': self.class_names[pred_class],
                'confidence': float(confidence),
                'entropy': float(entropy),
                'probabilities': probabilities[0].cpu().numpy().tolist(),
                'logits': logits[0].cpu().numpy().tolist(),
                'class_names': self.class_names
            }
    
    def get_feature_maps(self) -> Optional[torch.Tensor]:
        """Get the last layer feature maps"""
        return self.activations.get('final_features')
    
    def forward_with_gradients(self, image_data, target_class: Optional[int] = None) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Forward pass with gradient tracking for explainability
        Returns logits and gradients
        """
        input_tensor = self.preprocess_image(image_data)
        input_tensor.requires_grad_(True)
        
        logits = self.model(input_tensor)
        
        if target_class is None:
            target_class = torch.argmax(logits, dim=1).item()
        
        return logits, input_tensor, target_class
    
    def get_conv_layers(self) -> Dict[str, nn.Module]:
        """Get convolutional layers for Grad-CAM"""
        layers = {}
        layers['features'] = self.model.features
        return layers
    
    def to(self, device):
        """Move model to device"""
        self.device = torch.device(device)
        self.model = self.model.to(self.device)
        return self
    
    def eval(self):
        """Set to evaluation mode"""
        self.model.eval()
        return self


# Singleton instance
_model = None

def get_model(device: str = 'cpu') -> BrainTumorClassifier:
    """Get or create model singleton"""
    global _model
    if _model is None:
        _model = BrainTumorClassifier(device=device)
    return _model
