import { goto } from '$app/navigation';
import { demoContent } from '$lib/utils/note.svelte';
import type { PageLoad } from './$types';

export const load = (async ({ params, parent }) => {
	const { db } = await parent();
	const { id } = params;
	if (id === 'new') {
		return {
			note: {
				id: '',
				content: demoContent,
				keywords: '',
				summary: '',
				is_deleted: false,
				last_updated: new Date().toISOString(),
				created_at: new Date().toISOString(),
				transcriptions: []
			}
		};
	}
	const res =
		db && id && id !== 'new'
			? await db
					.selectFrom('note')
					.leftJoin('note_transcription', 'note.id', 'note_transcription.note_id')
					.leftJoin('transcription', 'note_transcription.transcription_id', 'transcription.id')
					.select([
						'note.id as id',
						'note.title',
						'note.content',
						'note.created_at',
						'note.last_updated',
						'note.summary',
						'note.keywords',
						'note.is_deleted',
						'transcription.id as transcriptionId',
						'transcription.image_hash',
						'transcription.image',
						'transcription.content as transcriptionContent',
						'transcription.keywords as transcriptionKeywords',
						'transcription.summary as transcriptionSummary',
						'transcription.is_deleted as transcriptionIsDeleted',
						'transcription.created_at as transcriptionCreatedAt'
					])
					.where('note.id', '=', id)
					.execute()
			: null;
	if (!res || !res.length) {
		await goto('/note/new');
		return;
	} else {
		const note = {
			id,
			content: res[0].content || undefined,
			summary: res[0].summary,
			keywords: res[0].keywords,
			is_deleted: res[0].is_deleted,
			created_at: res[0].created_at,
			last_updated: res[0].last_updated,
			transcriptions: res.reduce<{ image: string; image_hash: string }[]>((acc, curr) => {
				if (curr.image && curr.image_hash)
					acc.push({ image: curr.image, image_hash: curr.image_hash });
				return acc;
			}, [])
		};
		return { id: params.id, note };
	}
}) satisfies PageLoad;
