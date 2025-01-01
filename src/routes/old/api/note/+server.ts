import { error, fail, json, redirect } from '@sveltejs/kit';
import { sql, eq, and } from 'drizzle-orm';
import { db } from '$lib/db';
import { note } from '$lib/db/schema';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	const query = url.searchParams.get('q');
	const from = url.searchParams.get('from');
	const offset = parseInt(from || '0');
	const user = locals.user?.id;
	if (!user) return error(401, 'Unauthorized');
	let notes;

	if (query) {
		/* This is cheap full text search. 
      Needs to have a manually created virtual table. See Schema.
      TODO: Upgrade this to vector search */
		const statement = sql`SELECT *
FROM notes
JOIN notes_search ON notes_search.rowid = notes.rowid
WHERE notes_search MATCH ${query}
  ORDER BY notes.created_at DESC
  LIMIT 20 OFFSET ${offset || 0};`;
		const res = await db.run(sql`select * from 'notes_search'`);
		console.log(res);
		notes = await db.all(statement);
	} else {
		notes = await db.query.note.findMany({
			orderBy: (notes, { desc }) => [desc(notes.createdAt)],
			limit: 20,
			offset: offset || 0
		});
	}
	return json(notes);
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user?.id;
	const data = await request.json();
	const id = data?.id;
	const content = data?.content;
	if (!user) error(401, 'Unauthorized');
	if (!content) fail(400, { message: 'No data' });
	let keywordsString = data?.keywords.length ? data.keywords.join(',') : '';
	const noteToInsert = {
		content,
		keywords: keywordsString,
		summary: data?.summary
	};
	console.log(noteToInsert);
	let redirectTo = '';
	try {
		if (id) {
			await db
				.update(note)
				.set({ ...noteToInsert })
				.where(eq(note.id, id))
				.returning();
		} else {
			const ret = await db
				.insert(note)
				.values({ ...noteToInsert, id: randomUUID() })
				.returning();
			redirectTo = ret[0].id;
		}
	} catch (e) {
		console.log(e);
		return new Response('Internal Server Error', { status: 500 });
	}
	if (redirectTo) redirect(303, '/note/' + redirectTo);

	return new Response();
};
