<script lang="ts">
	import '$lib/styles/tiny-mde.css';
	import debounce from 'lodash.debounce';
	import { Editor, type CursorPosition } from 'tiny-markdown-editor';
	import type { PageData } from './$types';
	import { db } from '$lib/db/db.svelte';
	import { goto } from '$app/navigation';
	import { getText } from '$lib/utils/get-text';
	let { data }: { data: PageData } = $props();
	let { user } = $derived(data);
	let dialog: HTMLDialogElement | undefined = $state();

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
		note.id = noteToInsert.id;
		editor?.setSelection(anchor || { row: 0, col: 0 }, null);
		return;
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
	let imagePreview: string = $state('');
	let files: FileList | undefined = $state();
	import { resizeImage } from '$lib/utils/resize-image';
	let resizedFile = $state();
	$effect(() => {
		let image = files ? files[0] : null;
		if (!files || !image) {
			imagePreview = '';
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			imagePreview = reader.result as string;
		};
		reader.readAsDataURL(image);
	});
	$effect(() => {
		resizeImage(imagePreview)
			.then((resized) => {
				resizedFile = resized;
			})
			.catch((e) => console.error(e));
	});
</script>

<form>
	<div class="relative flex h-full flex-col">
		<div class="mx-auto mb-4 w-full rounded-lg bg-white shadow">
			<div class="p-4">
				<textarea use:editorAction></textarea>
			</div>
		</div>

		<div class="flex justify-end gap-2">
			{#if (user?.handwriting_api_choice === 'GCP' && user.gcp_api_key) || (user?.handwriting_api_choice === 'ChatGPT' && user.openai_api_key)}
				<button
					type="button"
					class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
					onclick={() => {
						dialog?.showModal();
					}}
				>
					Upload Some Handwriting
				</button>
			{:else}
				<button
					type="button"
					class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
					disabled
					title="You need to set up an API key in your settings to use this feature."
				>
					Upload Some Handwriting
				</button>
			{/if}
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

<dialog bind:this={dialog} class="mx-auto rounded-lg bg-white shadow-xl sm:w-full sm:max-w-xl">
	<div class="relative p-6">
		<h3 class="text-lg font-medium text-secondary-900">
			Upload a photo for handwriting recognition
		</h3>
		<div class="mt-2 text-sm text-secondary-500">
			This will use your API key and will consume credits for the image processing. You will get
			better results with a portrait image.
		</div>
		<label>
			<div class="bg-primary rounded-xl p-2">
				<div
					class="border-primary-foreground bg-primary aspect-[3/4] w-[3/4] rounded-xl border-4 border-dashed sm:w-full sm:max-w-xl"
					style="background-image: url({imagePreview}); background-size: contain; background-position: center; background-repeat: no-repeat;"
				></div>
			</div>
			<input type="file" bind:files class="hidden" name="image" />
		</label>
		<form
			method="dialog"
			class="text-end"
			onsubmit={(e) => {
				e.preventDefault();
				if (!user) return;
				const apiKey =
					user.handwriting_api_choice === 'GCP' ? user.gcp_api_key : user.openai_api_key;
				if (!apiKey) return;
				getText(
					user.handwriting_api_choice || 'GCP',
					apiKey,
					imagePreview.split('data:image/jpeg;base64,')[1]
				)
					.then(async (res) => {
						await saveNote();
						const content = editor?.getContent();
						editor?.setContent((content ? content + '\n\n' : '') + res?.text || '');
						note.keywords = res?.keywords || '';
						note.summary = res?.summary || '';
						await saveNote();
						dialog?.close();
					})
					.catch((e) => {
						console.error(e);
						dialog?.close();
					});
			}}
		>
			<button
				class="rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-primary-300 disabled:bg-primary-300"
				>OK</button
			>
		</form>
	</div>
</dialog>

<style lang="postcss">
	::backdrop {
		@apply bg-secondary-700/50;
	}
</style>
