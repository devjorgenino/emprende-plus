import { type SQLiteDatabase, openDatabaseSync } from 'expo-sqlite';

let db: SQLiteDatabase | null = null;

export function getDatabase(): SQLiteDatabase {
  if (!db) {
    try {
      db = openDatabaseSync('emprende-plus.db');
      db.execSync('PRAGMA foreign_keys = ON');
    } catch (e) {
      console.error('Failed to open database:', e);
      throw e;
    }
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.closeSync();
    db = null;
  }
}
