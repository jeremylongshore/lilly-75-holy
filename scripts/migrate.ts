// Apply pending SQL migrations against the configured SQLite DB.
// Idempotent — safe to run on every deploy.

import { getDb } from "../src/lib/db";

const db = getDb();
const rows = db.prepare("SELECT filename FROM schema_migrations").all() as { filename: string }[];
console.log(`Applied migrations (${rows.length}):`);
for (const r of rows) console.log(`  - ${r.filename}`);
