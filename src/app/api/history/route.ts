import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { buddyHistory, getBuddyOf, ownHistory } from "@/lib/buddy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const who = req.nextUrl.searchParams.get("user") || "me";

  if (who === "buddy") {
    const buddy = getBuddyOf(me.id);
    if (!buddy) return NextResponse.json({ entries: [] });
    return NextResponse.json({ name: buddy.name, entries: buddyHistory(buddy.id) });
  }

  return NextResponse.json({ name: me.name, entries: ownHistory(me.id) });
}
