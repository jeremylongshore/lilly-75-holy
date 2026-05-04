// CRITICAL TEST.
// The buddy view must NEVER expose the buddy's journal text.
// Any code path that surfaces the other user's data goes through src/lib/buddy.ts.
// If this test fails, fix the code path, not the test.

import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

let tmpDir: string;
let tmpDb: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "holy-test-"));
  tmpDb = path.join(tmpDir, "test.db");
  process.env.DATABASE_PATH = tmpDb;
  // Ensure SESSION_SECRET present for any indirect import.
  process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? "test-secret-test-secret-test-secret";

  // Make migrations resolvable from test cwd
  const migrationsDir = path.resolve(process.cwd(), "db/migrations");
  if (!fs.existsSync(migrationsDir)) {
    throw new Error("db/migrations not found — run from repo root");
  }
});

async function freshSetup() {
  // Force a re-import after env vars are set so getDb picks up DATABASE_PATH.
  const dbMod = await import(`../../src/lib/db?ts=${Date.now()}`);
  const buddyMod = await import(`../../src/lib/buddy?ts=${Date.now()}`);
  const db = dbMod.getDb();
  const me = { id: crypto.randomUUID(), name: "Lilly Grace" };
  const buddy = { id: crypto.randomUUID(), name: "Ellie" };
  db.prepare("INSERT INTO users (id, name, invite_code_hash) VALUES (?, ?, 'x')").run(me.id, me.name);
  db.prepare("INSERT INTO users (id, name, invite_code_hash) VALUES (?, ?, 'x')").run(buddy.id, buddy.name);

  // Buddy writes a journal that contains a unique sentinel string.
  const sentinel = "DEEPLY_PERSONAL_JOURNAL_SENTINEL_" + crypto.randomBytes(8).toString("hex");
  const today = new Date().toISOString().slice(0, 10);
  db.prepare(
    "INSERT INTO daily_entries (user_id, entry_date, rules_json, journal) VALUES (?, ?, ?, ?)",
  ).run(buddy.id, today, JSON.stringify({ water: true, prayer: true }), sentinel);

  return { me, buddy, sentinel, db, buddyMod };
}

describe("buddy view privacy", () => {
  it("buddySnapshot never returns the buddy's journal text", async () => {
    const { buddy, sentinel, buddyMod } = await freshSetup();
    const snap = buddyMod.buddySnapshot(buddy.id);
    expect(snap).not.toBeNull();
    const serialized = JSON.stringify(snap);
    expect(serialized).not.toContain(sentinel);
    expect(snap).not.toHaveProperty("journal");
    expect(snap.journal_present).toBe(true);
  });

  it("buddyHistory entries never contain the buddy's journal text", async () => {
    const { buddy, sentinel, buddyMod } = await freshSetup();
    const hist = buddyMod.buddyHistory(buddy.id);
    const serialized = JSON.stringify(hist);
    expect(serialized).not.toContain(sentinel);
    for (const e of hist) {
      expect(e).not.toHaveProperty("journal");
    }
  });
});
