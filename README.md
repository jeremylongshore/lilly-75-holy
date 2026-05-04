# 75 Holy

> A 75-day Christian discipline tracker — daily checklist, journal, streak calendar, and a buddy view so the two of you can see each other's progress.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/jeremylongshore/lilly-75-holy/actions/workflows/ci.yml/badge.svg)](https://github.com/jeremylongshore/lilly-75-holy/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/jeremylongshore/lilly-75-holy)](https://github.com/jeremylongshore/lilly-75-holy/releases)

Hosted at **[dixieroad.org](https://dixieroad.org)**. Challenge starts **2026-05-04**.

## What it is

A two-person habit tracker for the **75 Holy** challenge — 75 days of daily disciplines centered on prayer, scripture, worship, exercise, and being present.

Built for my daughter Lilly Grace and her friend. Public source, private data.

## The 13 rules

| # | Rule | Type |
|---|---|---|
| 1 | 1 gallon of water | daily |
| 2 | Prayer at every meal, morning, and night | daily |
| 3 | 30–60 minute workout | daily |
| 4 | ≤1 hour social media | daily |
| 5 | Call a loved one | daily |
| 6 | ≤1 dessert per week | weekly counter |
| 7 | 1 chapter of the Bible | daily |
| 8 | ≥30 minutes of a hobby | daily |
| 9 | ≥15 minutes worship space (no phone, Jesus + music only) | daily |
| 10 | No social media after 9pm | daily |
| 11 | Worship music / Christian podcasts only | daily |
| 12 | Cut one food item for 75 days | one-time pick + daily compliance |
| 13 | Daily journal entry | daily text |

A **complete day** = all daily checkboxes ticked + journal saved + dessert/cut-food rules respected.

## Buddy view (encouragement, not surveillance)

Both users can see each other's daily progress on `/today` and `/history`:

- **Shared**: which checkboxes the other person has ticked, whether they wrote a journal entry today, current streak, week-over-week dessert count.
- **Never shared**: the **text** of journal entries. Journals are private.

Designed so two people doing this together can encourage each other, not snoop on each other.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **shadcn-style** components (hand-rolled — no UI lock-in)
- **SQLite** via `better-sqlite3` (single-file DB, easy backup)
- **Auth**: 6-character invite codes, no passwords, no email
- **Hosting**: Docker + Caddy reverse proxy on the Intent Solutions VPS

## Running locally

```bash
pnpm install
cp .env.example .env
pnpm run db:migrate
pnpm run dev
```

Then visit `http://localhost:3000`.

To generate an invite code:

```bash
pnpm run invite -- --user "Lilly Grace"
# prints: code=ABC123 (give to user; only the hash is stored)
```

## Privacy

This repo is public. **The data is not.** Journal entries, daily checks, and invite codes never enter git:

- The SQLite file lives in a Docker named volume on the VPS — Borg backs it up.
- All secrets (session signing key, etc.) live in `.env.sops` (encrypted with age).
- Invite codes are bcrypt-hashed before storage; the plaintext is shown once at generation.
- `.gitignore` covers `data/`, `*.db`, `*.db-*`, `.env`, `.env.local`.
- Buddy view shares **completion state**, not journal text.

## Documentation

| Doc | Purpose |
|-----|---------|
| [Business case](000-docs/001-PP-BCASE-business-case.md) | Why this exists |
| [Product requirements](000-docs/002-PP-PRD-product-requirements.md) | What it does |
| [Architecture](000-docs/003-AT-ARCH-architecture.md) | How it's built |
| [User journey](000-docs/004-PP-UJRN-user-journey.md) | First-day flow |
| [Technical spec](000-docs/005-AT-SPEC-technical-spec.md) | Stack + deploy |
| [Status](000-docs/006-OD-STAT-status.md) | Current state |

## License

MIT — see [LICENSE](LICENSE).

## Author

**Jeremy Longshore** — built for Lilly Grace and her friend.
