#!/bin/bash
# Automated screenshot capture script for analytics dashboard
# This script uses headless browsers to capture screenshots

echo "📸 Screenshot Capture Script for Analytics Dashboard"
echo "===================================================="

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Dev server not running at http://localhost:3000"
    echo "❌ Please run: npm run dev"
    echo "❌ Then run this script again"
    exit 1
fi

echo "✅ Dev server detected"

# Create screenshots directory
mkdir -p ./public/screenshots

# Method 1: Firefox headless (preferred)
if command -v firefox &> /dev/null; then
    echo "📸 Capturing with Firefox..."

    # Screenshot 1: Main dashboard
    firefox --headless --screenshot=./public/screenshots/dashboard-1920x1080.png \
        --window-size=1920,1080 \
        http://localhost:3000/ 2>/dev/null

    if [ -f "./public/screenshots/dashboard-1920x1080.png" ]; then
        echo "✅ Dashboard screenshot captured"
    else
        echo "⚠️  Dashboard screenshot failed"
    fi

    # Screenshot 2: Setup wizard
    firefox --headless --screenshot=./public/screenshots/setup-step1-1920x1080.png \
        --window-size=1920,1080 \
        http://localhost:3000/setup 2>/dev/null

    if [ -f "./public/screenshots/setup-step1-1920x1080.png" ]; then
        echo "✅ Setup wizard screenshot captured"
    else
        echo "⚠️  Setup wizard screenshot failed"
    fi
fi

# Method 2: Chromium headless (fallback)
if command -v chromium-browser &> /dev/null; then
    echo "📸 Capturing with Chromium..."
    chromium --headless --screenshot=./public/screenshots/dashboard-1920x1080.png \
        --window-size=1920,1080 \
        http://localhost:3000/ 2>/dev/null
fi

if command -v chromium &> /dev/null; then
    echo "📸 Capturing with Chromium..."
    chromium --headless --screenshot=./public/screenshots/dashboard-1920x1080.png \
        --window-size=1920,1080 \
        http://localhost:3000/ 2>/dev/null
fi

# Method 3: Manual fallback instructions
if ! ls ./public/screenshots/*.png 1> /dev/null 2>&1; then
    echo "❌ No screenshots captured"
    echo ""
    echo "📋 MANUAL INSTRUCTIONS:"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Open DevTools (Cmd+Shift+P or Ctrl+Shift+P)"
    echo "3. Type: 'Capture full size screenshot'"
    echo "4. Save as: ./public/screenshots/dashboard-1920x1080.png"
    echo "5. Repeat for http://localhost:3000/setup"
    echo "6. Save as: ./public/screenshots/setup-step1-1920x1080.png"
    exit 1
fi

echo ""
echo "✅ Screenshots captured successfully!"
echo "📁 Location: ./public/screenshots/"
ls -lh ./public/screenshots/*.png 2>/dev/null || echo "No PNG files found"
