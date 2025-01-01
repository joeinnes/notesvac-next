import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
/*
export const load = (async ({ locals, fetch, url, route }) => {
	const q = url.searchParams.get('q');
	const user = locals.user;
	if (!user && !url.pathname.startsWith('/login')) redirect(307, '/login');
	const notes = fetch(`/api/note${q ? '?q=' + q + '*' : ''}`).then((r) => r.json());
	return { user, notes };
}) satisfies LayoutServerLoad;

export const ssr = false;
*/
