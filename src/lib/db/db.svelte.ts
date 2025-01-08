import type { Kysely } from 'kysely';
import type { Database } from './types';

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

			thisDb = value;
			isReady = true;
		},
		get ready() {
			return isReady;
		}
	};
};
export const db = createDb();
