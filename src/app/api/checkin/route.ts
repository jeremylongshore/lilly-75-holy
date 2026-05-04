import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { upsertDailyRules } from "@/lib/db";
import { DAILY_BOOLEAN_RULES } from "@/lib/rules";
import { todayLocal } from "@/lib/date";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rules: z.record(z.string(), z.boolean()),
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

  // Whitelist: only persist known daily-rule keys.
  const sanitized: Record<string, boolean> = {};
  for (const k of DAILY_BOOLEAN_RULES) {
    sanitized[k] = body.rules[k] === true;
  }

  const date = body.entry_date ?? todayLocal();
  upsertDailyRules(me.id, date, JSON.stringify(sanitized));

  return NextResponse.json({ ok: true });
}
