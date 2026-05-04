import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { upsertJournal } from "@/lib/db";
import { todayLocal } from "@/lib/date";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  journal: z.string().max(20000),
});

export async function PUT(req: NextRequest) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  upsertJournal(me.id, body.entry_date ?? todayLocal(), body.journal);
  return NextResponse.json({ ok: true });
}
