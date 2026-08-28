#!/bin/bash

# MEDAI BLACK BOX Service Startup Script

echo "🚀 Starting MEDAI BLACK BOX Services..."
echo ""

# Get absolute paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="$PROJECT_ROOT/venv"

# Check if venv exists
if [ ! -d "$VENV_PATH" ]; then
    echo "❌ Virtual environment not found. Please run setup first."
    exit 1
fi

# Activate virtual environment
echo "📦 Activating Python virtual environment..."
source "$VENV_PATH/bin/activate"

# Start backend
echo "🔌 Starting backend (FastAPI on port 8000)..."
cd "$PROJECT_ROOT"
python backend/main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check backend.log"
    tail -20 backend.log
    exit 1
fi

echo "✓ Backend started successfully"
echo ""

# Start frontend
echo "🎨 Starting frontend (Next.js on port 3000)..."
cd "$PROJECT_ROOT/frontend"
npm run start > "$PROJECT_ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 5

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start. Check frontend.log"
    tail -20 "$PROJECT_ROOT/frontend.log"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✓ Frontend started successfully"
echo ""

echo "✅ MEDAI BLACK BOX is ready!"
echo ""
echo "📍 Access points:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "📋 Logs:"
echo "   Backend:   $PROJECT_ROOT/backend.log"
echo "   Frontend:  $PROJECT_ROOT/frontend.log"
echo ""
echo "💡 To stop services, press Ctrl+C or run:"
echo "   kill $BACKEND_PID  # Stop backend"
echo "   kill $FRONTEND_PID # Stop frontend"
echo ""

# Wait for services (background)
wait $BACKEND_PID $FRONTEND_PID
