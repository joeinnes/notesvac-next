import { browser } from '$app/environment';
import type { PageLoad } from './$types';
import { sql } from 'kysely';

export const ssr = false;

const ITEMS_PER_PAGE = 5;

interface PaginationData {
	notesCount: number;
	transcriptionsCount: number;
	currentPage: number;
	itemsPerPage: number;
}

export const load: PageLoad = async ({ url, parent }) => {
	if (!browser) return;
	try {
		const { db } = await parent();
		if (!db) return;

		const q = url.searchParams.get('q');
		const from = url.searchParams.get('from');
		const tab = url.searchParams.get('tab') || 'notes';
		const offset = parseInt(from || '0');

		// Get total counts for pagination
		const [notesCount, transcriptionsCount] = await Promise.all([
			db
				.selectFrom('note')
				.select(({ fn }) => [fn.count<number>('id').as('count')])
				.where('is_deleted', '=', true)
				.executeTakeFirst(),
			db
				.selectFrom('transcription')
				.select(({ fn }) => [fn.count<number>('id').as('count')])
				.where('is_deleted', '=', true)
				.executeTakeFirst()
		]);

		// Only fetch the data for the active tab
		const notesFromDb =
			tab === 'notes'
				? q
					? db
							.selectFrom('notes_search')
							.selectAll()
							// @ts-expect-error The rowid is a virtual column created by joining to a virtual table.
							.innerJoin('note', 'note.rowid', 'notes_search.rowid')
							// @ts-expect-error The notes search table is a virtual table and not typed properly by Kysely.
							.where('notes_search', sql`match`, q)
							.where('is_deleted', '=', true)
							.orderBy('rank')
							.execute()
					: db
							.selectFrom('note')
							.selectAll()
							.where('is_deleted', '=', true)
							.orderBy('created_at', 'desc')
							.limit(ITEMS_PER_PAGE)
							.offset(offset)
							.execute()
				: Promise.resolve([]);

		const deletedTranscriptions =
			tab === 'transcriptions'
				? db
						.selectFrom('transcription')
						.selectAll()
						.where('is_deleted', '=', true)
						.orderBy('created_at', 'desc')
						.limit(ITEMS_PER_PAGE)
						.offset(offset)
						.execute()
				: Promise.resolve([]);

		const [deletedNotes, transcriptions] = await Promise.all([notesFromDb, deletedTranscriptions]);

		const pagination: PaginationData = {
			notesCount: Number(notesCount?.count) || 0,
			transcriptionsCount: Number(transcriptionsCount?.count) || 0,
			currentPage: Math.floor(offset / ITEMS_PER_PAGE),
			itemsPerPage: ITEMS_PER_PAGE
		};

		return {
			deletedNotes,
			deletedTranscriptions: transcriptions,
			pagination
		};
	} catch (e) {
		console.error(e);
		const defaultPagination: PaginationData = {
			notesCount: 0,
			transcriptionsCount: 0,
			currentPage: 0,
			itemsPerPage: ITEMS_PER_PAGE
		};

		return {
			deletedNotes: [],
			deletedTranscriptions: [],
			pagination: defaultPagination
		};
	}
};
