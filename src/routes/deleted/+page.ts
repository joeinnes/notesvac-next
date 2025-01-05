import { browser } from '$app/environment';
import type { PageLoad } from './$types';
import { sql } from 'kysely';

export const ssr = false;

export const load: PageLoad = async ({ url }) => {
	if (!browser) return;
	try {
		const { db } = await import('$lib/db');
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
				.where('is_deleted', '=', true)
				.orderBy('rank')
				.execute();

			notesFromDb = notes;
		} else {
			notesFromDb = db
				.selectFrom('note')
				.selectAll()
				.where('is_deleted', '=', true)
				.orderBy('created_at', 'desc')
				.limit(20)
				.offset(offset || 0)
				.execute();
		}

		const deletedNotes = await notesFromDb;
		return {
			deletedNotes
		};
	} catch (e) {
		console.error(`Something odd happened`, e);
	}
};
