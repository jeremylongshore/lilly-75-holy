// Buddy view privacy enforcement.
// Every cross-user data path goes through these helpers.
// They scrub journal text — there is no other way the buddy's data leaves the server.

import {
  getDb,
  getDailyEntry,
  getOtherUser,
  getWeekDessertCount,
  listEntriesForUser,
  type UserRow,
} from "./db";
import { DAILY_BOOLEAN_RULES, emptyDailyRules, isDayComplete, TOTAL_DAYS } from "./rules";
import { addDays, isoWeek, todayLocal } from "./date";

export type BuddySnapshot = {
  name: string;
  today_rules: Record<string, boolean>;
  journal_present: boolean; // ← never `journal: string`
  streak: number;
  completed_days: number;
  week_dessert_count: number;
  cut_food_item: string | null;
};

export type BuddyHistoryEntry = {
  date: string;
  rules: Record<string, boolean>;
  journal_present: boolean; // ← never the text
  complete: boolean;
};

export function getBuddyOf(myUserId: string): UserRow | null {
  return getOtherUser(myUserId) ?? null;
}

export function buddySnapshot(buddyUserId: string): BuddySnapshot | null {
  const buddy = getDb()
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(buddyUserId) as UserRow | undefined;
  if (!buddy) return null;

  const today = todayLocal();
  const entry = getDailyEntry(buddyUserId, today);
  let rules: Record<string, boolean> = emptyDailyRules();
  let journalPresent = false;
  if (entry) {
    try {
      rules = { ...emptyDailyRules(), ...JSON.parse(entry.rules_json) };
    } catch {
      rules = emptyDailyRules();
    }
    journalPresent = !!entry.journal && entry.journal.trim().length > 0;
  }

  const weekDessert = getWeekDessertCount(buddyUserId, isoWeek(today));
  const { streak, completedDays } = computeStreak(buddyUserId);

  return {
    name: buddy.name,
    today_rules: rules,
    journal_present: journalPresent,
    streak,
    completed_days: completedDays,
    week_dessert_count: weekDessert,
    cut_food_item: buddy.cut_food_item,
  };
}

export function buddyHistory(buddyUserId: string): BuddyHistoryEntry[] {
  return userHistory(buddyUserId, /*scrubJournal*/ true);
}

export function ownHistory(userId: string): BuddyHistoryEntry[] {
  // Same shape as buddyHistory; never returns journal text on either path —
  // the calendar view doesn't need it.
  return userHistory(userId, /*scrubJournal*/ true);
}

function userHistory(userId: string, scrubJournal: boolean): BuddyHistoryEntry[] {
  const rows = listEntriesForUser(userId);
  const byDate = new Map<string, (typeof rows)[number]>();
  for (const r of rows) byDate.set(r.entry_date, r);

  const user = getDb().prepare("SELECT challenge_start_date FROM users WHERE id = ?").get(userId) as
    | { challenge_start_date: string }
    | undefined;
  if (!user) return [];

  const out: BuddyHistoryEntry[] = [];
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const date = addDays(user.challenge_start_date, i);
    const row = byDate.get(date);
    let rules: Record<string, boolean> = emptyDailyRules();
    let journalPresent = false;
    if (row) {
      try {
        rules = { ...emptyDailyRules(), ...JSON.parse(row.rules_json) };
      } catch {
        rules = emptyDailyRules();
      }
      journalPresent = !!row.journal && row.journal.trim().length > 0;
    }
    const week = isoWeek(date);
    const weekDessert = getWeekDessertCount(userId, week);
    out.push({
      date,
      rules,
      journal_present: journalPresent,
      complete: isDayComplete(rules, journalPresent, weekDessert),
    });
    // Reference the param to keep TS happy; scrubJournal is always true today.
    void scrubJournal;
  }
  return out;
}

function computeStreak(userId: string): { streak: number; completedDays: number } {
  const history = userHistory(userId, true);
  const today = todayLocal();
  let streak = 0;
  let completedDays = 0;

  for (const day of history) {
    if (day.complete) completedDays++;
  }

  // Streak = consecutive complete days ending at today (or yesterday if today not yet complete).
  const reversed = [...history].reverse();
  let started = false;
  for (const day of reversed) {
    if (day.date > today) continue;
    if (day.date === today && !day.complete && !started) continue; // today still in progress
    if (day.complete) {
      streak++;
      started = true;
    } else {
      break;
    }
  }

  return { streak, completedDays };
}

// Compile-time guard: if anyone tries to extend BuddySnapshot with a `journal` text field,
// the type below will fail to compile. Keep this in sync with the type above.
type _NoJournalText = {
  [K in keyof BuddySnapshot]: K extends "journal" ? never : BuddySnapshot[K];
};
const _check: _NoJournalText = null as unknown as BuddySnapshot;
void _check;

// Ensure DAILY_BOOLEAN_RULES is referenced (so unused import doesn't lint-fail).
void DAILY_BOOLEAN_RULES;
