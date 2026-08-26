import { type SQLiteDatabase, openDatabaseSync } from 'expo-sqlite';

let db: SQLiteDatabase | null = null;

export function getDatabase(): SQLiteDatabase {
  if (!db) {
    db = openDatabaseSync('emprende-plus.db');
    db.execSync('PRAGMA foreign_keys = ON');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.closeSync();
    db = null;
  }
}
