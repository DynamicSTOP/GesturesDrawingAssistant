import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

const DB_FILENAME = "db.sqlite3";

function getDbPath(): string {
  if (app.isPackaged) {
    return path.join(path.dirname(app.getPath("exe")), DB_FILENAME);
  }

  return path.join(process.cwd(), DB_FILENAME);
}

export function initDatabase(): Database.Database {
  const dbPath = getDbPath();
  const db = new Database(dbPath);

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  const upsert = db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
  );
  upsert.run("local_start_time", String(Date.now()));

  return db;
}

export function getDBSetting(
  db: Database.Database,
  key: string
): string | undefined {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value;
}

export function upsertDBSetting(
  db: Database.Database,
  key: string,
  value: string
) {
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
}