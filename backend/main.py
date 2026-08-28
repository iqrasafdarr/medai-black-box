"""
FastAPI Backend for MEDAI BLACK BOX
Orchestrates investigation agents and serves inference
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import io
import numpy as np
from PIL import Image
import torch
from typing import Optional, List, Dict

# Import project modules
from models.brain_tumor_model import BrainTumorClassifier
from explainability.gradcam import GradCAM, IntegratedGradients, compute_explanation_similarity
from explainability.robustness import PerturbationTester, UncertaintyEstimator, identify_model_weakness
from agents.investigation_agents import (
    VisionInvestigator, RobustnessInvestigator, UncertaintyInvestigator,
    FailureAnalysisInvestigator, ReliabilityJudge, AgentResult
)

# Initialize FastAPI
app = FastAPI(
    title="MEDAI BLACK BOX",
    description="Interactive Forensic Laboratory for Auditing Medical AI",
    version="1.0.0"
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
device = 'cpu'
model = None
explainability_module = None
investigation_agents = None


class ExplainabilityModule:
    """Container for explainability tools"""
    def __init__(self, model, device):
        self.gradcam = GradCAM(model.model, target_layer='features')
        self.integrated_gradients = IntegratedGradients(model.model, device=device)
    
    def compute_explanation_similarity(self, cam, ig):
        """Wrapper for similarity computation"""
        return compute_explanation_similarity(cam, ig)


class InvestigationAgents:
    """Container for all investigation agents"""
    def __init__(self, model, explainability_module, robustness_module):
        self.vision_investigator = VisionInvestigator(model, explainability_module)
        self.robustness_investigator = RobustnessInvestigator(model, robustness_module)
        self.uncertainty_investigator = UncertaintyInvestigator(model, robustness_module)
        self.failure_investigator = FailureAnalysisInvestigator()
        self.reliability_judge = ReliabilityJudge()


class RobustnessModule:
    """Container for robustness tools"""
    def __init__(self, model, device):
        self.perturbation_tester = PerturbationTester(model, device=device)
        self.UncertaintyEstimator = UncertaintyEstimator


@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    global model, explainability_module, investigation_agents
    
    print("🚀 Initializing MEDAI BLACK BOX...")
    
    # Load model
    model = BrainTumorClassifier(device=device)
    print("✓ Brain Tumor Classifier loaded")
    
    # Initialize explainability
    explainability_module = ExplainabilityModule(model, device)
    print("✓ Explainability module (Grad-CAM, Integrated Gradients) initialized")
    
    # Initialize robustness
    robustness_module = RobustnessModule(model, device)
    print("✓ Robustness module initialized")
    
    # Initialize agents
    investigation_agents = InvestigationAgents(model, explainability_module, robustness_module)
    print("✓ Investigation agents initialized")
    
    print("✅ MEDAI BLACK BOX ready")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "MEDAI BLACK BOX",
        "subtitle": "Interactive Forensic Laboratory for Auditing Medical AI",
        "version": "1.0.0",
        "status": "ready"
    }


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok"}


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    """
    Quick prediction endpoint
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        image_array = np.array(image)
        
        prediction = model.predict(image_array)
        
        return {
            "status": "success",
            "prediction": prediction
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/autopsy")
async def ai_autopsy(file: UploadFile = File(...)):
    """
    Main AI Autopsy endpoint
    Runs all investigation agents and determines TRUST/REVIEW/ABSTAIN
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        image_array = np.array(image)
        
        # Initial prediction
        prediction = model.predict(image_array)
        
        # Run investigation agents
        vision_result = investigation_agents.vision_investigator.investigate(
            image_array, prediction
        )
        
        robustness_result = investigation_agents.robustness_investigator.investigate(
            image_array
        )
        
        uncertainty_result = investigation_agents.uncertainty_investigator.investigate(
            image_array, prediction
        )
        
        failure_result = investigation_agents.failure_investigator.investigate(
            vision_result, robustness_result, uncertainty_result
        )
        
        reliability_result = investigation_agents.reliability_judge.judge(
            prediction, vision_result, robustness_result, 
            uncertainty_result, failure_result
        )
        
        # Compile forensic report
        report = {
            "status": "success",
            "case": {
                "image_shape": image_array.shape,
                "timestamp": vision_result.start_time
            },
            "prediction": prediction,
            "investigation": {
                "vision_investigator": vision_result.to_dict(),
                "robustness_investigator": robustness_result.to_dict(),
                "uncertainty_investigator": uncertainty_result.to_dict(),
                "failure_investigator": failure_result.to_dict(),
                "reliability_judge": reliability_result.to_dict()
            },
            "verdict": reliability_result.output_summary.get('verdict', 'UNKNOWN'),
            "trust_score": reliability_result.output_summary.get('trust_score', 0),
            "reasoning": reliability_result.output_summary.get('reasoning', ''),
            "executive_summary": {
                "confidence": prediction.get('confidence', 0),
                "model_reliability": reliability_result.output_summary.get('trust_score', 0),
                "recommendation": reliability_result.output_summary.get('verdict', 'UNKNOWN'),
                "key_findings": reliability_result.evidence.get('triggered_rules', []),
                "concerns": failure_result.evidence.get('failures', [])
            }
        }
        
        return report
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/explainability")
async def get_explainability(file: UploadFile = File(...)):
    """
    Get Grad-CAM and Integrated Gradients explanations
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        image_array = np.array(image)
        
        prediction = model.predict(image_array)
        
        # Generate explanations
        input_tensor = model.preprocess_image(image_array)
        
        cam_heatmap = explainability_module.gradcam.generate(
            input_tensor,
            target_class=prediction['predicted_class']
        )
        
        ig_attribution = explainability_module.integrated_gradients.generate(
            input_tensor,
            target_class=prediction['predicted_class']
        )
        
        # Similarity
        similarity = explainability_module.compute_explanation_similarity(cam_heatmap, ig_attribution)
        
        return {
            "status": "success",
            "prediction": prediction,
            "explanations": {
                "gradcam": cam_heatmap.tolist(),
                "integrated_gradients": ig_attribution.tolist(),
                "similarity": similarity
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/robustness")
async def test_robustness(file: UploadFile = File(...)):
    """
    Test model robustness through perturbations
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        image_array = np.array(image)
        
        original_prediction = model.predict(image_array)
        
        # Run perturbation suite
        perturbation_tester = PerturbationTester(model, device=device)
        results = perturbation_tester.run_perturbation_suite(image_array)
        
        # Identify weakness
        weakness = identify_model_weakness(results)
        
        return {
            "status": "success",
            "original_prediction": original_prediction,
            "perturbation_results": results,
            "weakness_analysis": weakness,
            "summary": {
                "total_perturbations": len(results),
                "most_sensitive": weakness.get('most_sensitive_perturbation'),
                "largest_delta": weakness.get('largest_confidence_change'),
                "failure_mode": weakness.get('failure_mode')
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/uncertainty")
async def analyze_uncertainty(file: UploadFile = File(...)):
    """
    Analyze model uncertainty
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        image_array = np.array(image)
        
        prediction = model.predict(image_array)
        
        uncertainty_estimator = UncertaintyEstimator(model, device=device)
        uncertainty = uncertainty_estimator.estimate_uncertainty(image_array)
        
        return {
            "status": "success",
            "prediction": prediction,
            "uncertainty_analysis": uncertainty
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/attack")
async def attack_prediction(file: UploadFile = File(...), perturbation_type: str = "brightness", 
                          param: float = 1.2):
    """
    Test a specific perturbation (Attack This Prediction)
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        image_array = np.array(image)
        
        perturbation_tester = PerturbationTester(model, device=device)
        result = perturbation_tester.test_perturbation(image_array, perturbation_type, param)
        
        return {
            "status": "success",
            "perturbation_result": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/demo-cases")
async def get_demo_cases():
    """
    Get list of available demo cases
    """
    # For now, return a placeholder
    return {
        "demo_cases": [
            {
                "id": "case_001",
                "name": "High Confidence, Robust Prediction",
                "description": "A clear case where the model is confident and stable"
            },
            {
                "id": "case_002",
                "name": "High Confidence, Uncertain Prediction",
                "description": "High confidence but uncertain under perturbation"
            },
            {
                "id": "case_003",
                "name": "Low Confidence Edge Case",
                "description": "Borderline case with competing predictions"
            }
        ]
    }


@app.get("/api/config")
async def get_config():
    """
    Get system configuration
    """
    return {
        "model": "EfficientNet-B0 Brain Tumor Classifier",
        "classes": ["No Tumor", "Glioma", "Meningioma", "Pituitary"],
        "device": device,
        "explainability_methods": ["Grad-CAM", "Integrated Gradients"],
        "perturbation_types": [
            "brightness", "contrast", "gaussian_noise", "blur", "rotation"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
