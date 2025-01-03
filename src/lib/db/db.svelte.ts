import type { Kysely } from 'kysely';
import { Migrator } from 'kysely';
import type { Database } from './types';
import { Migration202412282231 } from './migrations/202412282231';

const createDb = () => {
	let thisDb: Kysely<Database> | undefined = $state();
	let isReady = $state(false);
	return {
		get db() {
			return thisDb;
		},
		set db(value) {
			if (!value) {
				thisDb = undefined;
				isReady = false;
				return;
			}
			migrateToLatest(value).then(() => {
				thisDb = value;
				isReady = true;
			});
		},
		get ready() {
			return isReady;
		}
	};
};
export const db = createDb();

class getAllMigrations {
	async getMigrations() {
		return {
			Migration202412282231
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
