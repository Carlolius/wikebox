import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const sqlite = new Database(env.DATABASE_URL ?? 'wikebox.db');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
