# CLAUDE.md

## Project Overview

**lilly-75-holy** — a 75-day Christian discipline tracker for Lilly Grace and her friend. Daily checklist, private journal, streak calendar, and a buddy view for shared progress.

- **Repo**: https://github.com/jeremylongshore/lilly-75-holy (public)
- **Domain**: https://dixieroad.org (production VPS)
- **Stack**: Next.js 15 (App Router) + TypeScript + Tailwind + SQLite (better-sqlite3) + Docker + Caddy
- **License**: MIT
- **Bead**: OPS-vvw
- **Challenge start date**: 2026-05-04 (default for both users; per-user override available via the DB)

## Privacy posture (public repo, private data)

This repo is **public on GitHub**. The two users' journal entries, daily checks, and invite codes must never enter git:

- `.gitignore` covers `data/`, `*.db`, `*.db-*`, `.env`, `.env.local`
- SQLite file lives in a Docker named volume (`holy-data`) on the VPS — Borg backs it up
- Secrets (session signing key, etc.) live in `.env.sops` (age-encrypted) per IS SOPS SOP
- Invite codes are bcrypt-hashed before storage; plaintext is printed once by `scripts/generate-invite-code.ts`

### Buddy view privacy line

The **buddy view** is opinionated about what is shared between the two users:

| Field | Visible to buddy? | Notes |
|---|---|---|
| Each daily checkbox state (true/false per rule) | yes | so they can encourage each other |
| Whether journal exists for a date | yes | shows "wrote today" indicator |
| **Journal text** | **no** | never returned by any buddy-scoped API |
| Cut-food item | yes | shared accountability target |
| Current streak / completed days count | yes | leaderboard-style motivation |
| Weekly dessert count | yes | shared discipline check |

API rule: any endpoint that returns the buddy's data **must omit `journal`** from the response. There is no admin override. The two users are technically symmetric — neither has elevated access to the other's journal.

## Auth model

6-character invite codes, no passwords, no email, no reset flow. Per the user's explicit ask:
"login must be dead simple — no password resets and stuff."

If a phone is lost: Jeremy regenerates a code and hands it off in person. That's the entire reset story.

## Build & test

```bash
pnpm install              # deps
cp .env.example .env      # local env
pnpm run db:migrate       # apply SQL migrations
pnpm run dev              # http://localhost:3000
pnpm run build            # next build (standalone output for Docker)
pnpm run lint             # next lint
pnpm run invite -- --user "Name"   # generate a 6-char invite code
```

## Project structure

```
lilly-75-holy/
├── 000-docs/             # 6-doc enterprise set (business case → status)
├── .github/              # CI, deploy workflow, issue/PR templates
├── data/                 # SQLite file in dev (gitignored)
├── db/
│   ├── schema.sql
│   └── migrations/       # numbered SQL migrations applied at boot
├── scripts/
│   └── generate-invite-code.ts
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # auth, checkin, journal, buddy endpoints
│   │   ├── today/        # the daily checklist + buddy panel (home for logged-in users)
│   │   ├── history/      # 75-day streak calendar (both users)
│   │   └── page.tsx      # login (name + code)
│   ├── components/       # UI primitives + feature components
│   └── lib/              # db, auth, rules (single source of truth)
├── Dockerfile
└── docker-compose.yml
```

## Conventions

- **Single source of truth for the 13 rules**: `src/lib/rules.ts`. Don't duplicate the rule list anywhere else.
- **Date strings**: always `YYYY-MM-DD` in the user's local timezone (set via `TZ` env var, default `America/New_York`).
- **ISO weeks**: dessert counter is keyed by ISO week (`YYYY-Www`).
- **Buddy data**: any new endpoint that surfaces the other user's data **must scrub `journal` text** before returning. Add to `src/lib/buddy.ts` helpers, don't write ad-hoc projections.
- **Commit style**: conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).
- **Branch strategy**: feature branches, PR to main. Main is what deploys.

## Deployment

CI/CD via `.github/workflows/deploy.yml`:
1. Push to `main` triggers the workflow
2. Tailscale OIDC connects to the VPS over the tailnet
3. SSH executes `cd /srv/lilly-75-holy && git pull --ff-only && docker compose up -d --build`
4. Caddy continues to terminate TLS at the public edge (already configured for dixieroad.org)

The container binds to `127.0.0.1:3000` on the host. Caddy reverse-proxies. The SQLite DB lives in a named Docker volume so it survives redeploys and gets picked up by Borg.

## Operational rules (per global ~/.claude/CLAUDE.md)

- **Never `caddy restart`** on the VPS — only `caddy validate && systemctl reload caddy`. Restart kills 24 prod containers.
- **Never `docker restart`** the daemon — same reason.
- **VPS access**: `ssh intentsolutions` over Tailscale, sudo as `intentsolutions` user.
- **Caddy block** for dixieroad.org lives in `/etc/caddy/Caddyfile`. The legacy redirect-to-scorecardecho was replaced with `reverse_proxy 127.0.0.1:3000`. The `@legal` matcher (privacy.html, terms.html) was preserved.

## Task tracking with beads

- Bead: **OPS-vvw** ("75 Holy app for Lilly Grace at dixieroad.org")
- Workflow: `bd update <id> --status in_progress` → work → `bd close <id> --reason "evidence"` → `bd-sync close <id> --also-close-gh`
