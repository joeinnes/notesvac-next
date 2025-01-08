<script lang="ts">
	import InkMde from 'ink-mde/svelte';
	import debounce from 'lodash.debounce';
	import dayjs from 'dayjs';
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { getText } from '$lib/utils/get-text';
	import { Toasts } from '$lib/components/Toaster/toaster.svelte';
	let { data }: { data: PageData } = $props();
	const { db } = $derived(data);
	let { user } = $derived(data);
	let dialog: HTMLDialogElement | undefined = $state();
	let uploadingHandwriting = $state(false);
	const demoContent =
		'# Welcome\nEdit this note. You can use **most** basic [Markdown](https://www.markdownguide.org/cheat-sheet/) syntax __if__ you like...';
	const { id } = $derived(data);
	let note: {
		id: string;
		content: string | undefined;
		keywords: string | null;
		summary: string | null;
		is_deleted: boolean;
		created_at: Date;
		last_updated: Date;
		transcriptions?: {
			image: string;
			image_hash: string;
		}[];
	} = $state({
		id: '',
		content: demoContent,
		keywords: '',
		summary: '',
		is_deleted: false,
		created_at: new Date(),
		last_updated: new Date()
	});
	let loading = $state(true);
	let focusInEditor = $state(false);

	$effect(() => {
		if (db && id && id !== 'new') {
			db.selectFrom('note')
				.innerJoin('note_transcription', 'note.id', 'note_transcription.note_id')
				.innerJoin('transcription', 'note_transcription.transcription_id', 'transcription.id')
				.selectAll()
				.where('id', '=', id)
				.execute()
				.then((res) => {
					if (res) {
						const first = res[0];
						note = {
							id,
							content: first.content || undefined,
							summary: first.summary,
							keywords: first.keywords,
							is_deleted: first.is_deleted,
							created_at: new Date(first.created_at),
							last_updated: new Date(first.last_updated),
							transcriptions: res.map((row) => ({ image: row.image, image_hash: row.image_hash }))
						};
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
				is_deleted: false,
				last_updated: new Date(),
				created_at: new Date()
			};
		}
	});

	const saveNote = async () => {
		if (!note || !db || note.content === demoContent) return;
		let noteToInsert = {
			...note,
			created_at: note.created_at.toISOString(),
			last_updated: note.last_updated.toISOString()
		};
		if (!noteToInsert.id || noteToInsert.id === '') {
			noteToInsert.id = crypto.randomUUID();
		}
		const response = await db
			.insertInto('note')
			.values({ ...noteToInsert })
			.onConflict((oc) => oc.column('id').doUpdateSet({ ...noteToInsert }))
			.execute();

		if (id === 'new')
			await goto(`/note/${noteToInsert.id}`, {
				replaceState: true,
				keepFocus: true,
				invalidateAll: true
			});
		note.id = noteToInsert.id;
		invalidateAll();
		return;
	};

	const debouncedSave = debounce(() => {
		saveNote();
	}, 2000);

	let imagePreview: string = $state('');
	let showMeta = $state(false);
	let files: FileList | undefined = $state();
	import { resizeImage } from '$lib/utils/resize-image';
	import { hashString } from '$lib/utils/hash';
	let resizedFile = $state();
	$effect(() => {
		note.content;
		debouncedSave();
	});
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

<div class="overflow-hidden">
	<div class="h-full w-full">
		<form class="h-full w-full p-4">
			<div class="flex h-full flex-col">
				<div class="mx-auto mb-4 w-full rounded-lg bg-white shadow">
					<InkMde
						bind:value={note.content}
						options={{
							readability: true
						}}
					/>
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
							Upload Handwriting
						</button>
					{:else}
						<button
							type="button"
							class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
							disabled
							title="You need to set up an API key in your settings to use this feature."
						>
							Upload Handwriting
						</button>
					{/if}
					<button
						type="button"
						class="rounded-lg border border-primary-500 bg-primary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-primary-300 disabled:bg-primary-300"
						onclick={async () => {
							try {
								await saveNote();
								Toasts.addToast('success', 'Saved successfully!');
							} catch (e) {
								Toasts.addToast('error', 'Something went wrong and your note was not saved.');
							}
						}}
					>
						Save This Note
					</button>
				</div>

				<div
					class="group absolute bottom-0 right-0 top-0 w-full max-w-lg transform border-s border-secondary-100 bg-secondary-200 p-4 shadow-sm transition-transform"
					class:translate-x-full={!showMeta}
				>
					<button
						class="absolute left-0 -translate-x-full transform rounded-l-full bg-secondary-200 px-3 py-1 text-2xl"
						onclick={() => (showMeta = !showMeta)}
					>
						<span class="inline-block transform transition-transform" class:rotate-180={showMeta}
							>&larr;</span
						>
					</button>
					<h2 class="mb-2 mt-1 text-2xl font-semibold text-primary-900">Metadata</h2>

					<div class="w-full pb-4 text-secondary-500">
						<div class="mb-2">
							<label for="keywords" class="block text-xs font-medium text-gray-700">
								Keywords
							</label>

							<input
								type="text"
								id="keywords"
								placeholder="keywords"
								class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
								name="keywords"
								bind:value={note.keywords}
								onchange={() => saveNote()}
							/>
						</div>
						<div class="mb-2">
							<label for="summary" class="block text-xs font-medium text-gray-700"> Summary </label>

							<textarea
								id="summary"
								placeholder="summary"
								class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
								name="summary"
								rows={10}
								bind:value={note.summary}
								onchange={() => saveNote()}
							></textarea>
						</div>
					</div>

					<div class="mb-2">
						<label for="created_at" class="block text-xs font-medium text-gray-700">
							Created Date
						</label>

						<input
							type="date"
							id="created_at"
							class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
							name="created_at"
							bind:value={() => dayjs(note.created_at).format('YYYY-MM-DD'),
							(v) => (note.created_at = new Date(v))}
							onchange={() => saveNote()}
						/>
					</div>

					<div class="mb-2">
						<label for="last_updated" class="block text-xs font-medium text-gray-700">
							Last Updated
						</label>

						<input
							type="date"
							id="last_updated"
							placeholder="last_updated"
							class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
							name="last_updated"
							bind:value={() => dayjs(note.last_updated).format('YYYY-MM-DD'),
							(v) => (note.last_updated = new Date(v))}
							onchange={() => saveNote()}
						/>
					</div>

					<div class="mb-2">
						<p class="block text-xs font-medium text-gray-700">Associated Images</p>
						{#if note.transcriptions}
							{#each note.transcriptions as transcription, i}
								<img src={`data:image/jpeg;base64,${transcription.image}`} alt={note.summary} />
								{i}
							{/each}
						{/if}
					</div>
				</div>
			</div>
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
						e.preventDefault();
						await saveNote(); // In case note does not yet exist, create it
						uploadingHandwriting = true;
						if (!user) return;
						const apiKey =
							user.handwriting_api_choice === 'GCP' ? user.gcp_api_key : user.openai_api_key;
						if (!apiKey) return;
						try {
							const b64 = imagePreview.split('data:image/jpeg;base64,')[1];
							const hash = await hashString(b64);
							const transcription = await db
								?.selectFrom('transcription')
								.selectAll()
								.where('image_hash', '=', hash)
								.executeTakeFirst();
							if (transcription) {
								note.content = transcription.content;
								note.keywords = transcription.keywords;
								note.summary = transcription.summary;
								dialog?.close();
								Toasts.addToast(
									'success',
									'A match was found for this transcription. No credits were used.'
								);
								return;
							}
							const res = await getText(user.handwriting_api_choice || 'GCP', apiKey, b64);
							note.content =
								(note.content && note.content !== demoContent ? note.content + '\n\n' : '') +
									res?.text || '';
							note.keywords = res?.keywords || '';
							note.summary = res?.summary || '';
							const saveTranscription = await db?.transaction().execute(async (trx) => {
								const transcription = await trx
									.insertInto('transcription')
									.values({
										content: res?.text,
										keywords: res?.keywords || '',
										summary: res?.summary || '',
										id: crypto.randomUUID(),
										image_hash: hash,
										image: imagePreview,
										is_deleted: false
									})
									.returning('id')
									.executeTakeFirstOrThrow();
								return await trx
									.insertInto('note_transcription')
									.values({
										note_id: note.id,
										transcription_id: transcription.id
									})
									.returningAll()
									.executeTakeFirst();
							});
							dialog?.close();
							Toasts.addToast('success', 'Your handwriting was successfully transcribed.');
						} catch (e) {
							console.error(e);
							dialog?.close();
							Toasts.addToast('error', 'There was an error transcribing your handwriting.');
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
	</div>
</div>

<style lang="postcss">
	::backdrop {
		@apply bg-secondary-700/50;
	}
	:global(.ink) {
		@apply !border-0 focus:outline-none;
	}

	:global(.ink-mde) {
		@apply !border-0;
	}

	:global(.ink-mde .ink-mde-editor) {
		@apply !p-4;
	}

	/* Overwrite Codemirror's default markdown here. */
	:global(.cm-focused) {
		@apply !outline-none;
	}

	:global(.ink-mde-details) {
		@apply !bg-secondary-50;
	}
</style>
