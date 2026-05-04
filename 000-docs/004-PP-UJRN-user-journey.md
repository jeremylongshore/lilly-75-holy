# User Journey: lilly-75-holy

**Author:** Jeremy Longshore
**Date:** 2026-05-03
**Status:** Approved

## Personas

### Lilly Grace (primary user)
- Phone: iPhone, latest iOS, Safari
- Tech literacy: high for her demographic; uses TikTok, IG, iMessage daily
- Patience for friction: zero — if it asks for an email or makes her remember a password, she's out
- Goal: complete the 75 Holy challenge with Ellie; track it on her phone

### Ellie (secondary user)
- Same demographic, same constraints, same goal
- Will get her code from Lilly in person

## Day 0 — Jeremy sets up

1. Jeremy generates two codes:
   ```bash
   pnpm run invite -- --user "Lilly Grace"
   # → code=KX4N7B
   pnpm run invite -- --user "Ellie"
   # → code=Q9MR2L
   ```
2. Jeremy gives each girl her code in person (text message OK if needed).

## Day 1 — Lilly's first session (challenge starts 2026-05-04)

1. Lilly opens Safari, types `dixieroad.org`.
2. Login page loads — two fields: "Your name" and "6-character code".
3. She types "Lilly Grace" and "KX4N7B", taps **Start**.
4. Lands on `/today`.
5. Sees:
   - Header: "Day 1 of 75 — Sunday, May 4"
   - **The 12 daily checkboxes** with the rule text next to each
   - **Cut-food picker** (first time only): "Pick the food item you're cutting for 75 days." She types "soda" and saves.
   - **Dessert counter**: "Desserts this week: 0 / 1" with a `+1` button
   - **Journal textarea**: "Today, I…"
   - **Buddy panel**: shows Ellie's name and the checks Ellie has ticked so far today (empty if Ellie hasn't logged in yet)
6. Lilly drinks water, ticks the box. The check persists immediately.
7. End of day: she's ticked all 12, written a journal entry, dessert count is 0. The day is **complete**.
8. She closes the app. Session cookie keeps her logged in.

## Day 2+ — Daily flow

1. Lilly opens the app from her home screen (PWA-style icon if she added it; bookmark otherwise).
2. Lands directly on `/today` (still logged in).
3. Header shows "Day 2 of 75 — Monday, May 5".
4. Yesterday's checks are sealed; today's are reset to false.
5. She works through the day, ticking boxes as she completes them.
6. She glances at the buddy panel — Ellie has ticked 7 boxes already. Encouragement.
7. Before bed, she taps `/history` to see the calendar. Day 1 is green. Day 2 is half-green. The next 73 days are gray.

## The buddy view (key UX moment)

`/today` includes a card titled "Ellie's day" (or "Lilly's day" when Ellie is the viewer):

```
┌─ Ellie's day ───────────────────────────────┐
│ ✓ Water                                     │
│ ✓ Prayer                                    │
│ ✓ Workout                                   │
│ ✓ Social media ≤1hr                         │
│ ✓ Bible chapter                             │
│ … (8 more)                                  │
│                                             │
│ Journal: written ✓  (text private)          │
│ Streak: 4 days                              │
└─────────────────────────────────────────────┘
```

The "(text private)" line is shown explicitly so both girls know the app respects their journal.

## Recovery flows

### Lost phone / new device
- Lilly texts Jeremy.
- Jeremy regenerates her code: `pnpm run invite -- --user "Lilly Grace"`.
- Texts her the new 6-char code.
- She logs in on the new device. Her data is intact.

### Forgot to log in for a day
- The next day she opens the app — the missed day shows as "missed" on `/history`.
- No retroactive editing in v1. (75 Holy rules say if you miss a day, you start over — but the app won't enforce that automatically; it just records the gap.)

### Buddy didn't log in today
- Buddy panel shows: "Ellie hasn't logged in today yet."
- No nag, no notification — just visibility.
