# Product Requirements: lilly-75-holy

**Author:** Jeremy Longshore
**Date:** 2026-05-03
**Status:** Approved

## Goals

1. Make it trivial for two pre-existing users (Lilly Grace + Ellie) to log in.
2. Give each user a single screen showing today's 13 rules + journal.
3. Show each user the other user's progress today (without exposing journal text).
4. Render a 75-day calendar so each user can see their streak.
5. Survive the full 75 days without operational intervention.

## Non-goals

- Public sign-up. Two users, that's it.
- Email / SMS / push notifications.
- Social feed, comments, likes, sharing to other apps.
- Multi-device sync handling beyond a long-lived session cookie.
- Password reset flow. (User explicitly opted out.)

## The 13 rules (single source of truth: `src/lib/rules.ts`)

| Key | Display | Type |
|---|---|---|
| `water` | 1 gallon of water | daily |
| `prayer` | Prayer at every meal, morning, and night | daily |
| `workout` | 30–60 minute workout | daily |
| `social_media_under_1h` | ≤1 hour social media | daily |
| `call_loved_one` | Call a loved one | daily |
| `dessert` | ≤1 dessert per week | weekly counter |
| `bible_chapter` | 1 chapter of the Bible | daily |
| `hobby_30min` | ≥30 minutes of a hobby | daily |
| `worship_space_15min` | ≥15 min worship space (no phone, Jesus + music only) | daily |
| `no_social_after_9pm` | No social media after 9pm | daily |
| `christian_audio_only` | Worship music / Christian podcasts only | daily |
| `cut_food_compliant` | Cut one food item for 75 days | one-time pick + daily check |
| `journal` | Daily journal entry | daily text |

A **complete day** = all daily checkboxes ticked + journal saved + dessert weekly count ≤ 1 + cut_food_compliant true.

## User stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-1 | new user | enter my name + 6-character code | I get into the app without a password |
| US-2 | logged-in user | see today's 13 rules with checkboxes | I can mark off what I've done |
| US-3 | logged-in user | type a journal entry that auto-saves | I don't lose what I wrote |
| US-4 | logged-in user | see my buddy's checkboxes for today | I know how she's doing |
| US-5 | logged-in user | NOT see my buddy's journal text | my journal stays private |
| US-6 | logged-in user | see a 75-day calendar with completed/missed/today | I can see my streak |
| US-7 | logged-in user | pick my "cut food" once at challenge start | I know what I'm avoiding |
| US-8 | logged-in user | tap +1 dessert this week (and see the count) | I track the weekly limit |
| US-9 | logged-in user | stay logged in for the full 75 days | I don't have to re-auth from my phone |

## Constraints

- **Auth**: 6-character invite codes (alphanumeric uppercase). bcrypt-hashed at rest. Rate limited at 5 attempts / 15 min per IP.
- **Session**: long-lived `httpOnly`, `Secure`, `SameSite=Lax` cookie, 1-year expiry, signed with HMAC-SHA256.
- **Hosting**: Single Docker container on the Intent Solutions VPS, Caddy reverse proxy at dixieroad.org, SQLite in a named Docker volume.
- **Browser support**: Latest Safari (iPhone) + latest Chrome. Mobile-first layout.
- **Privacy**: Buddy view never exposes journal text.

## Out of scope (parking lot)

- Push notifications when buddy completes the day
- Reaction emojis on buddy's progress
- Daily verse-of-the-day surface
- Export to PDF at end of challenge
