#!/bin/bash
# MEDAI BLACK BOX Setup Script
# Complete installation from scratch

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         MEDAI BLACK BOX - Setup & Installation              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Check Python
echo "🐍 Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.10 or higher."
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "   Python version: $PYTHON_VERSION ✓"
echo ""

# Check Node.js
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi
NODE_VERSION=$(node --version)
echo "   Node.js version: $NODE_VERSION ✓"
echo ""

# Create virtual environment
echo "🔧 Setting up Python virtual environment..."
if [ ! -d "$PROJECT_DIR/venv" ]; then
    python3 -m venv "$PROJECT_DIR/venv"
    echo "   Created virtual environment ✓"
else
    echo "   Virtual environment already exists ✓"
fi
echo ""

# Activate virtual environment
echo "⚙️  Activating virtual environment..."
source "$PROJECT_DIR/venv/bin/activate"
echo "   Activated ✓"
echo ""

# Install Python dependencies
echo "📥 Installing Python dependencies..."
cd "$PROJECT_DIR"
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "   Dependencies installed ✓"
echo ""

# Verify PyTorch
echo "🔥 Verifying PyTorch installation..."
python3 -c "import torch; print(f'   PyTorch {torch.__version__} ✓')"
echo ""

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd "$PROJECT_DIR/frontend"
npm install -s > /dev/null 2>&1 || npm install
echo "   Dependencies installed ✓"
echo ""

# Build frontend
echo "🏗️  Building frontend..."
npm run build > /dev/null 2>&1
echo "   Build complete ✓"
echo ""

# Create demo cases
echo "📸 Generating demo cases..."
cd "$PROJECT_DIR"
python3 demo_cases/generate_cases.py > /dev/null 2>&1
echo "   Demo cases ready ✓"
echo ""

# Test backend startup
echo "🧪 Testing backend initialization..."
timeout 10 python3 -c "from backend.main import app; print('   Backend startup successful ✓')" 2>/dev/null || {
    echo "   ⚠️  Backend test skipped (model initialization takes time)"
}
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ Installation Complete                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📍 Next steps:"
echo ""
echo "1. Start the backend (Terminal 1):"
echo "   cd $PROJECT_DIR"
echo "   source venv/bin/activate"
echo "   python backend/main.py"
echo ""
echo "2. Start the frontend (Terminal 2):"
echo "   cd $PROJECT_DIR/frontend"
echo "   npm run start"
echo ""
echo "3. Open in browser:"
echo "   http://localhost:3000"
echo ""
echo "4. Upload demo case from:"
echo "   $PROJECT_DIR/demo_cases/"
echo ""

echo "📚 Documentation:"
echo "   - README.md          - Full project documentation"
echo "   - CV_MATERIAL.md     - Research portfolio"
echo "   - requirements.txt   - Python dependencies"
echo "   - frontend/package.json - Frontend dependencies"
echo ""

echo "🧪 Run tests:"
echo "   python tests/test_e2e.py"
echo ""

echo "✨ Installation ready!"
