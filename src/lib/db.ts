import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), "data/holy.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  runMigrations(db);

  _db = db;
  return db;
}

function runMigrations(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const migrationsDir = path.resolve(process.cwd(), "db/migrations");
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const appliedRows = db.prepare("SELECT filename FROM schema_migrations").all() as { filename: string }[];
  const applied = new Set(appliedRows.map((r) => r.filename));

  const insert = db.prepare("INSERT INTO schema_migrations (filename) VALUES (?)");

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    const tx = db.transaction(() => {
      db.exec(sql);
      insert.run(file);
    });
    tx();
    console.log(`[db] applied migration ${file}`);
  }
}

// ───────────────────── small typed helpers ─────────────────────

export type UserRow = {
  id: string;
  name: string;
  invite_code_hash: string;
  cut_food_item: string | null;
  challenge_start_date: string;
  created_at: string;
};

export function getUserByName(name: string): UserRow | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE name = ? COLLATE NOCASE")
    .get(name) as UserRow | undefined;
}

export function getUserById(id: string): UserRow | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

export function listUsers(): UserRow[] {
  return getDb().prepare("SELECT * FROM users ORDER BY created_at ASC").all() as UserRow[];
}

export function getOtherUser(myId: string): UserRow | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE id != ? ORDER BY created_at ASC LIMIT 1")
    .get(myId) as UserRow | undefined;
}

export type DailyEntryRow = {
  id: number;
  user_id: string;
  entry_date: string;
  rules_json: string;
  journal: string | null;
  updated_at: string;
};

export function getDailyEntry(userId: string, date: string): DailyEntryRow | undefined {
  return getDb()
    .prepare("SELECT * FROM daily_entries WHERE user_id = ? AND entry_date = ?")
    .get(userId, date) as DailyEntryRow | undefined;
}

export function upsertDailyRules(userId: string, date: string, rulesJson: string) {
  const stmt = getDb().prepare(`
    INSERT INTO daily_entries (user_id, entry_date, rules_json)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, entry_date)
    DO UPDATE SET rules_json = excluded.rules_json, updated_at = datetime('now');
  `);
  stmt.run(userId, date, rulesJson);
}

export function upsertJournal(userId: string, date: string, journal: string) {
  // Ensure the row exists, then update journal.
  const exists = getDailyEntry(userId, date);
  if (!exists) {
    getDb()
      .prepare(
        `INSERT INTO daily_entries (user_id, entry_date, rules_json, journal) VALUES (?, ?, '{}', ?)`,
      )
      .run(userId, date, journal);
    return;
  }
  getDb()
    .prepare(`UPDATE daily_entries SET journal = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(journal, exists.id);
}

export function listEntriesForUser(userId: string): DailyEntryRow[] {
  return getDb()
    .prepare("SELECT * FROM daily_entries WHERE user_id = ? ORDER BY entry_date ASC")
    .all(userId) as DailyEntryRow[];
}

export function getWeekDessertCount(userId: string, isoWeekStr: string): number {
  const row = getDb()
    .prepare("SELECT desserts_count FROM weekly_counters WHERE user_id = ? AND iso_week = ?")
    .get(userId, isoWeekStr) as { desserts_count: number } | undefined;
  return row?.desserts_count ?? 0;
}

export function incWeekDessertCount(userId: string, isoWeekStr: string): number {
  getDb()
    .prepare(
      `INSERT INTO weekly_counters (user_id, iso_week, desserts_count)
       VALUES (?, ?, 1)
       ON CONFLICT(user_id, iso_week)
       DO UPDATE SET desserts_count = desserts_count + 1, updated_at = datetime('now');`,
    )
    .run(userId, isoWeekStr);
  return getWeekDessertCount(userId, isoWeekStr);
}

export function setCutFood(userId: string, item: string) {
  getDb().prepare("UPDATE users SET cut_food_item = ? WHERE id = ? AND cut_food_item IS NULL").run(item, userId);
}
