// Usage: pnpm run invite -- --user "Lilly Grace"
// Prints the 6-char code once. Stores only the bcrypt hash in the DB.
// If the user already exists, regenerates the code (replaces the hash).

import crypto from "node:crypto";
import { getDb } from "../src/lib/db";
import { generateInviteCode, hashInviteCode } from "../src/lib/auth";

function arg(name: string): string | undefined {
  const flag = `--${name}`;
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  for (const a of process.argv) {
    if (a.startsWith(`${flag}=`)) return a.slice(flag.length + 1);
  }
  return undefined;
}

async function main() {
  const name = arg("user");
  if (!name) {
    console.error("Usage: pnpm run invite -- --user \"Name\"");
    process.exit(2);
  }

  const code = generateInviteCode();
  const hash = await hashInviteCode(code);
  const db = getDb();

  const existing = db.prepare("SELECT id FROM users WHERE name = ? COLLATE NOCASE").get(name) as
    | { id: string }
    | undefined;

  if (existing) {
    db.prepare("UPDATE users SET invite_code_hash = ? WHERE id = ?").run(hash, existing.id);
    console.log(`User "${name}" updated. New code: ${code}`);
  } else {
    const id = crypto.randomUUID();
    db.prepare(
      "INSERT INTO users (id, name, invite_code_hash) VALUES (?, ?, ?)",
    ).run(id, name, hash);
    console.log(`User "${name}" created. Code: ${code}`);
  }

  console.log("Hand this code off in person — it won't be shown again.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
