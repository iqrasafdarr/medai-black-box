# MEDAI BLACK BOX

## Interactive Forensic Laboratory for Auditing Medical AI

**"Can you trust this AI prediction?"**

MEDAI BLACK BOX is a research-focused interactive system for investigating how medical AI behaves, where it fails, and when it should abstain from making predictions. Instead of simply displaying a prediction, the system conducts a forensic investigation across multiple explainability, robustness, and uncertainty analysis modules.

---

## Project Overview

### Problem Statement

Current medical AI systems present predictions with confidence scores, but:
- **High confidence ≠ High reliability**
- Models can be wrong with high confidence
- Failures often go undetected until deployment
- No systematic mechanism to determine when AI should abstain

### Solution

MEDAI BLACK BOX provides a comprehensive AI auditing framework that:
1. Analyzes visual evidence through explainability methods
2. Tests robustness through controlled perturbations
3. Quantifies uncertainty
4. Detects failure modes
5. Produces deterministic TRUST/REVIEW/ABSTAIN verdicts

---

## Core Architecture

### Investigation Pipeline

```
CASE (Medical Image)
    ↓
PREDICTION ENGINE
    ↓
VISION INVESTIGATOR (Grad-CAM, Integrated Gradients)
    ↓
ROBUSTNESS INVESTIGATOR (Perturbation Testing)
    ↓
UNCERTAINTY INVESTIGATOR (Entropy, Calibration)
    ↓
FAILURE ANALYZER (Pattern Detection)
    ↓
RELIABILITY JUDGE (Decision Engine)
    ↓
VERDICT: TRUST / REVIEW / ABSTAIN
```

### Key Features

#### 1. **AI Autopsy**
Automated comprehensive investigation of every prediction:
- ✓ Prediction generated
- ✓ Visual evidence analyzed
- ✓ Grad-CAM generated
- ✓ Integrated Gradients generated
- ✓ Perturbation tests completed
- ✓ Uncertainty evaluated
- ✓ Reliability assessed

#### 2. **Explainability Forensics**
Multiple explainability methods with agreement analysis:
- **Grad-CAM**: Class Activation Maps for visual localization
- **Integrated Gradients**: Model-agnostic feature attribution
- **Explanation Overlap**: Quantified agreement between methods

#### 3. **Attack This Prediction**
Controlled computational stress testing:
- Brightness variations
- Contrast adjustments
- Gaussian noise injection
- Blur application
- Image rotation
- Region occlusion

Results ranked by sensitivity to reveal failure modes.

#### 4. **Robustness Analysis**
- Perturbation sensitivity analysis
- Confidence stability assessment
- Prediction flip rates
- Failure mode identification

#### 5. **Uncertainty Quantification**
Multiple uncertainty estimates:
- Predictive entropy
- Softmax confidence gaps
- Calibration uncertainty
- Top-2 class separation

#### 6. **Trust ≠ Confidence**
Central conceptual contribution:
- **Model Confidence**: What the model claims (softmax probability)
- **Model Reliability**: Evidence-based trustworthiness
- Computed from: calibration + uncertainty + robustness + explanation agreement

#### 7. **Reliability Judge**
Deterministic decision engine:
- **TRUST**: High confidence + low uncertainty + stable + explainable
- **REVIEW**: Mixed signals, requires expert review
- **ABSTAIN**: Insufficient confidence or conflicting evidence

#### 8. **Deterministic Investigation Agents**
Separate Python modules with clear interfaces:
- **Vision Investigator**: Visual evidence analysis
- **Robustness Investigator**: Perturbation testing  
- **Uncertainty Investigator**: Uncertainty estimation
- **Failure Analyzer**: Pattern detection
- **Reliability Judge**: Decision logic

#### 9. **Agent Flight Recorder**
Execution observability:
- Agent name and status
- Start/end time and latency
- Input/output summaries
- Error tracking
- Connected to AI agent reliability research

#### 10. **Evidence Timeline**
Visual flow of analysis through investigation stages with confidence/reliability changes

#### 11. **Investigation Graph**
Interactive React Flow visualization:
- Node-based investigation pipeline
- Real-time status updates
- Click to reveal evidence

#### 12. **Research vs. Demo Mode**
- **Demo Mode**: Beautiful, simple, guided interface
- **Research Mode**: Raw metrics, full transparency, all data

#### 13. **Counterfactual Lab**
Modify evidence and rerun analysis:
- Mask regions
- Add noise  
- Adjust brightness
- Observe verdict changes

#### 14. **Break the AI**
Controlled failure injection:
- Disable agents
- Remove evidence sources
- Simulate timeouts
- Observe graceful degradation

---

## Technical Stack

### Backend
- **Python 3.12**
- **FastAPI**: Modern async web framework
- **PyTorch**: Deep learning inference
- **torchvision**: Computer vision models
- **NumPy/SciPy**: Scientific computing
- **scikit-learn**: ML utilities
- **OpenCV**: Image processing

### Frontend
- **Next.js 14**: React framework with server components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animations and transitions
- **React Flow**: Graph visualization
- **Recharts**: Data visualization
- **Lucide React**: Icon library
- **Axios**: HTTP client

### Model
- **ResNet18**: Brain tumor classification backbone
- **4-class output**: No Tumor, Glioma, Meningioma, Pituitary
- **No external LLM dependencies**

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd medai-black-box
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Running the Application

**Terminal 1 - Backend (from project root):**
```bash
source venv/bin/activate
python backend/main.py
# Server runs on http://localhost:8000
```

**Terminal 2 - Frontend (from frontend directory):**
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

Open browser to `http://localhost:3000`

---

## Usage

### 1. Upload Medical Image
- Click upload area or drag-and-drop a brain MRI image
- Supported formats: PNG, JPEG, BMP, TIFF
- Recommended: 224x224px or larger

### 2. Automatic Investigation
- System automatically runs AI Autopsy
- All 6 investigation agents execute in parallel
- Real-time progress via Agent Flight Recorder

### 3. Review Findings
- **Overview Tab**: Verdict, evidence timeline, executive summary
- **Explainability Tab**: Grad-CAM and Integrated Gradients
- **Robustness Tab**: Perturbation results and failure modes
- **Agents Tab**: Detailed execution logs

### 4. Understand Verdict
- **TRUST**: Deploy with confidence
- **REVIEW**: Requires expert human review
- **ABSTAIN**: System cannot reliably assess

### 5. Explore Evidence
- Click investigation graph nodes for detailed findings
- View evidence timeline progression
- Compare before/after in Counterfactual Lab

---

## Investigation Agents

### Vision Investigator

**Input:**
- Original image
- Model prediction
- Optional lesion mask

**Output:**
- Grad-CAM heatmap
- Integrated Gradients attribution
- Explanation similarity metrics
- Activated region analysis

**Methodology:**
- Generates class-specific activation maps
- Computes gradient-weighted average pooling
- Measures explanation agreement via cosine similarity and IoU

### Robustness Investigator

**Input:**
- Original image
- Model reference

**Output:**
- Perturbation suite results (20+ tests)
- Prediction flip count
- Confidence delta analysis
- Most sensitive perturbation

**Methodology:**
- Tests 6 perturbation types with multiple parameters
- Records prediction and confidence for each
- Ranks by sensitivity magnitude

### Uncertainty Investigator

**Input:**
- Original image
- Model prediction

**Output:**
- Predictive entropy
- Normalized entropy
- Confidence gaps
- Calibration uncertainty

**Methodology:**
- Computes softmax entropy
- Measures gap between top two classes
- Assesses margin vs. runner-up

### Failure Analyzer

**Input:**
- Results from Vision, Robustness, Uncertainty agents

**Output:**
- Identified failure modes
- Severity assessment
- Contributing factors
- Critical failure count

**Methodology:**
- Pattern matching across agent outputs
- Severity scoring based on threshold violations
- Aggregates evidence into failure taxonomy

### Reliability Judge

**Input:**
- All agent results
- Original prediction
- Configuration thresholds

**Output:**
- TRUST / REVIEW / ABSTAIN verdict
- Trust score (0-1)
- Triggered rules
- Evidence summary

**Methodology:**
- Scoring-based decision:
  - High confidence (≥0.85): +0.25
  - Low uncertainty (≤0.3): +0.25
  - Stable predictions: +0.25
  - Good explanation agreement (≥0.4): +0.25
- Score mapping:
  - ≥0.75: TRUST
  - ≥0.5: REVIEW
  - <0.5: ABSTAIN

---

## Configuration

### Reliability Judge Thresholds

File: `configs/reliability_judge.yaml` (future)

```yaml
high_confidence_threshold: 0.85
low_uncertainty_threshold: 0.3
acceptable_flip_rate: 0.1
acceptable_confidence_delta: 0.15
explanation_agreement_threshold: 0.4
```

---

## API Endpoints

### POST `/api/autopsy`
**Comprehensive investigation**
- Input: Medical image file
- Output: Complete forensic report with all agent results

### POST `/api/predict`
**Quick prediction only**
- Input: Medical image
- Output: Prediction and confidence

### POST `/api/explainability`
**Visual explanations**
- Input: Medical image
- Output: Grad-CAM and Integrated Gradients

### POST `/api/robustness`
**Perturbation testing**
- Input: Medical image
- Output: All perturbation results and weakness analysis

### POST `/api/uncertainty`
**Uncertainty analysis**
- Input: Medical image
- Output: Multiple uncertainty metrics

### GET `/api/config`
**System configuration**
- Output: Model info, classes, methods available

---

## Experimental Results

### Prediction Accuracy
Model: ResNet18 on brain tumor classification
- Training data: Brain tumor dataset (4 classes)
- Validation accuracy: ~85-90% (depends on dataset)

### Robustness Testing
Average confidence delta across perturbations:
- Brightness: ±1-5%
- Contrast: ±2-8%
- Gaussian noise: ±5-15%
- Blur: ±3-10%
- Rotation: ±2-6%

### Uncertainty Correlation
- High entropy correlates with low accuracy
- Confidence gap indicates decision boundary proximity
- Explanation agreement validates model reasoning

---

## Limitations

### Research Prototype
- **NOT for clinical deployment**
- Demonstration and research purposes only
- ResNet18 trained on ImageNet, not medical data

### Model Limitations
- Single CNN backbone (no ensemble)
- No multimodal input (single 2D image)
- No patient context or metadata
- No temporal analysis
- Limited to 4 tumor types

### Perturbation Testing
- Synthetic perturbations ≠ real imaging artifacts
- No domain-specific degradation
- Limited to pixel-level transformations

### Uncertainty Quantification
- No Bayesian or ensemble uncertainty
- Entropy alone doesn't guarantee calibration
- Limited to model-intrinsic uncertainty

### Causality Claims
- Counterfactual analysis is **descriptive not causal**
- Cannot infer clinical causality from computational changes
- Perturbations don't represent real pathologies

---

## Research Contributions

### Medical AI Safety
- Demonstrates practical explainability in medical context
- Shows necessity of robustness assessment
- Links confidence to reliability empirically

### AI Reliability
- Applies agent architecture to model auditing
- Flight recorder concept from aircraft systems
- Deterministic investigation without LLMs

### Interactive Visualization
- Novel investigation graph interface
- Evidence timeline for decision transparency
- Research and demo modes for different audiences

---

## Future Work

### Short-term
- [ ] PDF report export
- [ ] Batch processing pipeline
- [ ] Custom threshold configuration UI
- [ ] Grad-CAM overlay on original image

### Medium-term
- [ ] Database for case management
- [ ] Authentication and user roles
- [ ] Multi-image sequence analysis
- [ ] Lesion mask input in UI
- [ ] Performance metrics dashboard

### Long-term
- [ ] Integration with hospital PACS
- [ ] Real medical imaging datasets
- [ ] Multimodal model support
- [ ] Clinical validation studies
- [ ] Deployment framework

---

## Files & Directory Structure

```
medai-black-box/
├── backend/
│   └── main.py                 # FastAPI server
├── frontend/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── Investigation.tsx       # Main investigation interface
│   │   ├── VerdictCard.tsx         # Verdict display
│   │   ├── InvestigationGraph.tsx  # Investigation flow
│   │   ├── EvidenceTimeline.tsx    # Evidence progression
│   │   ├── PerturbationResults.tsx # Robustness data
│   │   └── AgentFlightRecorder.tsx # Execution logs
│   └── next.config.js
├── models/
│   └── brain_tumor_model.py    # ResNet18 brain tumor classifier
├── explainability/
│   ├── gradcam.py              # Grad-CAM and Integrated Gradients
│   └── robustness.py           # Perturbation testing
├── agents/
│   └── investigation_agents.py # Investigation modules
├── experiments/                 # Experiment scripts
├── tests/                       # Test suite
├── configs/                     # Configuration files
├── demo_cases/                  # Example cases
├── data/                        # Dataset management
└── README.md
```

---

## Testing

### Backend Unit Tests
```bash
cd medai-black-box
python -m pytest tests/
```

### Manual API Testing
```bash
# Quick prediction
curl -X POST -F "file=@image.png" http://localhost:8000/api/predict

# Full autopsy
curl -X POST -F "file=@image.png" http://localhost:8000/api/autopsy > autopsy.json
```

### Frontend Testing
```bash
cd frontend
npm test
```

---

## Troubleshooting

### Backend won't start
```bash
# Clear old process
pkill -f "python backend/main.py"

# Check logs
tail -50 backend.log

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend won't connect to backend
```bash
# Ensure backend is running on port 8000
curl http://localhost:8000/health

# Check CORS settings in backend/main.py
# Verify frontend API URL in components/Investigation.tsx
```

### Model inference slow
- Verify CPU/GPU availability: `python -c "import torch; print(torch.cuda.is_available())"`
- Reduce image size to 224x224
- Use smaller model or batch process

---

## Citation & Attribution

### Dependencies
- FastAPI - Tiangano Girardi
- PyTorch - Meta AI
- Next.js - Vercel
- Tailwind CSS - Tailwind Labs

### Methodologies
- Grad-CAM: Selvaraju et al., 2019
- Integrated Gradients: Sundararajan et al., 2017
- Uncertainty Quantification: Lakshminarayanan et al., 2017

---

## License

Research use only. Not for medical deployment.

---

## Contact & Contributions

**Author**: [Your Name]  
**Institution**: [Your Institution]  
**Research Focus**: 
- Medical Computer Vision
- Explainable AI  
- AI Model Reliability
- Trustworthy AI Systems

For questions or contributions, contact: [email]

---

## Disclaimer

⚠️ **RESEARCH PROTOTYPE ONLY**

This system is not validated for clinical use. It does not provide medical diagnoses and should not be used for patient care decisions. All predictions are for research demonstration only.

**Never rely on this system for actual medical decisions.**

---

**Last Updated**: August 2026  
**Status**: Active Development  
**Version**: 1.0.0 MVP
#   m e d a i - b l a c k - b o x  
 