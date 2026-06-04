# Analytics Dashboard - Screenshot Guide

This guide provides step-by-step instructions for creating professional screenshots of the analytics dashboard for documentation, marketing, or portfolio purposes.

## Prerequisites

- Node.js and npm installed
- Analytics dashboard project cloned
- 5-10 minutes for setup and screenshots

## Step 1: Start Development Server

```bash
# Navigate to project directory
cd /home/tolgabrk/projects/Auto-Company/projects/analytics-dashboard

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The server will start at `http://localhost:3000`

## Step 2: Run Setup Wizard

1. Open browser and navigate to: `http://localhost:3000/setup`
2. Follow the 4-step setup process:
   - **Step 1:** Click "Initialize Database" to create SQLite database
   - **Step 2:** Copy the tracking script (skip for now)
   - **Step 3:** Click "Send Test Event" to generate sample data
   - **Step 4:** Click "Go to Dashboard" to view analytics

## Step 3: Generate Sample Data

Before taking screenshots, populate the dashboard with realistic data:

### Option A: Use Built-in Test Event (Fastest)
- In setup wizard Step 3, click "Send Test Event" 10-15 times
- Wait 2-3 seconds between clicks for natural distribution

### Option B: Manual Browser Testing (More Realistic)
```bash
# In a separate terminal, simulate page views
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pageview",
    "properties": {
      "path": "/blog/post-1",
      "referrer": "https://google.com"
    },
    "sessionId": "test-session-1"
  }'

# Repeat with different paths and referrers
# Try: /about, /contact, /pricing, /features
# Referrers: twitter.com, github.com, direct, reddit.com
```

### Option C: Create Sample HTML Page (Most Realistic)
Create `test-site.html` in the project root:
```html
<!DOCTYPE html>
<html>
<head>
    <script src="http://localhost:3000/tracker.js"></script>
</head>
<body>
    <h1>Test Site</h1>
    <nav>
        <a href="/home">Home</a>
        <a href="/about">About</a>
        <a href="/pricing">Pricing</a>
    </nav>
    <p>Click links to generate pageview events</p>
</body>
</html>
```

Open `test-site.html` in browser and click around for 2-3 minutes.

## Step 4: Take Screenshots

### Method A: Automated Generation (Fastest - 2 minutes)

**New in Cycle #126:** Programmatic screenshot generation using Next.js OG (Open Graph) image generation. No browser required.

```bash
# 1. Start dev server
npm run dev

# 2. Run automated downloader
./download-screenshots.sh
```

This generates:
- `dashboard-dark-1200x630.png` - Dark theme dashboard
- `dashboard-light-1200x630.png` - Light theme dashboard
- `setup-step1-1200x630.png` through `setup-step4-1200x630.png` - All setup wizard steps

**Advantages:**
- ✅ Zero browser setup required
- ✅ Consistent, high-quality output
- ✅ Runs in any environment (including headless servers)
- ✅ Perfect for CI/CD pipelines

**Limitations:**
- ⚠️ Programmatic rendering (not actual browser screenshots)
- ⚠️ Shows sample data, not real analytics
- ⚠️ Fixed 1200x630 resolution (OG image standard)

**Use when:** Quick screenshots for documentation, social media previews, or portfolio.

### Method B: Browser Screenshots (Most Realistic - 10 minutes)

Use when you need actual screenshots of the running application with real data.

#### Screenshot 1: Main Dashboard (Required)

**What to capture:**
- Hero metrics cards (total views, unique visitors, top pages)
- Line chart showing traffic trend
- Top pages table
- Referrers table
- Full dashboard aesthetic (brutalist terminal design)

**URL:** `http://localhost:3000`

**Recommended Viewport:** 1920x1080 (desktop)

**Instructions:**
1. Navigate to `http://localhost:3000`
2. Open browser DevTools (F12)
3. Click "Device Toggle" (Ctrl+Shift+M / Cmd+Shift+M)
4. Select "Responsive" mode
5. Set dimensions: 1920 x 1080
6. Scroll to top of page
7. Take screenshot

**Terminal Method:**
```bash
# Using Firefox (headless)
firefox --headless --screenshot=/home/tolgabrk/projects/Auto-Company/projects/analytics-dashboard/public/screenshots/dashboard.png http://localhost:3000

# Using Chromium
chromium --headless --screenshot=/home/tolgabrk/projects/Auto-Company/projects/analytics-dashboard/public/screenshots/dashboard.png --window-size=1920,1080 http://localhost:3000
```

**Browser Method:**
- Windows/Linux: `Ctrl+Shift+S` (Firefox), `Ctrl+Shift+P` (Chrome - select "Capture node screenshot")
- macOS: `Cmd+Shift+4` (select area), then click

### Screenshot 2: Setup Wizard Step (Required)

**What to capture:**
- One of the 4 setup steps
- Progress indicator showing current step
- Clean, minimal UI
- Call-to-action buttons

**URL:** `http://localhost:3000/setup`

**Recommended Steps to Capture:**
- **Step 1 (Recommended):** Database initialization screen
- **Step 3:** Test event screen (shows interactivity)
- Step 2 or Step 4 are also acceptable

**Recommended Viewport:** 1920x1080 (desktop)

**Instructions:**
1. Navigate to `http://localhost:3000/setup`
2. Complete setup if needed (or click "Reset" to start over)
3. Stop at your chosen step
4. Set viewport to 1920x1080 (see above)
5. Take screenshot

**Terminal Method:**
```bash
# Step 1 example
firefox --headless --screenshot=/home/tolgabrk/projects/Auto-Company/projects/analytics-dashboard/public/screenshots/setup-step-1.png http://localhost:3000/setup
```

### Screenshot 3: Dark Theme Aesthetic (Optional)

**What to capture:**
- Dashboard in dark mode
- Shows design versatility
- Terminal brutalist aesthetic
- Color palette and typography

**URL:** `http://localhost:3000`

**Recommended Viewport:** 1920x1080 (desktop)

**Instructions:**
1. Navigate to `http://localhost:3000`
2. Toggle dark mode (if implemented) or use system dark theme
3. Set viewport to 1920x1080
4. Take screenshot

**Note:** As of current version, dark theme may require implementation. Check `app/globals.css` for theme variables.

### Screenshot 4: Mobile Responsive (Optional)

**What to capture:**
- Dashboard on mobile viewport
- Responsive design adaptation
- Touch-friendly interface

**URL:** `http://localhost:3000`

**Recommended Viewport:** 390x844 (iPhone 12/13 Pro)

**Instructions:**
1. Navigate to `http://localhost:3000`
2. Open DevTools (F12)
3. Toggle device mode (Ctrl+Shift+M)
4. Select "iPhone 12 Pro" or set 390x844
5. Take screenshot

**Terminal Method:**
```bash
firefox --headless --screenshot=/home/tolgabrk/projects/Auto-Company/projects/analytics-dashboard/public/screenshots/dashboard-mobile.png --window-size=390,844 http://localhost:3000
```

## Step 5: Organize Screenshots

Create the screenshots directory:

```bash
mkdir -p /home/tolgabrk/projects/Auto-Company/projects/analytics-dashboard/public/screenshots
```

**Recommended Naming Convention:**
```
public/screenshots/
├── dashboard-main.png           # Main dashboard (1920x1080)
├── setup-wizard-step-1.png      # Setup step 1 (1920x1080)
├── dashboard-dark-theme.png     # Dark mode variant (optional)
├── dashboard-mobile.png         # Mobile view (optional)
└── README.txt                   # Brief descriptions
```

## Screenshot Specifications

| Screenshot | Min Resolution | Aspect Ratio | File Size (max) |
|-----------|---------------|---------------|-----------------|
| Dashboard | 1920x1080 | 16:9 | 2MB |
| Setup | 1920x1080 | 16:9 | 1MB |
| Mobile | 390x844 | 9:19.5 | 500KB |

**Image Format:** PNG (lossless) for quality, or JPEG (80% quality) for smaller file sizes.

**Compression Tool (Optional):**
```bash
# Optimize PNG size
pngquant --quality=80-95 public/screenshots/*.png --output public/screenshots/

# Or convert to JPEG
convert public/screenshots/dashboard-main.png -quality 80 public/screenshots/dashboard-main.jpg
```

## Best Practices

### Before Shooting
- **Clear browser cache** to avoid stale data
- **Disable browser extensions** that might inject UI
- **Hide bookmarks bar** (Ctrl+Shift+B)
- **Use incognito/private mode** for clean browser chrome

### During Shooting
- **Wait for charts to load** fully before capturing
- **Ensure realistic data distribution** (not all zeros)
- **Check for responsive layout** at chosen viewport
- **Verify no dev tools overlap** in screenshot

### After Shooting
- **Rename files descriptively** (not `Screenshot_1.png`)
- **Compress if needed** for web performance
- **Verify metadata** (remove EXIF if sensitive)
- **Create README.txt** with brief descriptions

## Troubleshooting

### Server Not Starting
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill existing process
kill -9 $(lsof -t -i:3000)

# Restart dev server
npm run dev
```

### No Data Showing
- Complete setup wizard first
- Send test events (Step 3)
- Refresh dashboard page
- Check browser console for errors

### Screenshots Look Blurry
- Use PNG instead of JPEG
- Increase resolution (2x for retina displays)
- Disable browser zoom (set to 100%)
- Use native browser screenshot tools (not extensions)

### Charts Not Rendering
- Wait 5-10 seconds for data fetch
- Check browser console for API errors
- Verify `.data/analytics.db` exists
- Try hard refresh (Ctrl+Shift+R)

## Automation Script (Optional)

For automated screenshot capture:

```bash
#!/bin/bash
# screenshots.sh - Automated screenshot script

URL="http://localhost:3000"
DIR="/home/tolgabrk/projects/Auto-Company/projects/analytics-dashboard/public/screenshots"
mkdir -p "$DIR"

echo "Waiting for server..."
sleep 5

echo "Capturing dashboard..."
firefox --headless --screenshot="$DIR/dashboard-main.png" --window-size=1920,1080 "$URL"

echo "Capturing setup wizard..."
firefox --headless --screenshot="$DIR/setup-wizard-step-1.png" --window-size=1920,1080 "$URL/setup"

echo "Capturing mobile view..."
firefox --headless --screenshot="$DIR/dashboard-mobile.png" --window-size=390,844 "$URL"

echo "Screenshots saved to $DIR"
ls -lh "$DIR"
```

Run with:
```bash
chmod +x screenshots.sh
./screenshots.sh
```

## Next Steps

After capturing screenshots:
1. Review all screenshots for quality
2. Optimize file sizes for web
3. Update README.md with image references
4. Add to portfolio or documentation
5. Consider creating animated GIF for demo (optional)

---

**Project:** Analytics Dashboard  
**Version:** 0.1.0  
**Generated:** 2026-06-04  
**Purpose:** Documentation and marketing assets
