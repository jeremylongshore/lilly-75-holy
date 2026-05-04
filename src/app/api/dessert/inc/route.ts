import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { incWeekDessertCount } from "@/lib/db";
import { isoWeek, todayLocal } from "@/lib/date";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const week = isoWeek(todayLocal());
  const count = incWeekDessertCount(me.id, week);

  return NextResponse.json({ count });
}
