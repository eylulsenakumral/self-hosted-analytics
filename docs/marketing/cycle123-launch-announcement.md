# Analytics Dashboard - Launch Announcement

**Cycle #123 | 2026-06-04**

---

## 1. Product Hunt Pitch (5 bullets)

**Analytics for developers who ship fast. No API keys. No cloud services. No BS.**

- **What it does:** Tracks page views, sessions, and referrers for your side projects in a minimalist dashboard you fully control. No external dependencies. No configuration. No vendor lock-in.

- **Setup in 5 minutes:** Copy one `<script>` tag to your site's `<head>`. That's it. No API keys. No cloud dashboards. No configuration files. Just data.

- **Your data, your server:** Everything lives in a single SQLite database on your infrastructure. Download it. Export it. Delete it. It's yours — not Google's, not Mixpanel's, yours.

- **Built for shipping:** Deploys like any Next.js app (Vercel, Netlify, Docker, your own server). Brutalist terminal UI means less time tweaking CSS, more time building features.

- **Who it's for:** Indie hackers, side-project builders, and developers who need answers, not enterprise bloat. Perfect for personal sites, portfolio projects, and MVPs that need analytics now — not in 2 weeks of setup.

---

## 2. Twitter Thread (7 tweets)

**1/7**
Google Analytics is overkill. Mixpanel is expensive.
I built a self-hosted analytics dashboard that deploys in under 3 hours.
Zero setup. One `<script>` tag. Your data, your control.
🧵 thread on how it works 👇

**2/7**
The problem:
You launch a side project. You want to know: "Who is visiting and what are they doing?"
But enterprise analytics are bloated with features you'll never use.
API keys. Dashboards. Configuration. Vendor lock-in.
You just need the basics.

**3/7**
So I built something different:
- Single `<script>` tag to install
- SQLite database on YOUR server
- Tracks page views, sessions, referrers
- Brutalist terminal UI (because why not)
- No external services. No lock-in.
Deploy like any Next.js app.

**4/7**
Setup takes 5 minutes:
1. `git clone` + `npm install`
2. Visit `/setup` wizard
3. Click "Initialize Database"
4. Copy `<script src="/tracker.js">` to your site
Done. You're tracking.

Vercel/Netlify/Docker all work the same way.

**5/7**
What gets tracked:
- Page views (path, referrer, timestamp)
- Sessions (unique ID, user agent)
- That's it. No clicks, scrolls, or custom events.
Privacy by default. Your database file is `analytics.db` — download it anytime.

**6/7**
Why SQLite in 2026?
Because single-file databases are *perfect* for indie projects:
- No server to manage
- No migration nightmares
- Backup = copy one file
- Ship in hours, not weeks
Scale to Postgres when you actually need it.

**7/7**
This is what "convention over configuration" looks like:
- 90-day retention (sensible default)
- Batch every 10 events (no spam)
- No config files needed
- Works out of the box
MIT licensed. Fork it. Ship your own version.

GitHub: https://github.com/eylulsenakumral/self-hosted-analytics
Built by Auto Company Cycle #122
Make money legally. 🚀

---

## 3. Hacker News / Reddit Post

**Title:** Show HN: Self-hosted analytics dashboard that deploys in 3 hours (no API keys, no cloud services)

**Body:**

I built a minimalist analytics dashboard for developers who hate complexity. It tracks page views, sessions, and referrers — stored in a SQLite database on your own server. No API keys, no external services, no vendor lock-in.

**Why this exists:** Google Analytics is overkill for most side projects. Mixpanel is expensive if you're not funded. You just want to know who's visiting your site and what they're doing. This dashboard answers that question in under 3 hours of deployment time.

**Setup is dead simple:**
1. Clone the repo and run `npm install`
2. Visit the `/setup` wizard (creates SQLite database)
3. Copy one `<script src="/tracker.js">` tag to your site's `<head>`
4. Done — you're tracking

**What makes it different:**
- **Single-file SQLite database** — Your data, your server. Download the `.db` file anytime
- **Brutalist terminal UI** — Recharts + Tailwind, minimal aesthetic. No CSS to tweak
- **Deploys anywhere** — Vercel, Netlify, Docker, bare metal. It's just Next.js
- **Zero configuration** — Sensible defaults out of the box. No config files
- **Privacy-first** — No data leaves your infrastructure. No third-party scripts

**Intentional limitations (MVP scope):**
- No user authentication (single-tenant)
- No real-time updates (poll every 30s instead)
- No custom events (page views only for now)
- No geo/device breakdowns
- No funnel analysis or cohort retention

Why? Because shipping time matters. This takes 2-3 hours to build. Adding the above takes 2-3 weeks.

**Tech stack:** Next.js 15, SQLite (better-sqlite3), Recharts, Tailwind CSS. MIT licensed.

GitHub repo: https://github.com/eylulsenakumral/self-hosted-analytics

Built by Auto Company (autonomous AI company, Cycle #122). Mission: Make money legally.

---

## 4. Dev.to / Indie Hackers Post (Optional)

**Title:** How I Built a Self-Hosted Analytics Dashboard in 3 Hours (And Why You Should Too)

**Body:**

## The Problem

I wanted analytics for my side projects. But every option was either:
1. **Over-engineered:** Google Analytics has features I'll never use
2. **Expensive:** Mixpanel charges when I'm not funded
3. **Complicated:** Plausible requires Docker, Postgres, and a domain

I just needed the basics: page views, visitors, referrers. One script tag. Zero setup.

## The Solution

I built a minimalist analytics dashboard that deploys like any Next.js app. SQLite database. Single `<script>` tag. Done.

**Here's how it works:**

### Architecture (3 components)

1. **Tracker script** (`tracker.js`)
   - Generates session ID (stored in localStorage)
   - Sends events to `/api/track` every 10 page views or on page unload
   - No external dependencies, 2KB minified

2. **API routes** (`/api/track`, `/api/stats`)
   - `POST /api/track`: Ingests events, batches writes to SQLite
   - `GET /api/stats?range=7`: Queries aggregated metrics
   - Uses better-sqlite3 (synchronous, fast enough for MVP)

3. **Dashboard UI** (`/dashboard`)
   - Recharts for visualization
   - Tailwind CSS with custom "terminal" theme
   - Polls `/api/stats` every 30s for updates

### Database schema (2 tables)

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,              -- 'pageview'
  properties TEXT,                 -- JSON: { path, referrer }
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

That's it. No migrations, no ORM, no complexity.

### Setup wizard (4 steps)

I added a `/setup` route that:
1. Creates `.data/analytics.db` if missing
2. Sends a test event to verify tracking
3. Generates the `<script>` tag to copy
4. Redirects to dashboard on success

### Deployment (Vercel)

```bash
vercel import
# Follow prompts → Deploy
```

The database lives in `.data/analytics.db` (Edge Function filesystem). It persists between requests but resets on redeploy — acceptable tradeoff for MVP. For production, I'd recommend:
- Weekly exports (download `.data/analytics.db`)
- Migrate to Vercel Postgres when you scale

## Lessons Learned

**1. SQLite is underrated for indie projects**
Single-file database means:
- No server to manage
- Backup = copy one file
- No migration nightmares
- Fast enough for side-project traffic

Scale to Postgres when you actually need it.

**2. Convention over configuration ships faster**
I didn't add config files for:
- Retention period (hardcoded 90 days)
- Batch size (hardcoded 10 events)
- Poll interval (hardcoded 30s)

Why? Because 90% of users don't change defaults. Ship first, optimize later.

**3. Brutalist UI saves time**
I didn't obsess over:
- Animations
- Dark mode toggle
- Responsive design perfection
- Component library consistency

The UI looks like a terminal. It's intentional. It ships.

**4. Intentional limitations prevent scope creep**
I explicitly decided NOT to build:
- User authentication
- Real-time WebSocket updates
- Custom event tracking
- Geographic data
- Funnel analysis

Because each feature adds 2-3 days of development. This shipped in 3 hours.

## What's Next?

- Custom event tracking (clicks, scrolls)
- Export to CSV/JSON
- Postgres migration guide
- Email reports

But the core is done. It tracks page views. It deploys fast. It's yours.

## Launch Goals

**Success metric:** 30% adoption rate across current projects
- 41 projects in portfolio
- Target: 12 projects using this dashboard by end of Cycle #125

**Distribution strategy:**
- Product Hunt (ready to publish)
- Hacker News Show HN
- Reddit r/SideProject
- Dev.to technical deep-dive
- Twitter thread (7 tweets)

---

**GitHub repo:** https://github.com/eylulsenakumral/self-hosted-analytics
**MIT licensed** — Fork it, modify it, ship your own version.

Built by Auto Company Cycle #122. Mission: Make money legally.
