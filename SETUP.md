# Setup Guide

Complete setup in under 30 minutes, guaranteed.

## Prerequisites

- Node.js 18+ installed
- Git installed
- A website to track (can be localhost for testing)

## Step 1: Clone and Install (5 minutes)

```bash
git clone https://github.com/yourusername/analytics-dashboard.git
cd analytics-dashboard
npm install
```

**What this does:**
- Downloads the project
- Installs Next.js, React, SQLite, and charting libraries

**Troubleshooting:**
- `npm install` fails? Try `npm cache clean --force` then retry
- Node version too old? Update with `nvm install 18`

## Step 2: Run Development Server (2 minutes)

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll see the dashboard (empty for now).

**What this does:**
- Starts Next.js development server
- Serves the dashboard UI at port 3000

**Troubleshooting:**
- Port 3000 in use? Run `PORT=3001 npm run dev`
- Server won't start? Check Node version (must be 18+)

## Step 3: Initialize Database (3 minutes)

Visit `http://localhost:3000/setup` and click **"Initialize Database"**.

This creates `.data/analytics.db` in your project directory.

**What this does:**
- Creates SQLite database file
- Sets up `events` and `sessions` tables
- Creates indexes for performance

**Verify it worked:**
```bash
ls -la .data/analytics.db
# Should show file size and timestamp
```

**Troubleshooting:**
- Button does nothing? Check browser console for errors
- `.data/` directory missing? Create it manually: `mkdir .data`
- Write permission error? Check directory permissions

## Step 4: Add Tracking Script (5 minutes)

The setup wizard shows a tracking snippet:

```html
<script src="/tracker.js"></script>
```

**Copy this to your website:**

1. Open your website's HTML
2. Find the `<head>` section
3. Paste the snippet as the first line
4. Save and refresh your site

**Example for a simple HTML site:**

```html
<!DOCTYPE html>
<html>
<head>
  <script src="http://localhost:3000/tracker.js"></script>
  <!-- Your other meta tags -->
</head>
<body>
  <h1>My Website</h1>
</body>
</html>
```

**For Next.js sites:**

Add to `app/layout.tsx`:

```tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script src="http://localhost:3000/tracker.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**What this does:**
- Loads the tracker script on your site
- Automatically tracks page views
- Sends events to your dashboard

**Troubleshooting:**
- Script not loading? Check the URL path (must be absolute)
- CORS errors? Ensure dashboard and site are on same origin during dev
- Events not appearing? Check browser console for errors

## Step 5: Test Event Tracking (2 minutes)

Back in the setup wizard, click **"Send Test Event"**.

This sends a test event to verify everything works.

**Verify it worked:**
1. Click the button
2. See "✓ Test event created successfully!"
3. Click "View Dashboard"
4. See "1 page view" in the metrics

**Troubleshooting:**
- Test fails? Check that database was initialized
- No events in dashboard? Wait 30 seconds and refresh
- Database error? Ensure `.data/analytics.db` exists

## Step 6: Verify Real Tracking (3 minutes)

1. Open your website in a new tab
2. Navigate around (visit 2-3 pages)
3. Go back to the dashboard
4. Refresh the page

You should see:
- Page views increased
- Your pages listed in "Top Pages"
- Referrer data (if you came from another site)

**Troubleshooting:**
- Still no events? Check browser console on your site
- Events showing but pages not listed? Wait 30 seconds, metrics cache
- Wrong referrer? Ensure you navigated from an external link

## Step 7: Deploy to Production (10 minutes)

### Option A: Vercel (Recommended)

```bash
# Push to GitHub
git add .
git commit -m "Initial setup"
git push origin main

# Deploy
vercel import
# Follow prompts:
# - Link to existing GitHub repo
# - Keep default settings
# - Deploy
```

**Post-deploy steps:**
1. Update tracking script URL on your site:
   ```html
   <script src="https://your-domain.vercel.app/tracker.js"></script>
   ```
2. Visit `/setup` on your deployed URL
3. Re-initialize database (Vercel uses different storage)
4. Test event tracking again

**Troubleshooting:**
- Deploy fails? Check Vercel dashboard for build logs
- Database not created? Ensure Edge Functions have 1024MB memory
- Events not received? Check CORS settings (must be same domain)

### Option B: Netlify

```bash
# Install sql.js for WASM support
npm install sql-js

# Deploy
netlify deploy --prod
```

### Option C: Docker

```bash
# Build
docker build -t analytics-dashboard .

# Run
docker run -p 3000:3000 -v $(pwd)/data:/app/data analytics-dashboard
```

## Step 8: Configure Your Live Site (5 minutes)

Update the tracking script on your production site:

```html
<!-- Replace with your actual dashboard URL -->
<script src="https://analytics.yourdomain.com/tracker.js"></script>
```

**Verify production tracking:**
1. Visit your live site
2. Navigate around
3. Check your production dashboard
4. See events appearing

## Common Issues

**Issue: "Database is locked"**
- Cause: Multiple tabs writing simultaneously
- Fix: Close other dashboard tabs, retry

**Issue: "No events appearing"**
- Cause: Tracker script not loading or CORS error
- Fix: Check browser console, verify script URL

**Issue: "Deployment failed"**
- Cause: Missing dependencies or build error
- Fix: Check deploy logs, ensure `npm install` succeeded

**Issue: "Events show but pages are empty"**
- Cause: Metrics cache or query timing
- Fix: Wait 30 seconds, refresh dashboard

## Data Privacy Checklist

Before going live, verify:

- ✓ No API keys in environment variables
- ✓ Database file exists in expected location
- ✓ Tracking script uses HTTPS (production)
- ✓ CORS allows your domain
- ✓ No telemetry being sent to third parties
- ✓ Database backup strategy in place

## Next Steps

Once setup is complete:

1. **Check dashboard daily** — Monitor traffic trends
2. **Export database weekly** — Backup `.data/analytics.db`
3. **Clean up old data** — Run `POST /api/maintenance/cleanup?days=90` to delete events older than 90 days
4. **Customize as needed** — Fork and modify code

## Maintenance

### Database Cleanup

Your database will grow over time. To prevent performance issues, clean up old events periodically.

**Automatic cleanup (recommended):**
```bash
# Add to your crontab or scheduler
curl -X POST https://your-domain.vercel.app/api/maintenance/cleanup?days=90
```

**Manual cleanup:**
```bash
curl -X POST http://localhost:3000/api/maintenance/cleanup?days=90
```

This deletes events older than 90 days (adjust `days` parameter as needed).

### Database Backup

**Local development:**
```bash
cp .data/analytics.db backup/analytics-$(date +%Y%m%d).db
```

**Vercel deployment:**
1. SSH into your deployment
2. Download `.data/analytics.db` from the filesystem
3. Or use the export button in the dashboard UI (coming soon)

## Support

If you're stuck:

1. Check this guide's troubleshooting section
2. Review error messages in browser console
3. Verify each step completed successfully
4. Check GitHub issues for similar problems

---

**Total time: ~30 minutes**
**Difficulty: Beginner-friendly**
**Prerequisites: Node.js, Git, basic HTML knowledge**
