<script lang="ts">
	import '$lib/styles/tiny-mde.css';
	import debounce from 'lodash.debounce';
	import { Editor, type CursorPosition } from 'tiny-markdown-editor';
	import type { PageData } from './$types';

	import { db } from '$lib/db/db.svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const { id } = $derived(data);
	let note: {
		id: string;
		content: string | null;
		keywords: string | null;
		summary: string | null;
	} = $state({
		id: '',
		content:
			'# Welcome\n\nEdit this note. You can use **most** basic [Markdown](https://www.markdownguide.org/cheat-sheet/) syntax __if__ you like...',
		keywords: '',
		summary: ''
	});
	let loading = $state(true);

	$effect(() => {
		console.log('refetch');
		if (db?.db && id && id !== 'new' && editor) {
			db.db
				.selectFrom('note')
				.selectAll()
				.where('id', '=', id)
				.executeTakeFirst()

				.then((res) => {
					if (res && res.content) {
						console.log('loaded');
						note = res;
						editor?.setContent(res.content);
						editor?.setSelection(anchor || { row: 0, col: 0 }, null);
					} else {
						goto('/note/new');
					}
				})
				.finally(() => {
					loading = false;
				});
		}
	});

	let editor: Editor | undefined = $state();
	let anchor: CursorPosition | null | undefined = $state();
	$inspect(anchor);

	const saveNote = async () => {
		if (!note || !db?.db) return;
		let noteToInsert = { ...note };
		if (!noteToInsert.id || noteToInsert.id === '') {
			noteToInsert.id = crypto.randomUUID();
		}
		const response = await db.db
			.insertInto('note')
			.values({ ...noteToInsert })
			.onConflict((oc) => oc.column('id').doUpdateSet({ ...noteToInsert }))
			.execute();
		anchor = editor?.getSelection(false);

		await goto(`/note/${noteToInsert.id}`, {
			replaceState: true,
			keepFocus: true,
			invalidateAll: true
		});
		// invalidate('/note');
		note.id = noteToInsert.id;
		editor?.setSelection(anchor || { row: 0, col: 0 }, null);
	};

	const debouncedSave = debounce(() => {
		saveNote();
		// dirty = false;
	}, 2000);

	const editorAction = (el: HTMLTextAreaElement) => {
		editor = new Editor({ textarea: el, content: note.content || '' });
		editor.addEventListener('change', (e) => {
			note.content = e.content;
			debouncedSave();
		});
		return {
			destroy: () => {
				editor = undefined;
			}
		};
	};
</script>

<form>
	<div class="relative flex h-full flex-col">
		<div class="mx-auto mb-4 w-full rounded-lg bg-white shadow">
			<div class="p-4">
				<textarea use:editorAction></textarea>
			</div>
		</div>

		<div class="flex justify-end gap-2">
			<button
				type="button"
				class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
			>
				Upload Some Handwriting
			</button>
			<button
				type="button"
				class="rounded-lg border border-primary-500 bg-primary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-primary-300 disabled:bg-primary-300"
				onclick={saveNote}
			>
				Save This Note
			</button>
		</div>
	</div>
	<input type="hidden" bind:value={note.keywords} />
	<input type="hidden" bind:value={note.summary} />
</form>
