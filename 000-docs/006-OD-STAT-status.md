# Status: lilly-75-holy

> A 75-day Christian discipline tracker for two users (Lilly Grace + Ellie).

**Last Updated:** 2026-05-03

## Current State

- [x] Project scaffolded (governance + 6-doc set via `/repo-dress`)
- [ ] Core functionality implemented (login, today, history, buddy view)
- [ ] Tests written
- [x] CI/CD workflow stubbed (release.yml from template; deploy.yml custom)
- [x] Documentation complete (this 6-doc set)
- [ ] Initial release (v0.1.0)
- [ ] Deployed to dixieroad.org
- [ ] Invite codes generated for Lilly + Ellie
- [ ] Day 1 smoke test (2026-05-04)

## Blockers

| Blocker | Owner | ETA |
|---------|-------|-----|
| None | — | — |

## Next Steps

1. Finish first commit (governance + scaffold) and push to `github.com/jeremylongshore/lilly-75-holy`
2. Build out source code for login, today, history, buddy view
3. Wire up Dockerfile + docker-compose; build locally and smoke-test
4. Cut over `dixieroad.org` Caddy block from redirect → reverse_proxy
5. Deploy via push to main
6. Generate codes, hand off to Lilly + Ellie

## Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Day-1 successful login (both users) | 2 / 2 | — |
| Day-by-day completion rate | 75 / 75 per user | — |
| Buddy panel exposure of journal text | 0 (must be zero) | — |
| Open issues | <10 | 0 |

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-03 | Build vs use Beaverhabits | Build — easier to customize for the 13 specific rules and the buddy view |
| 2026-05-03 | Auth = invite codes, not magic link | User explicit ask: no password resets, no email plumbing |
| 2026-05-03 | SQLite, not Postgres | 2 users × 75 days = trivial scale; one-file backup |
| 2026-05-03 | Hand-rolled UI primitives, not full shadcn install | Faster cold-start; can install shadcn later if Lilly wants more components |
| 2026-05-03 | Buddy view shares checks but not journal text | Privacy line drawn explicitly in API design |
| 2026-05-03 | Public repo, private data | Standard pattern; data lives in a Docker volume, never in git |
| 2026-05-03 | Friend confirmed = Ellie | For invite-code label; no PII beyond first name in the repo |

## Release History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | TBD | Initial release: login, today, history, buddy view, deploy workflow |
