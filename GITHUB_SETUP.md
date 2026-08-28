# 1. Extract
unzip medai-black-box.zip
cd medai-black-box
code .

# 2. Setup (in VS Code terminal)
python3 -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate on Windows
pip install -r requirements.txt
cd frontend && npm install && cd ..

# 3. Run (in VS Code)
# Terminal 1:
python backend/main.py

# Terminal 2 (new terminal):
cd frontend && npm run start

# 4. Open browser
# http://localhost:3000# MEDAI BLACK BOX - Setup for VS Code & GitHub

## 📦 You Have: `medai-black-box-release.tar.gz` (694KB)

This is the complete production-ready project.

---

## 🚀 STEP 1: Extract & Open in VS Code (2 minutes)

### On Mac/Linux:
```bash
# Extract archive
tar -xzf medai-black-box-release.tar.gz

# Open in VS Code
code medai-black-box

# Or open from terminal
cd medai-black-box
code .
```

### On Windows:
```bash
# Using 7-Zip, WinRAR, or built-in:
# Right-click medai-black-box-release.tar.gz → Extract

# Or PowerShell:
tar -xzf medai-black-box-release.tar.gz

# Open in VS Code
code medai-black-box
```

---

## 🔧 STEP 2: Initial Setup (3 minutes)

Once opened in VS Code:

```bash
# Terminal in VS Code (Ctrl+` or View → Terminal)

# Create Python virtual environment
python3 -m venv venv

# Activate it
# Mac/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## ✅ STEP 3: Verify Everything Works (1 minute)

```bash
# Run tests
python tests/test_e2e.py

# Expected output: "ALL TESTS PASSED"
```

---

## 🐙 STEP 4: Push to GitHub (5 minutes)

### Option A: Create New Repository

1. Go to **github.com/new**
2. Enter: `medai-black-box`
3. Description: "Interactive Forensic Laboratory for Auditing Medical AI"
4. Click "Create repository"

### Option B: Push to Existing Repository

```bash
# In VS Code terminal (at project root)

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: MEDAI BLACK BOX v1.0.0

- Complete backend: FastAPI server with investigation agents
- Frontend: Next.js interactive UI with 6 analysis tabs
- Features: Explainability, robustness testing, uncertainty analysis
- Demo cases: 3 sample images for testing
- Full documentation: README, quickstart, CV material"

# Add remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/medai-black-box.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 📋 What Gets Pushed to GitHub

```
medai-black-box/
├── backend/              # FastAPI server (600+ lines)
├── frontend/             # Next.js UI (1500+ lines)
├── agents/               # Investigation agents (600+ lines)
├── models/               # Brain tumor classifier
├── explainability/       # Grad-CAM & IG
├── tests/                # E2E test suite
├── configs/              # Configuration files
├── demo_cases/           # 3 demo images
├── README.md             # Full documentation
├── QUICKSTART.md         # Setup guide
├── CV_MATERIAL.md        # Research portfolio
├── requirements.txt      # Python dependencies
└── ... (documentation)
```

**Not pushed (ignored):**
- `node_modules/` (regenerated: `npm install`)
- `venv/` (regenerated: `python -m venv venv`)
- `.next/` (regenerated: `npm run build`)
- `__pycache__/` (Python cache)
- `.log` files (runtime logs)

---

## 📝 Create .gitignore (Recommended)

VS Code will prompt you. If not, create `.gitignore`:

```bash
# Python
venv/
__pycache__/
*.pyc
*.pyo
*.egg-info/
.pytest_cache/

# Node
node_modules/
npm-debug.log
.next/

# IDE
.vscode/
.idea/
*.swp

# Logs
*.log

# OS
.DS_Store
Thumbs.db
```

Then add to git:
```bash
git add .gitignore
git commit -m "Add .gitignore"
git push
```

---

## 🎯 Quick GitHub Setup (Copy-Paste)

```bash
# One-liner setup for new GitHub repo:
git init && \
git add . && \
git commit -m "Initial commit: MEDAI BLACK BOX v1.0.0 - Medical AI Forensics Laboratory" && \
git branch -M main && \
git remote add origin https://github.com/YOUR_USERNAME/medai-black-box.git && \
git push -u origin main
```

Just replace `YOUR_USERNAME` with your actual GitHub username.

---

## 🚀 After Push: Next Steps

### 1. Update GitHub README (Optional but Recommended)
Edit `README.md` in VS Code:
- Add GitHub badges
- Add screenshot section
- Update installation link

### 2. Add Topics/Tags
GitHub → Settings → About:
- Add topics: `medical-ai`, `explainability`, `pytorch`, `react`

### 3. Enable GitHub Pages (Optional)
```bash
# For project website hosting documentation
```

### 4. Share on Platforms
- LinkedIn: Share GitHub link
- Twitter: `I built a forensic laboratory for auditing medical AI...`
- Mitacs: Include in application

---

## 📊 What Reviewers See on GitHub

They'll see:
- ✅ Clean code structure
- ✅ Comprehensive README (300+ lines)
- ✅ Multiple documentation files
- ✅ Real implementation (not just theory)
- ✅ Professional commit history
- ✅ Test suite
- ✅ Configuration files
- ✅ Full-stack implementation

---

## 🔄 Making Changes After Push

In VS Code, the workflow is:

```bash
# Make changes in VS Code
# Then in terminal:

git status                    # See what changed
git add .                     # Stage changes
git commit -m "Your message"  # Commit
git push                      # Push to GitHub
```

Or use VS Code's built-in Git UI (Source Control icon on left).

---

## ⚡ Running the Project After Setup

```bash
# Terminal 1 - Backend
python backend/main.py

# Terminal 2 - Frontend (new terminal)
cd frontend
npm run start

# Browser
# Open http://localhost:3000
# Upload demo_cases/case_001_robust.png
```

---

## 📚 Key Files for Reviewers

When someone views your GitHub:

**They'll Read First:**
1. `README.md` - Main documentation
2. `START_HERE.md` - Quick navigation

**They'll Explore:**
3. `/agents/investigation_agents.py` - Core logic
4. `/frontend/components/` - UI architecture
5. `/tests/` - Test coverage

**For CV/Portfolio:**
6. `CV_MATERIAL.md` - Research contributions
7. `QUICKSTART.md` - Professional setup

---

## 🎓 GitHub Tips for Research/Portfolio

### Good Commit Messages
```bash
git commit -m "Add counterfactual analysis component

- Interactive what-if scenario testing
- Modify brightness, noise, blur
- Observe verdict changes
- Add disclaimer about causality"
```

### Good README Structure
✅ Title + tagline  
✅ Quick start  
✅ Features  
✅ Architecture  
✅ Installation  
✅ Usage  
✅ Results  
✅ License  

(Already done in your project!)

### Star Yourself
⭐ Star the repo (GitHub → top-right) to show activity

---

## 🔐 GitHub Access Tokens (If Using HTTPS)

If you get an authentication error:

1. GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token"
3. Select: `repo` (full control)
4. Copy token
5. Use as password when pushing

Or use SSH (GitHub docs).

---

## ✅ Verification Checklist

After pushing to GitHub:

- [ ] Repository created on GitHub
- [ ] All files pushed (57 files)
- [ ] README visible and formatted correctly
- [ ] Can clone with: `git clone <your-repo-url>`
- [ ] Running `npm install && python -m venv venv && pip install -r requirements.txt` works
- [ ] Tests pass: `python tests/test_e2e.py`
- [ ] Backend starts: `python backend/main.py`
- [ ] Frontend starts: `cd frontend && npm run start`

---

## 🎉 Done!

Your project is now on GitHub and ready for:
- ✅ Portfolio showcase
- ✅ Mitacs applications
- ✅ Interview discussions
- ✅ Research collaboration
- ✅ Public contributions
- ✅ Future development

---

## 📞 Common Issues

| Issue | Solution |
|-------|----------|
| Can't open .tar.gz | Use 7-Zip (Windows) or `tar -xzf` (Mac/Linux) |
| `npm install` fails | Delete `frontend/package-lock.json`, try again |
| Python dependencies fail | Use `pip install -r requirements.txt --upgrade` |
| Port 8000/3000 in use | Kill with `lsof -i :8000` and `kill -9 <PID>` |
| Git push rejected | Make sure you have GitHub auth set up (SSH or token) |

---

## 🚀 You're All Set!

- ✅ Project extracted
- ✅ Ready to open in VS Code
- ✅ Ready to push to GitHub
- ✅ Ready to showcase

Just follow the steps above and you're done!

---

**Archive:** medai-black-box-release.tar.gz (694KB)  
**Files:** 57 (all source code, no node_modules/venv)  
**Ready to:** Extract → VS Code → GitHub → Showcase  

Good luck! 🚀
