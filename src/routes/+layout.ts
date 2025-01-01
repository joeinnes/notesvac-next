import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';
import { sql } from 'kysely';

export const ssr = false;

export const load: LayoutLoad = async ({ url }) => {
	if (!browser) return;
	const { db } = await import('$lib/db');

	let notesFromDb;
	const q = url.searchParams.get('q');
	const from = url.searchParams.get('from');
	const offset = parseInt(from || '0');
	if (q) {
		const notes = db
			.selectFrom('notes_search')
			.selectAll()
			.innerJoin('note', 'note.rowid', 'notes_search.rowid')
			.where('notes_search', sql`match`, q)
			.orderBy('rank')
			.execute();

		notesFromDb = notes;
	} else {
		notesFromDb = db
			.selectFrom('note')
			.selectAll()
			.orderBy('created_at', 'desc')
			.limit(20)
			.offset(offset || 0)
			.execute();
	}

	const userFromDb = db.selectFrom('user').selectAll().executeTakeFirst();
	const [user, notes] = await Promise.all([userFromDb, notesFromDb]);
	return {
		user,
		notes
	};
};
