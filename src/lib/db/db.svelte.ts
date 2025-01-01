import type { Kysely } from 'kysely';
import type { Database } from './types';

const createDb = () => {
	let thisDb: Kysely<Database> | undefined = $state();
	return {
		get db() {
			return thisDb;
		},
		set db(value) {
			thisDb = value;
		}
	};
};
export const db = createDb();
