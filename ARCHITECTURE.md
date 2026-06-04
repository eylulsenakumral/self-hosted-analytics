# Architecture Decision Record

**Product:** Self-Hosted Analytics Dashboard
**Date:** Cycle #122 (2025-06-18)
**Status:** Production MVP

## Tech Stack Rationale

### Next.js 15 + App Router
**Why:** Familiar to target users (developers), Vercel deployment path, API routes built-in.
**Tradeoff:** Lock-in to Next.js ecosystem, but mitigated by standard React patterns.

### SQLite (better-sqlite3)
**Why:** Zero configuration, single file, easy backup/restore.
**Tradeoff:** Single-writer concurrency, but sufficient for 10K-100K events/day.
**Migration path:** Dump to PostgreSQL when scale demands it.

### Tailwind CSS v4
**Why:** Utility-first CSS, fast iteration, no build-step bloat.
**Tradeoff:** Class name verbosity, but improved readability.

### Recharts
**Why:** SVG-based charts, no API keys, client-side rendering.
**Tradeoff:** Less flexible than D3.js, but sufficient for MVP needs.

### TypeScript
**Why:** Type safety for API contracts, better IDE support.
**Tradeoff:** Build complexity, but outweighed by correctness gains.

## Data Architecture

### Schema Design

```sql
-- Events table (append-only log)
CREATE TABLE events (
  id TEXT PRIMARY KEY,           -- UUID
  type TEXT NOT NULL,             -- 'pageview', 'click', 'custom'
  properties TEXT,                -- JSON blob: {path, referrer, userAgent}
  session_id TEXT,                -- Foreign key to sessions
  created_at INTEGER NOT NULL     -- Unix ms timestamp
);

-- Sessions table (visitor tracking)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,            -- UUID
  started_at INTEGER NOT NULL,    -- Unix ms
  user_agent TEXT,                -- Browser/device string
  referrer TEXT                   -- First referrer
);
```

**Why this schema:**
- **Append-only events:** Immutable audit trail, easy to backup
- **JSON properties:** Flexible schema, no migrations needed
- **Session tracking:** Unique visitor counts without complex queries
- **Unix timestamps:** Timezone-agnostic, easy to query

### Indexing Strategy

```sql
CREATE INDEX idx_events_created ON events(created_at);
CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_type ON events(type);
```

**Why:** Optimizes common query patterns:
- Date range queries (dashboard charts)
- Session lookups (unique visitors)
- Type filtering (page views only)

**Tradeoff:** Slower writes (3 indexes vs 0), but faster reads (10-100x).

## API Architecture

### Endpoint Design

| Endpoint | Method | Purpose | Response Time |
|----------|--------|---------|---------------|
| `/api/track` | POST | Ingest events | < 100ms |
| `/api/stats` | GET | Aggregate metrics | < 200ms |
| `/api/pages` | GET | Top pages | < 200ms |
| `/api/referrers` | GET | Referrer breakdown | < 200ms |
| `/api/setup/init` | POST | Create database | < 500ms |
| `/api/setup/test` | POST | Test event | < 200ms |

**Why REST + JSON:**
- Simple, cacheable, standard
- No WebSocket complexity (poll every 30s instead)
- Easy to debug (curl/Postman)

### Event Ingestion Flow

```
1. Client: tracker.js queues events locally
2. Client: Batch sends every 10 events or 5 seconds
3. Server: POST /api/track receives JSON
4. Server: Validates and inserts to SQLite
5. Server: Returns 200 OK with count
```

**Why batching:**
- Reduces database writes (10 events = 1 INSERT batch)
- Improves performance (fewer HTTP requests)
- Respects DNT header (client-side check)

## Frontend Architecture

### Component Structure

```
app/
├── page.tsx              # Dashboard (main view)
├── setup/page.tsx        # Setup wizard
├── globals.css           # Theme and animations
└── layout.tsx            # Root layout with fonts

app/api/
├── track/route.ts        # Event ingestion
├── stats/route.ts        # Aggregated metrics
├── pages/route.ts        # Top pages query
├── referrers/route.ts    # Referrer breakdown
└── setup/
    ├── init/route.ts     # Database initialization
    └── test/route.ts     # Test event endpoint

lib/
└── db.ts                 # Database connection and schema

public/
└── tracker.js            # Client-side tracking script
```

### State Management

**No Redux/Zustand.** Using React built-in state:
- `useState` for UI state (modals, forms)
- `useEffect` for data fetching (poll every 30s)
- URL params for filters (date range)

**Why:** Simplicity. No external deps, easier to reason about.

### Styling Strategy

**CSS Custom Properties + Tailwind utilities:**

```css
:root {
  --bg-primary: #0a0a0b;
  --bg-secondary: #111113;
  --text-primary: #e4e4e7;
  --accent-green: #4ade80;
  /* ... */
}
```

```tsx
<div className="bg-bg-secondary text-text-primary">
  {/* Content */}
</div>
```

**Why:**
- Themeable (swap variables for light mode)
- Type-safe (no magic strings in Tailwind)
- Maintainable (single source of truth)

## Deployment Architecture

### Vercel (Primary)

```
┌─────────────────┐
│  GitHub Repo    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel Build   │
│  - Next.js build│
│  - Optimize deps│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Edge Functions │
│  - API routes   │
│  - SQLite in    │
│    /tmp/.data/  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CDN Cache      │
│  - Static assets│
│  - Tracker.js   │
└─────────────────┘
```

**Configuration:**
```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**Why Vercel first:**
- Zero-config deployment
- Edge Functions for global performance
- Built-in preview deployments
- Git integration (deploy on push)

### Self-Hosted (Docker)

```dockerfile
FROM node:20-alpine
RUN apk add --no-cache sqlite
COPY . .
RUN npm ci --production
CMD ["npm", "start"]
```

**Why Docker fallback:**
- Full control over infrastructure
- Persistent volumes for database
- No vendor lock-in

## Privacy Guarantees

### What Makes It Self-Hosted

1. **No external pixels** — All scripts hosted on user's domain
2. **No cloud analytics** — SQLite on user's server (Vercel = user's infra)
3. **No telemetry back to us** — Dashboard phones home to nowhere
4. **Full data export** — Download `.db` file anytime
5. **No authentication** — Single-tenant, access via localhost

### Data Flow

```
┌──────────────┐
│  Browser     │
│  (your site) │
└──────┬───────┘
       │
       │ POST /api/track
       │ {events: [...]}
       ▼
┌──────────────┐
│  Next.js     │
│  API Route   │
└──────┬───────┘
       │
       │ INSERT INTO events
       ▼
┌──────────────┐
│  SQLite DB   │
│  (.data/...) │
└──────────────┘
```

**No third parties. No intermediaries.**

## Performance Optimizations

### Client-Side

- **Batch events** — Queue 10 events before sending
- **Respect DNT** — Skip tracking if `navigator.doNotTrack === '1'`
- **Debounce flush** — Send every 5 seconds max

### Server-Side

- **WAL mode** — `PRAGMA journal_mode = WAL` for concurrent reads
- **Prepared statements** — SQLite query caching
- **Index-covered queries** — Use indexes for all filtered queries

### Frontend

- **Poll every 30s** — No WebSocket overhead
- **Staggered animations** — Fade-in on load (feels faster)
- **Minimal re-renders** — React.memo for expensive components

## Failure Modes

### Database Corruption

**Cause:** Disk full, concurrent writes, crash during write.

**Recovery:**
- Restore from backup (user's responsibility)
- Rebuild from raw logs (if logging enabled)
- Worst case: Lose events since last backup

**Mitigation:**
- WAL mode reduces corruption risk
- Daily backups of `.data/analytics.db`
- Monitor disk space

### Vercel Edge Resets

**Cause:** Edge Functions have ephemeral filesystem.

**Recovery:**
- Database lives in `/tmp/.data/sqlite.db`
- Persists for duration of deployment
- Lost on redeploy (acceptable tradeoff)

**Mitigation:**
- External database (Postgres) for production
- Export before redeploy

### Concurrent Writes

**Cause:** Multiple tabs writing simultaneously.

**Recovery:**
- SQLite locks database during write
- Queued writes retry automatically
- Client-side batching reduces contention

**Mitigation:**
- Warn user: "Database busy, close other tabs"
- Retry logic in tracker.js

## Migration Path

### When to Move to PostgreSQL

**Signals:**
- >1M events/day (SQLite writes slow down)
- Multi-instance deployments (need shared database)
- Real-time requirements (LISTEN/NOTIFY)

**Migration Cost:** 2-3 hours

```bash
# Dump SQLite
sqlite3 analytics.db .dump > dump.sql

# Import to Postgres
psql analytics_db < dump.sql

# Update connection string
DATABASE_URL=postgresql://...
```

**Code Changes:** Minimal (same SQL, different driver).

## Alternative Approaches Considered

### Why Not Event Sourcing?

**Considered:** Store events as immutable log, materialize views on read.

**Rejected:** Overkill for MVP. Adds complexity (projection updates, replay logic).

### Why Not ClickHouse?

**Considered:** Columnar database for analytics workloads.

**Rejected:** Overkill for 10K-100K events/day. SQLite is sufficient.

### Why Not Real-Time (WebSocket)?

**Considered:** Push events to dashboard as they arrive.

**Rejected:** Adds server complexity. Polling every 30s is simpler and good enough.

## Success Metrics

**Technical:**
- Setup time < 30 minutes ✓
- First event tracked < 5 minutes after paste ✓
- Dashboard load time < 1 second ✓

**Business:**
- 30% adoption rate (GitHub stars/forks vs views)
- Zero critical bugs in first 30 days
- <5% setup abandonment rate

## Evolution Path

**V1 (Current):** Page views only, single-tenant, SQLite.

**V2 (If adoption >30%):**
- Custom event tracking
- Multi-tenancy (auth required)
- PostgreSQL support

**V3 (If revenue >$1K/MRR):**
- Real-time dashboard (WebSocket)
- Funnel analysis
- A/B testing

**Principle:** Ship V1, measure adoption, only build V2 if demand exists.

---

**Architecture Owner:** CTO Vogels
**Implementation:** Fullstack DHH
**Review:** QA Bach
