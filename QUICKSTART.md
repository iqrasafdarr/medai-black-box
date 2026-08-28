# MEDAI BLACK BOX - Quick Start Guide

## 30-Second Quick Start

```bash
# Terminal 1 - Backend
cd medai-black-box
source venv/bin/activate  # or: venv\Scripts\activate on Windows
python backend/main.py

# Terminal 2 - Frontend
cd frontend
npm run start
```

Open **http://localhost:3000** and upload an image.

---

## One-Time Setup (First Time Only)

```bash
# Clone/extract project
cd medai-black-box

# Automated setup (Unix/Linux/Mac)
bash setup.sh

# OR manual setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cd frontend
npm install
npm run build
```

---

## Using Demo Cases

Pre-generated demo images in `demo_cases/`:

1. **case_001_robust.png** - Clear prediction, stable under perturbation
2. **case_002_uncertain.png** - High confidence, but uncertain
3. **case_003_ambiguous.png** - Borderline low-confidence case

Upload any to test the investigation pipeline.

---

## API Usage Examples

### Quick Prediction
```bash
curl -X POST -F "file=@image.png" http://localhost:8000/api/predict
```

### Full Forensic Autopsy
```bash
curl -X POST -F "file=@image.png" http://localhost:8000/api/autopsy | jq
```

### Explainability Only
```bash
curl -X POST -F "file=@image.png" http://localhost:8000/api/explainability
```

### Robustness Testing
```bash
curl -X POST -F "file=@image.png" http://localhost:8000/api/robustness
```

### Uncertainty Analysis
```bash
curl -X POST -F "file=@image.png" http://localhost:8000/api/uncertainty
```

### Attack Specific Perturbation
```bash
curl -X POST -F "file=@image.png" \
  "http://localhost:8000/api/attack?perturbation_type=brightness&param=1.3"
```

### System Configuration
```bash
curl http://localhost:8000/api/config | jq
```

---

## UI Navigation

### Landing Page
- Upload or drag/drop image
- Click "Start Investigation"

### Investigation Interface
**Tabs:**
1. **Overview** - Verdict, evidence timeline, key findings
2. **Explainability** - Grad-CAM and Integrated Gradients
3. **Robustness** - Perturbation test results
4. **Counterfactual** - "What-if" scenario testing
5. **Break the AI** - Failure injection testing
6. **Agents** - Flight recorder execution logs

### Mode Selection
- **Demo Mode** (top right) - Beautiful, simplified view
- **Research Mode** - Full metrics and transparency

---

## Key Features

### AI Autopsy
Automatic investigation showing:
- ✓ Prediction generated
- ✓ Visual evidence analyzed
- ✓ Perturbation tests completed
- ✓ Uncertainty evaluated
- ✓ Reliability judged

### Verdict System
- **TRUST** - Recommend deployment (confidence + reliability + stability)
- **REVIEW** - Requires expert evaluation (mixed signals)
- **ABSTAIN** - Cannot reliably assess (insufficient evidence)

### Investigation Agents
1. Vision Investigator - Explainability via Grad-CAM + IG
2. Robustness Investigator - 20+ perturbation tests
3. Uncertainty Investigator - Multiple uncertainty metrics
4. Failure Analyzer - Pattern detection
5. Reliability Judge - TRUST/REVIEW/ABSTAIN decision

### Interactive Analysis
- Counterfactual Lab - Modify evidence, observe verdict changes
- Break the AI - Disable agents, test graceful degradation
- Agent Flight Recorder - Detailed execution logs

---

## Common Tasks

### Run Tests
```bash
python tests/test_e2e.py
```

### Generate New Demo Cases
```bash
python demo_cases/generate_cases.py
```

### View Logs
```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log
```

### Stop Services
```bash
# Kill processes
pkill -f "python backend/main.py"
pkill -f "next start"

# Or Ctrl+C in each terminal
```

---

## System Requirements

### Minimum
- Python 3.10+
- Node.js 18+
- 4GB RAM
- Modern browser

### Recommended
- Python 3.12
- Node.js 20+
- 8GB RAM
- CPU with multiple cores (model inference)

### For GPU Acceleration
- NVIDIA GPU with CUDA support
- Modify `backend/main.py` to use `device='cuda'`

---

## Troubleshooting

### Backend won't start
```bash
# Clear old process
pkill -f "python backend"

# Reinstall
pip install -r requirements.txt --force-reinstall

# Check logs
tail -50 backend.log
```

### Frontend blank/not loading
```bash
# Clear cache
rm -rf frontend/.next
npm run build
npm run start
```

### Connection refused errors
```bash
# Verify backend is running
curl http://localhost:8000/health

# Verify frontend is running
curl http://localhost:3000
```

### Model inference slow
- Reduce image size to 224×224
- Use CPU mode (default)
- Check system resources: `top` or `Task Manager`

### Port already in use
```bash
# Find process using port 8000
lsof -i :8000

# Find process using port 3000
lsof -i :3000

# Kill specific process
kill -9 <PID>
```

---

## Configuration

### Reliability Judge Thresholds
Edit `configs/reliability_judge.yaml`:

```yaml
confidence:
  high_threshold: 0.85      # Adjust confidence requirement

robustness:
  acceptable_flip_rate: 0.10  # Max flip rate before concern
  acceptable_confidence_delta: 0.15

explanation:
  good_agreement_threshold: 0.40  # Min explanation agreement
```

---

## Performance Metrics

### Expected Latencies (CPU)
- Prediction: ~50ms
- Grad-CAM: ~2s
- Integrated Gradients: ~5s
- Perturbation suite: ~30s
- Full autopsy: ~40s

### Expected Metrics
- Model accuracy: ~85-90% (depends on data)
- Explanation agreement: 0.2-0.8 (varies by case)
- Robustness: Average confidence delta ~10%
- Uncertainty: Entropy 0.8-1.2 typical

---

## Research Mode vs Demo Mode

### Demo Mode (Default)
- Simplified interface
- Key metrics only
- Beautiful visualizations
- Suitable for presentations

### Research Mode
- Full metric transparency
- All computation details
- Raw probabilities
- Agent execution logs
- Latency tracking
- Error messages

Toggle with button (top right).

---

## System Architecture

```
Frontend (Next.js)
    ↓ (HTTP REST API)
Backend (FastAPI)
    ├─ Model Inference (PyTorch)
    ├─ Explainability (Grad-CAM, IG)
    ├─ Robustness (Perturbations)
    ├─ Uncertainty (Entropy)
    └─ Investigation Agents
         ├─ Vision
         ├─ Robustness
         ├─ Uncertainty
         ├─ Failure Analyzer
         └─ Reliability Judge
```

---

## Data Flow

```
CASE (Medical Image)
    ↓
UPLOAD to Frontend
    ↓
POST /api/autopsy
    ↓
BACKEND INVESTIGATION
    ├─ Prediction Engine
    ├─ Explainability
    ├─ Perturbation Testing
    ├─ Uncertainty Analysis
    ├─ Failure Detection
    └─ Reliability Judge
    ↓
JSON Response
    ↓
FRONTEND VISUALIZATION
    ├─ Verdict Card
    ├─ Investigation Graph
    ├─ Evidence Timeline
    ├─ Explainability Maps
    ├─ Robustness Charts
    └─ Agent Logs
```

---

## Next Steps

### For Demonstration
1. Run setup
2. Start backend + frontend
3. Upload demo_cases
4. Show different verdicts
5. Explore Counterfactual Lab

### For Development
1. Modify `agents/investigation_agents.py` for custom logic
2. Update thresholds in `configs/reliability_judge.yaml`
3. Add new perturbation types in `explainability/robustness.py`
4. Customize UI in `frontend/components/`

### For Deployment
1. Use real medical dataset
2. Retrain model with domain data
3. Validate with radiologists
4. Add authentication/logging
5. Deploy to cloud (AWS, GCP, Azure)

---

## Support & Documentation

- **Full Docs**: See `README.md`
- **CV Material**: See `CV_MATERIAL.md`
- **API Docs**: http://localhost:8000/docs (when running)
- **Code**: Well-commented source in each module
- **Issues**: Check terminal logs for detailed errors

---

**Last Updated:** August 2026  
**Status:** Research Prototype (v1.0.0 MVP)  
**License:** Research use only

Good luck! 🚀
