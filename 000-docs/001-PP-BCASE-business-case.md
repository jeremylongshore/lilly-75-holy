# Business Case: lilly-75-holy

> A 75-day Christian discipline tracker for two users (Lilly Grace + Ellie) — daily checklist, private journal, streak calendar, and shared buddy view.

**Author:** Jeremy Longshore
**Date:** 2026-05-03
**Status:** Approved

## Problem Statement

Lilly Grace and her friend Ellie committed to a 75-day Christian discipline challenge ("75 Holy") — 13 daily/weekly rules covering prayer, scripture, hydration, exercise, social-media limits, worship time, and a daily journal. They need a way to:

1. Track their daily progress without forgetting a rule
2. See each other's progress for mutual encouragement
3. Keep a private journal of how the challenge is going

Existing habit-tracker apps either don't fit the 75 Holy rule structure, require account-creation friction Lilly doesn't want to manage, or charge subscriptions for two-user accountability. Most also default to public/social posting, which isn't the goal here — this is between two people.

## Target Customer

| Segment | Role | Pain Level |
|---------|------|-----------|
| Lilly Grace | Primary user — high schooler, on phone | High (no good option) |
| Ellie | Co-participant — same demographic | High |

## Decision

- [x] Approved
- [ ] Rejected
- [ ] Deferred

**Rationale:** Daughter asked. Challenge starts tomorrow (2026-05-04). DNS already points at the VPS. Stack is one Jeremy already runs (Next.js + Docker + Caddy on the intentsolutions VPS). Cost: $0 incremental hosting (consolidated VPS).

## Success Criteria

| Criterion | Measure |
|-----------|---------|
| Lilly + Ellie log in on day 1 without help | Single-step name + 6-char code |
| Both users complete day 1 fully | All 13 rules + journal saved by both |
| Buddy view works | Each user can see the other's checks (not journal text) |
| Day 75 streak intact | App still serves the calendar correctly on 2026-07-17 |
| Zero support tickets to Dad | No "I can't log in" texts after the first 24 hours |
