// Single source of truth for the 13 rules of the 75 Holy challenge.
// Do not duplicate this list elsewhere.

export type RuleType = "daily" | "weekly_counter" | "one_time" | "daily_text";

export type Rule = {
  key: string;
  display: string;
  short: string;
  type: RuleType;
};

export const RULES: readonly Rule[] = [
  { key: "water",                display: "1 gallon of water",                                    short: "Water",         type: "daily" },
  { key: "prayer",               display: "Prayer at every meal, morning, and night",             short: "Prayer",        type: "daily" },
  { key: "workout",              display: "30–60 minute workout",                                  short: "Workout",       type: "daily" },
  { key: "social_media_under_1h",display: "≤1 hour social media",                                  short: "Social ≤1h",    type: "daily" },
  { key: "call_loved_one",       display: "Call a loved one",                                      short: "Call",          type: "daily" },
  { key: "bible_chapter",        display: "1 chapter of the Bible",                                short: "Bible",         type: "daily" },
  { key: "hobby_30min",          display: "≥30 minutes of a hobby",                                short: "Hobby ≥30m",    type: "daily" },
  { key: "worship_space_15min",  display: "≥15 min worship space (no phone, Jesus + music only)",  short: "Worship space", type: "daily" },
  { key: "no_social_after_9pm",  display: "No social media after 9pm",                             short: "No social 9pm+",type: "daily" },
  { key: "christian_audio_only", display: "Worship music / Christian podcasts only",               short: "Christian audio",type: "daily" },
  { key: "cut_food_compliant",   display: "Cut one food item for 75 days",                         short: "Cut food",      type: "daily" },
  { key: "dessert",              display: "≤1 dessert per week",                                   short: "Dessert ≤1/wk", type: "weekly_counter" },
  { key: "journal",              display: "Daily journal entry",                                   short: "Journal",       type: "daily_text" },
] as const;

export const DAILY_BOOLEAN_RULES = RULES.filter((r) => r.type === "daily").map((r) => r.key);

export type DailyRulesState = Record<string, boolean>;

export function emptyDailyRules(): DailyRulesState {
  return Object.fromEntries(DAILY_BOOLEAN_RULES.map((k) => [k, false]));
}

export function isDayComplete(
  rules: DailyRulesState,
  hasJournal: boolean,
  weekDessertCount: number,
): boolean {
  const allChecked = DAILY_BOOLEAN_RULES.every((k) => rules[k] === true);
  return allChecked && hasJournal && weekDessertCount <= 1;
}

export const TOTAL_DAYS = 75;
export const DEFAULT_CHALLENGE_START = "2026-05-04";
