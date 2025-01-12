import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
	// Intentionally using promise chaining to stream the promise to the client.
	return parent().then(({ db }) => {
		return db
			?.selectFrom('transcription')
			.leftJoin('note_transcription', 'transcription.id', 'note_transcription.transcription_id')
			.leftJoin('note', 'note_transcription.note_id', 'note.id')
			.select([
				'note.id as noteId',
				'note.created_at as noteCreated',
				'note.last_updated as noteUpdated',
				'transcription.id as transcriptionId',
				'transcription.image_hash',
				'transcription.image',
				'transcription.content as transcriptionContent',
				'transcription.keywords as transcriptionKeywords',
				'transcription.summary as transcriptionSummary',
				'transcription.is_deleted as transcriptionIsDeleted',
				'transcription.created_at as transcriptionCreatedAt'
			])
			.execute()
			.then((rawResults) => {
				// Process the raw results to group transcriptions with their notes
				const transcriptions = rawResults.reduce<
					{
						id: string;
						imageHash: string;
						image: string;
						content: string;
						keywords: string;
						summary: string;
						isDeleted: boolean;
						createdAt: Date;
						notes: {
							id: string;
							createdAt: Date;
							lastUpdated: Date;
						}[];
					}[]
				>((acc, row) => {
					// Check if the transcription is already in the accumulator
					let transcription = acc.find((t) => t.id === row.transcriptionId);

					if (!transcription) {
						// Add a new transcription object
						transcription = {
							id: row.transcriptionId,
							imageHash: row.image_hash,
							image: row.image,
							content: row.transcriptionContent,
							keywords: row.transcriptionKeywords,
							summary: row.transcriptionSummary,
							isDeleted: row.transcriptionIsDeleted,
							createdAt: row.transcriptionCreatedAt,
							notes: []
						};
						acc.push(transcription);
					}

					// If a note exists, add it to the notes array
					if (row.noteId) {
						transcription.notes.push({
							id: row.noteId,
							createdAt: new Date(row.noteCreated || ''),
							lastUpdated: new Date(row.noteUpdated || '')
						});
					}

					return acc;
				}, []);

				return { transcriptions };
			})
			.catch((err) => {
				console.log(err);
				return {
					transcriptions: []
				};
			});
	});
}) satisfies PageLoad;
