import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';
import { sql } from 'kysely';

export const ssr = false;

export const load: LayoutLoad = async ({ url }) => {
	if (!browser) return;
	try {
		const { db: thisDb } = await import('$lib/db');

		const db = await thisDb();
		let notesFromDb;
		const q = url.searchParams.get('q');
		const from = url.searchParams.get('from');
		const offset = parseInt(from || '0');
		if (q) {
			const notes = db
				.selectFrom('notes_search')
				.selectAll()
				// @ts-expect-error The rowid is a virtual column created by joining to a virtual table.
				.innerJoin('note', 'note.rowid', 'notes_search.rowid')
				// @ts-expect-error The notes search table is a virtual table and not typed properly by Kysely.
				.where('notes_search', sql`match`, q)
				.where('is_deleted', '=', false)
				.orderBy('rank')
				.execute();

			notesFromDb = notes;
		} else {
			notesFromDb = db
				.selectFrom('note')
				.selectAll()
				.where('is_deleted', '=', false)
				.orderBy('created_at', 'desc')
				.limit(20)
				.offset(offset || 0)
				.execute();
		}

		/** Note: I'd rather do this on database up, should investigate using `onInit` to do this */
		const userFromDb = db
			.selectFrom('user')
			.selectAll()
			.executeTakeFirst()
			.then(async (res) => {
				if (!res) {
					const newUser = await db
						?.insertInto('user')
						.values({
							id: crypto.randomUUID(),
							openai_api_key: '',
							gcp_api_key: '',
							handwriting_api_choice: 'GCP'
						})
						.returningAll()
						.executeTakeFirst();

					return newUser;
				}
				return res;
			})
			.catch((e) => console.error(e));

		const [user, notes] = await Promise.all([userFromDb, notesFromDb]);
		return {
			db,
			user,
			notes,
			q
		};
	} catch (e) {
		console.error(e);
		console.log(`Looks like you're new here.`);
	}
};
