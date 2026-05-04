import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { buddySnapshot, getBuddyOf } from "@/lib/buddy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const buddy = getBuddyOf(me.id);
  if (!buddy) {
    return NextResponse.json({ name: null, message: "No buddy yet — generate a second invite code." });
  }

  const snap = buddySnapshot(buddy.id);
  return NextResponse.json(snap);
}
