import debounce from 'lodash.debounce';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import type { NewNote, NoteUpdate } from '$lib/db/types';

export const demoContent =
	'# Welcome\nEdit this note. You can use **most** basic [Markdown](https://www.markdownguide.org/cheat-sheet/) syntax __if__ you like...';

export const saveNote = async (
	note: (NewNote | NoteUpdate) & {
		transcriptions?: { image: string | null; image_hash: string | null }[];
	}
) => {
	const pageStore = get(page);
	const {
		data: { db }
	} = pageStore;
	if (!db) return;
	if (!db || !note || note.content === demoContent) return;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { transcriptions, ...snapshot } = $state.snapshot(note); // Intentional destructure the transcriptions because I don't want those in the final version here
	const noteId = snapshot.id;
	const noteToInsert: NoteUpdate = {
		...snapshot,
		created_at: snapshot.created_at || new Date().toISOString(),
		last_updated: new Date().toISOString() // Always update the 'last_updated'
	};
	if (!noteToInsert.id || noteToInsert.id === '') {
		noteToInsert.id = crypto.randomUUID();
	}

	try {
		const newNote = await db
			.insertInto('note')
			.values({ ...noteToInsert })
			// @ts-expect-error I can't find a guide on properly typing the on conflict callback parameter, and manually typing is ugly and cumbersome. TODO: find the proper typing here.
			.onConflict((oc) => oc.column('id').doUpdateSet({ ...noteToInsert }))
			.returningAll()
			.execute();

		if ((pageStore.route.id !== '/transcriptions' && noteId === 'new') || !noteId)
			await goto(`/note/${noteToInsert.id}`, {
				replaceState: true,
				keepFocus: true,
				invalidateAll: true
			});
		return newNote;
	} catch (e) {
		console.error(e);
	}
};

export const debouncedSave = debounce((note) => {
	saveNote(note);
}, 2000);
