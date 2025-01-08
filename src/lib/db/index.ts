import { SQLocalKysely } from 'sqlocal/kysely';
import { Kysely } from 'kysely';
import type { Database } from './types';
import { Migrator } from 'kysely';
import { Migration202412282231 } from './migrations/202412282231';
import { Migration202501071409 } from './migrations/202501071409';

const { dialect, deleteDatabaseFile, getDatabaseFile, overwriteDatabaseFile } = new SQLocalKysely({
	databasePath: 'notesvac.sqlite3'
});

export const db = async () => {
	const thisDb = new Kysely<Database>({ dialect });
	await migrateToLatest(thisDb);
	return thisDb;
};

class getAllMigrations {
	async getMigrations() {
		return {
			Migration202412282231,
			Migration202501071409
		};
	}
}

async function migrateToLatest(db: Kysely<Database>) {
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
}

export const deleteDb = deleteDatabaseFile;
export const getDb = getDatabaseFile;
export const overwriteDb = overwriteDatabaseFile;
