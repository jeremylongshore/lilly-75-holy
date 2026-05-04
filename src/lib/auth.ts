import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getDb, getUserByName, getUserById, type UserRow } from "./db";

const COOKIE_NAME = "holy_session";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365; // 1 year
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MIN = 15;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET is not set or is too short (>=16 chars)");
  }
  return s;
}

function sign(token: string): string {
  return crypto.createHmac("sha256", secret()).update(token).digest("base64url");
}

function tokenHash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function recordAuthAttempt(ip: string) {
  const db = getDb();
  // Opportunistic cleanup of rows older than 1 hour.
  db.prepare("DELETE FROM auth_attempts WHERE attempted_at < datetime('now','-1 hour')").run();
  db.prepare("INSERT INTO auth_attempts (ip) VALUES (?)").run(ip);
}

export function tooManyAttempts(ip: string): boolean {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM auth_attempts
       WHERE ip = ? AND attempted_at >= datetime('now', ?)`,
    )
    .get(ip, `-${RATE_LIMIT_WINDOW_MIN} minutes`) as { n: number };
  return row.n >= RATE_LIMIT_MAX;
}

export async function verifyInviteCode(name: string, code: string): Promise<UserRow | null> {
  const user = getUserByName(name.trim());
  if (!user) return null;
  const ok = await bcrypt.compare(code.trim().toUpperCase(), user.invite_code_hash);
  return ok ? user : null;
}

export async function createSession(userId: string): Promise<string> {
  const tokenBytes = crypto.randomBytes(32);
  const token = tokenBytes.toString("base64url");
  const hashed = tokenHash(token);
  const expires = new Date(Date.now() + COOKIE_MAX_AGE_SEC * 1000).toISOString();

  getDb()
    .prepare(`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)`)
    .run(hashed, userId, expires);

  return `${token}.${sign(token)}`;
}

export async function setSessionCookie(value: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function currentUser(): Promise<UserRow | null> {
  const c = await cookies();
  const raw = c.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [token, sig] = raw.split(".");
  if (!token || !sig) return null;
  if (sign(token) !== sig) return null;

  const row = getDb()
    .prepare(`SELECT user_id, expires_at FROM sessions WHERE token_hash = ?`)
    .get(tokenHash(token)) as { user_id: string; expires_at: string } | undefined;

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    getDb().prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(tokenHash(token));
    return null;
  }

  return getUserById(row.user_id) ?? null;
}

export async function deleteCurrentSession() {
  const c = await cookies();
  const raw = c.get(COOKIE_NAME)?.value;
  if (!raw) return;
  const [token, _sig] = raw.split(".");
  if (token) {
    getDb().prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(tokenHash(token));
  }
  await clearSessionCookie();
}

// ───────────────────── invite code helpers ─────────────────────

export function generateInviteCode(): string {
  // 6 chars, uppercase alphanumeric; 36^6 = ~2.2B keyspace
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ambiguity-free
  const bytes = crypto.randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export async function hashInviteCode(code: string): Promise<string> {
  return bcrypt.hash(code.toUpperCase(), 10);
}
