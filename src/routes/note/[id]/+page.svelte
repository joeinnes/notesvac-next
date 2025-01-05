<script lang="ts">
	import '$lib/styles/tiny-mde.css';
	import debounce from 'lodash.debounce';
	import { Editor, type CursorPosition } from 'tiny-markdown-editor';
	import type { PageData } from './$types';
	import { db } from '$lib/db/db.svelte';
	import { goto, beforeNavigate, afterNavigate } from '$app/navigation';
	import { getText } from '$lib/utils/get-text';
	let { data }: { data: PageData } = $props();
	let { user } = $derived(data);
	let dialog: HTMLDialogElement | undefined = $state();
	let uploadingHandwriting = $state(false);
	const demoContent =
		'# Welcome\n\nEdit this note. You can use **most** basic [Markdown](https://www.markdownguide.org/cheat-sheet/) syntax __if__ you like...';
	const { id } = $derived(data);
	let note: {
		id: string;
		content: string | null;
		keywords: string | null;
		summary: string | null;
		is_deleted: boolean;
	} = $state({
		id: '',
		content: demoContent,
		keywords: '',
		summary: '',
		is_deleted: false
	});
	let loading = $state(true);
	let focusInEditor = $state(false);

	$effect(() => {
		if (db?.db && id && id !== 'new' && editor) {
			db.db
				.selectFrom('note')
				.selectAll()
				.where('id', '=', id)
				.executeTakeFirst()

				.then((res) => {
					if (res) {
						note = res;
						editor?.setContent(res.content || '');
						if (focusInEditor) editor?.setSelection(anchor || { row: 0, col: 0 }, null);
					} else {
						goto('/note/new');
					}
				})
				.finally(() => {
					loading = false;
				});
		} else if (id === 'new') {
			note = {
				id: '',
				content: demoContent,
				keywords: '',
				summary: '',
				is_deleted: false
			};
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
		if (focusInEditor) editor?.setSelection(anchor || { row: 0, col: 0 }, null);
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
				if (note.content !== demoContent) {
					saveNote();
				}
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
	$effect(() => {
		const onFocus = () => {
			focusInEditor = true;
		};
		const onBlur = () => {
			focusInEditor = false;
		};
		document.querySelector('.TinyMDE')?.addEventListener('focus', onFocus);
		document.querySelector('.TinyMDE')?.addEventListener('blur', onBlur);
		return () => {
			document.querySelector('.TinyMDE')?.removeEventListener('focus', onFocus);
			document.querySelector('.TinyMDE')?.removeEventListener('blur', onBlur);
		};
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
	<details class="group">
		<summary
			class="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-medium text-secondary-900"
		>
			Metadata
			<div class="text-secondary-500">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="block h-5 w-5 transition-all duration-300 group-open:rotate-180"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
				</svg>
			</div>
		</summary>
		<div class="pb-4 text-secondary-500">
			<div class="mb-2">
				<label for="keywords" class="block text-xs font-medium text-gray-700"> Keywords </label>

				<input
					type="text"
					id="keywords"
					placeholder="keywords"
					class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
					name="keywords"
					bind:value={note.keywords}
					onchange={() => debouncedSave()}
				/>
			</div>
			<div class="mb-2">
				<label for="summary" class="block text-xs font-medium text-gray-700"> Summary </label>

				<textarea
					id="summary"
					placeholder="summary"
					class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
					name="summary"
					bind:value={note.summary}
					onchange={() => debouncedSave()}
				></textarea>
			</div>
		</div>
	</details>
</form>

<dialog bind:this={dialog} class="mx-auto rounded-lg bg-white shadow-xl sm:w-full sm:max-w-xl">
	{#if uploadingHandwriting}
		<div class="absolute z-10 h-full w-full animate-pulse bg-gray-500/50"></div>
	{/if}
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
			onsubmit={async (e) => {
				await saveNote(); // In case note does not yet exist, create it
				e.preventDefault();
				uploadingHandwriting = true;
				if (!user) return;
				const apiKey =
					user.handwriting_api_choice === 'GCP' ? user.gcp_api_key : user.openai_api_key;
				if (!apiKey) return;
				try {
					const res = await getText(
						user.handwriting_api_choice || 'GCP',
						apiKey,
						imagePreview.split('data:image/jpeg;base64,')[1]
					);

					const content = editor?.getContent();
					editor?.setContent(
						(content && content !== demoContent ? content + '\n\n' : '') + res?.text || ''
					); // Overwrite demo content automatically.
					note.keywords = res?.keywords || '';
					note.summary = res?.summary || '';
					await saveNote();
					dialog?.close();
				} catch (e) {
					console.error(e);
					dialog?.close();
				} finally {
					uploadingHandwriting = false;
				}
			}}
		>
			<button
				class="rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-primary-300 disabled:bg-primary-300"
				disabled={uploadingHandwriting}
				>{#if uploadingHandwriting}Uploading...{:else}OK{/if}</button
			>
		</form>
	</div>
</dialog>

<style lang="postcss">
	::backdrop {
		@apply bg-secondary-700/50;
	}
</style>
