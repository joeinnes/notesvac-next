import { goto } from '$app/navigation';
import type { PageLoad } from './$types';

export const load = (async ({ params, parent }) => {
	const { db } = await parent();
	const { id } = params;
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
	if (!res || (!res.length && id !== 'new')) {
		await goto('/note/new');
		return;
	} else {
		const note =
			res && res.length
				? {
						id,
						content: res[0].content || undefined,
						summary: res[0].summary,
						keywords: res[0].keywords,
						is_deleted: res[0].is_deleted,
						created_at: new Date(res[0].created_at),
						last_updated: new Date(res[0].last_updated),
						transcriptions: res.map((row) => ({
							image: row.image,
							image_hash: row.image_hash
						}))
					}
				: {
						id: '',
						content:
							'# Welcome\nEdit this note. You can use **most** basic [Markdown](https://www.markdownguide.org/cheat-sheet/) syntax __if__ you like...',
						keywords: '',
						summary: '',
						is_deleted: false,
						last_updated: new Date(),
						created_at: new Date()
					};

		return { id: params.id, note };
	}
}) satisfies PageLoad;
