-- Canonical schema. db/migrations/*.sql is what actually runs at boot.
-- This file is documentation + a place to view the full structure at a glance.

CREATE TABLE IF NOT EXISTS users (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL UNIQUE,
  invite_code_hash      TEXT NOT NULL,
  cut_food_item         TEXT,
  challenge_start_date  TEXT NOT NULL DEFAULT '2026-05-04',
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash   TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at   TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date  TEXT NOT NULL,
  rules_json  TEXT NOT NULL,
  journal     TEXT,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, entry_date)
);

CREATE TABLE IF NOT EXISTS weekly_counters (
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  iso_week       TEXT NOT NULL,
  desserts_count INTEGER NOT NULL DEFAULT 0,
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(user_id, iso_week)
);

CREATE TABLE IF NOT EXISTS auth_attempts (
  ip          TEXT NOT NULL,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip_time ON auth_attempts(ip, attempted_at);
