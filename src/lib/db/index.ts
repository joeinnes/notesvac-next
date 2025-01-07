import { SQLocalKysely } from 'sqlocal/kysely';
import { Kysely } from 'kysely';
import type { Database } from './types';

const { dialect, deleteDatabaseFile, getDatabaseFile, overwriteDatabaseFile } = new SQLocalKysely({
	databasePath: 'notesvac.sqlite3'
});

export const db = new Kysely<Database>({ dialect });

export const deleteDb = deleteDatabaseFile;
export const getDb = getDatabaseFile;
export const overwriteDb = overwriteDatabaseFile;
