import { SQLocalKysely } from 'sqlocal/kysely';
import { Kysely, Migrator } from 'kysely';
import type { Database } from './types';
import { Migration202412282231 } from './migrations/202412282231';
//import * as schema from '$lib/db/schema';

const { dialect, deleteDatabaseFile, getDatabaseFile } = new SQLocalKysely({
	databasePath: 'notesvac.sqlite3'
});

export const db = new Kysely<Database>({ dialect });

class getAllMigrations {
	async getMigrations() {
		return {
			Migration202412282231
		};
	}
}

async function migrateToLatest() {
	const migrator = new Migrator({
		db,
		provider: new getAllMigrations()
	});

	const { error, results } = await migrator.migrateToLatest();

	results?.forEach((it) => {
		if (it.status === 'Success') {
			console.log(`migration "${it.migrationName}" was executed successfully`);
		} else if (it.status === 'Error') {
			console.error(`failed to execute migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error('failed to migrate');
		console.error(error);
	}

	await db.destroy();
}

migrateToLatest();

export const deleteDb = deleteDatabaseFile;
export const getDb = getDatabaseFile;
