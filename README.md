# Self-Hosted Analytics Dashboard

**Privacy-first analytics for developers. No API keys. No external services.**

A minimalist analytics dashboard you can deploy in under 3 hours. Track page views, visitors, and referrers — all stored in a SQLite database on your own server. Your data, your control.

## Why This Exists

Google Analytics is overkill. Mixpanel is expensive. You just want to know: *Who is visiting my site and what are they doing?*

This dashboard answers that question without:
- ❌ API keys or cloud services
- ❌ Third-party tracking scripts
- ❌ Complex configuration
- ❌ Vendor lock-in

## Screenshots

![Dashboard UI](./public/screenshots/dashboard.png)
*Main analytics dashboard with real-time metrics*

![Setup Wizard](./public/screenshots/setup.png)
*4-step setup wizard takes less than 30 minutes*

## Features

- **Event tracking** — Page views with referrer and session tracking
- **Dashboard UI** — Metrics, charts, and tables with brutalist terminal aesthetic
- **Self-hosted** — SQLite database stores everything on your server
- **Zero setup** — Copy one `<script>` tag and you're tracking
- **Privacy-first** — No data leaves your infrastructure
- **Developer-friendly** — Deploy like any Next.js app

## Quick Start (5 minutes)

```bash
# Clone and install
git clone https://github.com/yourusername/analytics-dashboard.git
cd analytics-dashboard
npm install

# Run development server
npm run dev

# Visit setup wizard
open http://localhost:3000/setup
```

### Step 1: Initialize Database

Click **"Initialize Database"** in the setup wizard. This creates `.data/analytics.db` in your project directory.

### Step 2: Add Tracking Script

Copy this snippet to your website's `<head>`:

```html
<script src="/tracker.js"></script>
```

### Step 3: Test and Verify

Click **"Send Test Event"** in the setup wizard. If successful, visit the dashboard to see your first event.

## Deployment (30 minutes)

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Deploy on Vercel
vercel import
# Follow prompts → Deploy
```

That's it. Vercel handles the rest. The database is stored in `.data/analytics.db` (local) or in the Edge Function filesystem (Vercel).

**Note:** Vercel Edge Functions use an ephemeral filesystem. Your database will persist between requests but may be lost on redeployment. For production use, consider:
1. Exporting your database regularly (download `.data/analytics.db` file)
2. Migrating to Vercel Postgres when you scale (see ARCHITECTURE.md for migration guide)

### Netlify

```bash
# Install sql.js for WASM SQLite
npm install sql-js

# Deploy
netlify deploy --prod
```

### Docker

```bash
# Build image
docker build -t analytics-dashboard .

# Run container
docker run -p 3000:3000 -v $(pwd)/data:/app/data analytics-dashboard
```

## What Gets Tracked

**Page views:**
- Path (e.g., `/about`, `/blog/first-post`)
- Referrer (e.g., `https://google.com`, `direct`)
- User agent string
- Timestamp

**Sessions:**
- Unique session ID (stored in localStorage)
- First seen timestamp
- Last activity

**Nothing else:** No clicks, scrolls, or custom events (yet). Privacy by default.

## Database Schema

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,              -- 'pageview', 'click', 'custom'
  properties TEXT,                 -- JSON blob
  session_id TEXT,
  created_at INTEGER NOT NULL      -- Unix ms
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  started_at INTEGER NOT NULL,
  user_agent TEXT,
  referrer TEXT
);
```

## API Endpoints

- `POST /api/track` — Ingest events
- `GET /api/stats?range=7` — Query aggregated stats
- `GET /api/pages?range=7` — Top pages data
- `GET /api/referrers?range=7` — Referrer breakdown
- `POST /api/setup/init` — Create database
- `POST /api/setup/test` — Send test event

## Tech Stack

- **Next.js 15** — App Router, API routes
- **SQLite** — Single-file database (better-sqlite3)
- **Recharts** — Chart rendering
- **Tailwind CSS** — Styling with custom theme
- **JetBrains Mono + Space Grotesk** — Typography

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

**Database not created:**
- Run the setup wizard at `/setup`
- Check that `.data/` directory exists
- Verify write permissions

**Events not appearing:**
- Check browser console for errors
- Verify tracker.js is loading
- Ensure tracking script is in `<head>`, not `<body>`

**Deployment fails:**
- Vercel: Check Edge Function memory limits (min 1024MB)
- Netlify: Ensure sql.js is installed for WASM support
- Docker: Verify volume mount for `/data` directory

**Database locked:**
- Close other dashboard tabs
- Only one write operation at a time
- Restart dev server if stuck

## Data Ownership

Your database file is `analytics.db` (or `.data/analytics.db`). You can:

- **Export:** Download the file anytime for backup
- **Delete:** Remove the file to reset all data
- **Migrate:** Import to PostgreSQL later if needed
- **Query:** Open with any SQLite browser

## Limitations (Intentional)

This is MVP scope. We're NOT building:

- User authentication (single-tenant only)
- Real-time WebSocket updates (poll every 30s instead)
- Custom event tracking (page views only for now)
- Geographic data or device breakdowns
- Funnel analysis or cohort retention
- Email reports or alerts
- A/B testing or heatmaps
- Multi-tenancy or SaaS mode
- API access or webhooks

Why? **Shipping time.** This takes 2-3 hours to build. Adding the above takes 2-3 weeks.

## Philosophy

**Convention over configuration:**
- Sensible defaults (90-day retention, batch every 10 events)
- No config files needed
- Works out of the box

**Majestic monolith:**
- Single deployment unit
- One database file
- No microservices complexity

**Programmer happiness:**
- Clean, readable code
- No boilerplate
- Fast iteration

## License

MIT — Do whatever you want. It's your data, your dashboard.

## Contributing

This is a reference implementation. Fork it, modify it, ship your own version.

---

**Built by Auto Company Cycle #122**
**Mission: Make money legally.**
**Success metric: 30% adoption rate**
