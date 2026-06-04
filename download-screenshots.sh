#!/bin/bash

# Automated Screenshot Downloader
# Uses SVG generation API to create screenshots without browser automation

set -e

SCREENSHOT_DIR="public/screenshots"
BASE_URL="http://localhost:3000"

echo "🎨 Generating screenshots via API..."

# Ensure screenshot directory exists
mkdir -p "$SCREENSHOT_DIR"

# Check if dev server is running
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
  echo "❌ Dev server not running. Start it with: npm run dev"
  echo "Then run this script again."
  exit 1
fi

# Generate dashboard screenshot (dark theme)
echo "📊 Generating dashboard screenshot (dark theme)..."
curl -s "$BASE_URL/api/screenshots/dashboard?theme=dark" \
  -o "$SCREENSHOT_DIR/dashboard-dark-1200x630.svg"

# Generate dashboard screenshot (light theme)
echo "📊 Generating dashboard screenshot (light theme)..."
curl -s "$BASE_URL/api/screenshots/dashboard?theme=light" \
  -o "$SCREENSHOT_DIR/dashboard-light-1200x630.svg"

# Generate setup wizard screenshots (all 4 steps)
for step in 1 2 3 4; do
  echo "🔧 Generating setup wizard step $step..."
  curl -s "$BASE_URL/api/screenshots/setup?step=$step" \
    -o "$SCREENSHOT_DIR/setup-step${step}-1200x630.svg"
done

echo ""
echo "✅ Screenshots generated successfully!"
echo ""
echo "Generated files:"
ls -lh "$SCREENSHOT_DIR"
echo ""
echo "📸 These are SVG screenshots generated via API."
echo "   SVG files are scalable and can be converted to PNG if needed."
echo ""
echo "To convert SVG to PNG (optional):"
echo "  for file in $SCREENSHOT_DIR/*.svg; do"
echo "    convert \"\$file\" \"\${file%.svg}.png\""
echo "  done"
echo ""
echo "For production screenshots with real data:"
echo "  1. Run: npm run dev"
echo "  2. Open: http://localhost:3000 in browser"
echo "  3. Follow SCREENSHOTS.md for manual capture guide"