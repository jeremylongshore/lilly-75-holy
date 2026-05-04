# Technical Spec: lilly-75-holy

**Author:** Jeremy Longshore
**Date:** 2026-05-03
**Status:** Approved

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js 22 | matches CI matrix |
| Framework | Next.js 15 (App Router) | standalone output for Docker |
| Language | TypeScript (strict) | |
| Styling | Tailwind CSS 4 | mobile-first |
| UI primitives | hand-rolled shadcn-style | no @radix-ui dependency in v1 to keep build lean |
| Database | SQLite via `better-sqlite3` | single-file, in a Docker volume |
| Auth | invite codes + signed cookie | bcryptjs (no native build) for hashing |
| Validation | zod | request body validation |
| Package manager | pnpm | |

## Database schema (`db/schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS users (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL UNIQUE,
  invite_code_hash      TEXT NOT NULL,
  cut_food_item         TEXT,
  challenge_start_date  TEXT NOT NULL DEFAULT '2026-05-04',
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash   TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at   TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date  TEXT NOT NULL,             -- YYYY-MM-DD
  rules_json  TEXT NOT NULL,             -- {"water":true,"prayer":true,...}
  journal     TEXT,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, entry_date)
);

CREATE TABLE IF NOT EXISTS weekly_counters (
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  iso_week       TEXT NOT NULL,          -- 2026-W18
  desserts_count INTEGER NOT NULL DEFAULT 0,
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(user_id, iso_week)
);

CREATE TABLE IF NOT EXISTS auth_attempts (
  ip          TEXT NOT NULL,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip_time ON auth_attempts(ip, attempted_at);
```

## API surface

| Method | Path | Body | Response | Auth required |
|---|---|---|---|---|
| POST | `/api/auth` | `{ name, code }` | `{ ok: true }` + session cookie | no |
| POST | `/api/auth/logout` | — | `{ ok: true }` | yes |
| PUT | `/api/checkin` | `{ entry_date, rules_json }` | `{ ok: true }` | yes |
| PUT | `/api/journal` | `{ entry_date, journal }` | `{ ok: true }` | yes |
| POST | `/api/dessert/inc` | — | `{ count: N }` | yes |
| POST | `/api/cut-food` | `{ cut_food_item }` | `{ ok: true }` | yes (only if not set) |
| GET | `/api/me` | — | `{ id, name, cut_food_item, start_date, today, week_dessert_count }` | yes |
| GET | `/api/buddy` | — | `{ name, today_rules, journal_present, streak, week_dessert_count }` (NO journal text) | yes |
| GET | `/api/history` | `?user=me\|buddy` | `{ entries: [{date, rules_json, journal_present, complete}] }` (no journal text for buddy) | yes |

## Environment variables

| Var | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_PATH` | yes | `./data/holy.db` | SQLite file location |
| `SESSION_SECRET` | yes | — | HMAC key for session cookies (32+ bytes hex). Stored in `.env.sops`. |
| `TZ` | no | `America/New_York` | Date math timezone |
| `NODE_ENV` | no | `development` | Standard |
| `PORT` | no | `3000` | Listen port |

## Migration strategy

`src/lib/db.ts` runs a tiny migration runner on app boot:

1. `CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TEXT)`
2. Read every file in `db/migrations/*.sql`, sorted by filename.
3. For each: skip if already in `schema_migrations`, else run it inside a transaction and insert the filename.

Idempotent. No dedicated migration CLI needed.

## Session cookie format

```
holy_session = <token>.<sig>
  token = 32 random bytes, base64url
  sig   = HMAC-SHA256(token, SESSION_SECRET), base64url
```

Server-side: stored hash is `sha256(token)`, looked up in `sessions` table.

## Rate limiter (auth endpoint)

In `src/lib/auth.ts`:
- On each `POST /api/auth`, insert `(ip, now)` into `auth_attempts`.
- Count rows for `(ip, attempted_at >= now - 15min)`. If >= 5, return `429 Too Many Requests`.
- Cleanup: opportunistic delete of rows older than 1 hour on each request.

## Buddy view privacy enforcement

`src/lib/buddy.ts` exposes:

```ts
type BuddySnapshot = {
  name: string;
  today_rules: Record<string, boolean>;
  journal_present: boolean;     // ← NEVER `journal: string`
  streak: number;
  week_dessert_count: number;
};

export function buddySnapshot(buddyUserId: string): BuddySnapshot
export function buddyHistory(buddyUserId: string): Array<{date, rules_json, journal_present, complete}>
```

There is no other code path that returns the buddy's data. Endpoint code calls these helpers; tests assert that `JSON.stringify(...)` of any buddy response never contains the literal journal column.

## Deploy workflow (`.github/workflows/deploy.yml`)

```
on: push to main
jobs:
  deploy:
    - checkout
    - tailscale connect (oidc)
    - ssh into VPS
    - cd /srv/lilly-75-holy && git pull --ff-only
    - docker compose up -d --build
    - curl -fsS https://dixieroad.org/api/healthz | grep ok
```

## Local dev port map

| Port | Service |
|---|---|
| 3000 | Next.js dev server |
| (none) | DB is a file, not a server |
