import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getDailyEntry, getWeekDessertCount } from "@/lib/db";
import { dayNumberInChallenge, isoWeek, prettyDate, todayLocal } from "@/lib/date";
import { emptyDailyRules, TOTAL_DAYS } from "@/lib/rules";
import { Card, CardTitle } from "@/components/ui/Card";
import { DailyChecklist } from "@/components/DailyChecklist";
import { JournalEditor } from "@/components/JournalEditor";
import { CutFoodPicker } from "@/components/CutFoodPicker";
import { DessertCounter } from "@/components/DessertCounter";
import { BuddyPanel } from "@/components/BuddyPanel";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TodayPage() {
  const me = await currentUser();
  if (!me) redirect("/");

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
  const dayN = dayNumberInChallenge(me.challenge_start_date, today);

  return (
    <main className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted">
            Day {Math.max(1, dayN)} of {TOTAL_DAYS}
          </div>
          <h1 className="holy-h">{prettyDate(today)}</h1>
          <p className="text-sm text-muted mt-1">Hi, {me.name} ✨</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link href="/history" className="text-sm text-sage-700 underline">
            History →
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="space-y-5">
        <Card>
          <CardTitle>Today's checks</CardTitle>
          <DailyChecklist initial={rules} />
        </Card>

        <Card>
          <CardTitle>Cutting</CardTitle>
          <CutFoodPicker initial={me.cut_food_item} />
        </Card>

        <DessertCounter initialCount={weekDessert} />

        <Card>
          <CardTitle>Journal</CardTitle>
          <p className="text-xs text-muted mb-2">Only you can read this. Auto-saves as you type.</p>
          <JournalEditor initial={journal} />
        </Card>

        <BuddyPanel />
      </div>
    </main>
  );
}
