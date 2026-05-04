import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getDailyEntry, getWeekDessertCount } from "@/lib/db";
import { emptyDailyRules } from "@/lib/rules";
import { isoWeek, todayLocal } from "@/lib/date";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = todayLocal();
  const entry = getDailyEntry(me.id, today);
  let rules = emptyDailyRules();
  let journal = "";
  if (entry) {
    try {
      rules = { ...emptyDailyRules(), ...JSON.parse(entry.rules_json) };
    } catch {
      /* keep empty */
    }
    journal = entry.journal ?? "";
  }
  const weekDessert = getWeekDessertCount(me.id, isoWeek(today));

  return NextResponse.json({
    id: me.id,
    name: me.name,
    cut_food_item: me.cut_food_item,
    challenge_start_date: me.challenge_start_date,
    today,
    today_rules: rules,
    today_journal: journal,
    week_dessert_count: weekDessert,
  });
}
