import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { ownHistory, buddyHistory, getBuddyOf } from "@/lib/buddy";
import { Card, CardTitle } from "@/components/ui/Card";
import { StreakCalendar } from "@/components/StreakCalendar";
import { LogoutButton } from "@/components/LogoutButton";
import { TOTAL_DAYS } from "@/lib/rules";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HistoryPage() {
  const me = await currentUser();
  if (!me) redirect("/");

  const myEntries = ownHistory(me.id);
  const buddy = getBuddyOf(me.id);
  const buddyEntries = buddy ? buddyHistory(buddy.id) : [];
  const myComplete = myEntries.filter((e) => e.complete).length;
  const buddyComplete = buddyEntries.filter((e) => e.complete).length;

  return (
    <main className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted">History</div>
          <h1 className="holy-h">75 days</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link href="/today" className="text-sm text-sage-700 underline">
            ← Today
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="space-y-5">
        <Card>
          <CardTitle>{me.name} — {myComplete} / {TOTAL_DAYS} complete</CardTitle>
          <StreakCalendar entries={myEntries} />
        </Card>

        {buddy ? (
          <Card>
            <CardTitle>{buddy.name} — {buddyComplete} / {TOTAL_DAYS} complete</CardTitle>
            <p className="text-xs text-muted mb-3 italic">Journal text is private to {buddy.name}.</p>
            <StreakCalendar entries={buddyEntries} />
          </Card>
        ) : (
          <Card>
            <CardTitle>Buddy</CardTitle>
            <p className="text-sm text-muted">No buddy yet.</p>
          </Card>
        )}
      </div>
    </main>
  );
}
