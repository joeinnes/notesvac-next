import { browser } from '$app/environment';
import type { Database } from '$lib/db/types';
import type { Kysely } from 'kysely';
import type { LayoutLoad } from './$types';
import { sql } from 'kysely';

export const ssr = false;
export const _LOAD_LIMIT = 25;

const sanitizeNumber = (value: string | null, defaultValue: number) => {
	const num = parseInt(value || '', 10);
	return isNaN(num) || num < 0 ? defaultValue : num;
};

const fetchNotes = async (db: Kysely<Database>, q: string, offset: number) => {
	if (q) {
		const notes = await db
			.selectFrom('notes_search')
			.selectAll()
			// @ts-expect-error The referenced columns are virtual
			.innerJoin('note', 'note.rowid', 'notes_search.rowid')
			// @ts-expect-error The referenced table is virtual
			.where('notes_search', sql`match`, q)
			.where('is_deleted', '=', false)
			.orderBy('rank')
			.limit(_LOAD_LIMIT)
			.offset(offset)
			.execute();
		const totalResult = await db
			.selectFrom('notes_search')
			.select(sql`COUNT(*)`.as('total'))
			// @ts-expect-error The referenced table is virtual
			.where('notes_search', sql`match`, q)
			.where('is_deleted', '=', false)
			.executeTakeFirst();
		const total = totalResult?.total ?? 0;
		return {
			notes,
			total
		};
	}

	const notes = await db
		.selectFrom('note')
		.selectAll()
		.where('is_deleted', '=', false)
		.orderBy('created_at', 'desc')
		.limit(_LOAD_LIMIT)
		.offset(offset)
		.execute();
	const totalResult = await db
		.selectFrom('note')
		.select(sql`COUNT(*)`.as('total'))
		.where('is_deleted', '=', false)
		.executeTakeFirst();
	const total = totalResult?.total ?? 0;
	return {
		notes,
		total
	};
};

export const load: LayoutLoad = async ({ url }) => {
	if (!browser) return;

	try {
		const { db: thisDb } = await import('$lib/db');
		const db = await thisDb();

		const q = url.searchParams.get('q') || '';
		const offset = sanitizeNumber(url.searchParams.get('from'), 0);

		const { notes: notesFromDb, total } = await fetchNotes(db, q, offset);

		const userFromDb = db
			.selectFrom('user')
			.selectAll()
			.executeTakeFirst()
			.then(async (res) => {
				if (!res) {
					return db
						.insertInto('user')
						.values({
							id: crypto.randomUUID(),
							openai_api_key: '',
							gcp_api_key: '',
							handwriting_api_choice: 'GCP'
						})
						.returningAll()
						.executeTakeFirst();
				}
				return res;
			})
			.catch((e) => console.error(e));

		const [user, notes] = await Promise.all([userFromDb, notesFromDb]);

		return {
			db,
			user,
			notes,
			q,
			total
		};
	} catch (e) {
		console.error(e);
		console.log(`Looks like you're new here.`);
	}
};

export const _fetchMore = async (q = '', offset = 0) => {
	if (!browser) return;

	try {
		const { db: thisDb } = await import('$lib/db');
		const db = await thisDb();

		const { notes, total } = await fetchNotes(db, q, offset);
		return {
			notes,
			total
		};
	} catch (e) {
		console.error(e);
	}
};
