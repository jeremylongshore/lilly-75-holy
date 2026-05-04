import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createSession,
  recordAuthAttempt,
  setSessionCookie,
  tooManyAttempts,
  verifyInviteCode,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().min(1).max(80),
  code: z.string().length(6),
});

function getIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ip = getIp(req);
  if (tooManyAttempts(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }
  recordAuthAttempt(ip);

  const user = await verifyInviteCode(body.name, body.code);
  if (!user) {
    return NextResponse.json({ error: "Name or code didn't match" }, { status: 401 });
  }

  const sess = await createSession(user.id);
  await setSessionCookie(sess);

  return NextResponse.json({ ok: true });
}
