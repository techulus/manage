import Database from "better-sqlite3";

export class CacheStore {
  #db;

  constructor() {
    this.#db = this.#openDatabase();
  }

  #openDatabase() {
    const db = new Database("sqlite/cache.db");

    db.prepare(`
      CREATE TABLE IF NOT EXISTS key_value (
        key TEXT NOT NULL PRIMARY KEY,
        value,
        UNIQUE(key)
      );
    `).run();

    return db;
  }

  get<T>(key: string) {
    const result = this.#db
      .prepare("SELECT value FROM key_value WHERE key = ?;")
      .get(key);

    const value = (result as { value: string })?.value;
    if (!value) return undefined;
    return JSON.parse(value as string) as T;
  }

  set(key: string, value: string | number) {
    const result = this.#db
      .prepare(
        "INSERT OR REPLACE INTO key_value (key, value) VALUES (?, ?) RETURNING *;",
      )
      .run(key, JSON.stringify(value));

    return result;
  }

  delete(key: string) {
    this.#db.prepare("DELETE FROM key_value WHERE key = ?;").run(key);
  }
}
