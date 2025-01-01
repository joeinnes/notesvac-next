import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	if (params.id === 'new') return {};
	return {
		note: await db.query.note.findFirst({
			where: (notes, { eq }) => eq(notes.id, params.id)
		})
	};
}) satisfies PageServerLoad;
