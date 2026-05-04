# Architecture: lilly-75-holy

**Author:** Jeremy Longshore
**Date:** 2026-05-03
**Status:** Approved

## System diagram

```
              ┌──────────────────────┐
  user phone  │ Caddy (443)          │       Intent Solutions VPS
  ────────────► dixieroad.org        │       (167.86.106.29)
              │ reverse_proxy        │
              │ 127.0.0.1:3000       │
              └─────────┬────────────┘
                        │
              ┌─────────▼────────────┐
              │ Docker container     │
              │ holy-app:latest      │
              │ Next.js 15 standalone│
              │ Node 22, port 3000   │
              └─────────┬────────────┘
                        │ better-sqlite3
              ┌─────────▼────────────┐
              │ Docker named volume  │
              │ holy-data            │
              │ /data/holy.db        │  ◄── nightly Borg backup
              └──────────────────────┘
```

## Component breakdown

| Component | Responsibility |
|---|---|
| `src/app/page.tsx` | Login form (name + 6-char code). POSTs to `/api/auth`. |
| `src/app/today/page.tsx` | Logged-in home: today's 13 rules + journal + buddy panel. |
| `src/app/history/page.tsx` | 75-day calendar grid (you + buddy, side by side). |
| `src/app/api/auth/route.ts` | Validates code (bcrypt compare), issues session cookie. |
| `src/app/api/checkin/route.ts` | PUTs today's daily-rule booleans into `daily_entries`. |
| `src/app/api/journal/route.ts` | PUTs today's journal text. Debounced client-side. |
| `src/app/api/buddy/route.ts` | GETs the buddy's checks + streak — never returns journal text. |
| `src/lib/db.ts` | better-sqlite3 connection pool + migration runner (idempotent). |
| `src/lib/auth.ts` | Code verify, session cookie sign/verify, rate limiter. |
| `src/lib/rules.ts` | The 13 rules definition — single source of truth. |
| `src/lib/buddy.ts` | Helpers that scrub `journal` text from any cross-user response. |
| `scripts/generate-invite-code.ts` | One-shot CLI: prints code + writes hash to DB. |

## Data flow — daily check-in

1. User taps a checkbox on `/today`.
2. Client builds the full `rules_json` object and PUTs to `/api/checkin`.
3. Server validates session, upserts the row in `daily_entries` keyed on `(user_id, entry_date)`.
4. Client also polls `/api/buddy` every 30s when `/today` is open to refresh the buddy panel.

## Data flow — journal save

1. User types in the textarea on `/today`.
2. Client debounces (1500ms after last keystroke) and PUTs to `/api/journal`.
3. Server upserts `journal` column in `daily_entries`.
4. **`/api/buddy` never returns this text.** It only returns `journal_present: boolean`.

## Auth flow

```
client POST /api/auth { name, code }
  └─► server: rate-limit check by IP
       └─► fetch user by name
            └─► bcrypt.compare(code, invite_code_hash)
                 └─► generate session token (32 random bytes)
                      └─► store sha256(token) in `sessions` table
                           └─► set-cookie: holy_session=<token>; HttpOnly; Secure; SameSite=Lax; Max-Age=1y
                                └─► 200 { redirect: "/today" }
```

## Database schema

See [005-AT-SPEC-technical-spec.md](005-AT-SPEC-technical-spec.md) and `db/schema.sql`.

## Deployment topology

| Layer | Detail |
|---|---|
| DNS | dixieroad.org → 167.86.106.29 (already in place from prior braves redirect) |
| TLS | Caddy auto-renews via Let's Encrypt |
| Reverse proxy | Caddy `/etc/caddy/Caddyfile` block: `reverse_proxy 127.0.0.1:3000` |
| App container | Single container, `restart: unless-stopped`, binds 127.0.0.1:3000 only |
| DB | Docker named volume `holy-data`, mounted at `/data` in the container |
| Backup | Existing Borg config picks up `holy-data` via volume scan |
| CI/CD | GitHub Actions → Tailscale OIDC → SSH → `git pull && docker compose up -d --build` |

## Threat model (lightweight)

| Threat | Mitigation |
|---|---|
| Code brute-force | Rate limit 5 attempts / 15 min / IP; codes are 36^6 = ~2.2B keyspace |
| Session theft | HttpOnly cookie, Secure, SameSite=Lax, signed |
| SQL injection | Parameterized queries via better-sqlite3 prepared statements |
| Buddy reading journal | Server-side scrub in `lib/buddy.ts`; covered by tests |
| DB exfiltration | Only Jeremy + the `intentsolutions` user have shell on the VPS; data is in a Docker volume not exposed |
| Repo leaks data | `.gitignore` covers all data files; CI has no secrets in plaintext |
