<script lang="ts">
	import InkMde from 'ink-mde/svelte';
	import type { PageData } from './$types';
	import debounce from 'lodash.debounce';

	import { resizeImage } from '$lib/utils/resize-image';
	import { hashString } from '$lib/utils/hash';
	import { beforeNavigate, goto } from '$app/navigation';
	import { getText } from '$lib/utils/get-text';
	import { Toasts } from '$lib/components/Toaster/toaster.svelte';
	import { demoContent, saveNote } from '$lib/utils/note.svelte';
	import MetaPanel from '$lib/components/MetaPanel.svelte';
	let { data }: { data: PageData } = $props();
	const { db, user, note: dbNote, id } = $derived(data);

	let dialog: HTMLDialogElement | undefined = $state();
	let uploadingHandwriting = $state(false);
	let imagePreview: string = $state('');
	let files: FileList | undefined = $state();
	let resizedFile: Awaited<ReturnType<typeof resizeImage>> | undefined = $state();
	let note: NonNullable<typeof dbNote> = $state({
		id: '',
		content: demoContent,
		keywords: '',
		summary: '',
		is_deleted: false,
		last_updated: new Date().toISOString(),
		created_at: new Date().toISOString(),
		transcriptions: []
	});
	export const debouncedSave = debounce(
		(note) => {
			saveNote(note);
			return note;
		},
		2000,
		{ leading: true, trailing: true }
	);

	let lastCall: typeof debouncedSave | undefined = $state();

	beforeNavigate((navigation) => {
		console.log(navigation);
		if (
			navigation.to?.params?.id === 'new' &&
			navigation.type !== 'goto' &&
			note.content !== demoContent
		) {
			if (id === 'new') navigation.cancel();
			debouncedSave?.cancel();
			saveNote(note).then(() => {
				window.location = '/note/new'; // Yes I don't like this, but this gives me a blank slate. Otherwise the note data doesn't reset. I can do this differently, but this is the easiest way for now. This is a relatively rare use case (clicking 'new note' when you have an open, but dirty, new note already), so not wasting time overoptimising.
			});
		}
		if (note.id && lastCall && debouncedSave.flush) {
			debouncedSave.flush();
		}
	});

	const canUploadHandwriting = () =>
		(user?.handwriting_api_choice === 'GCP' && user.gcp_api_key) ||
		(user?.handwriting_api_choice === 'ChatGPT' && user.openai_api_key);

	$effect(() => {
		if (!dbNote) return;
		note = dbNote;
	});

	$effect(() => {
		let image = files ? files[0] : null;
		if (!files || !image) {
			imagePreview = '';
			return;
		}
		const reader = new FileReader();
		reader.onload = async () => {
			imagePreview = reader.result as string;
			try {
				resizedFile = await resizeImage(imagePreview);
			} catch (e) {
				console.error(e);
			}
		};
		reader.readAsDataURL(image);
	});
</script>

<form class="max-h-full w-full overflow-y-auto p-4">
	<div class="mx-auto flex h-full w-full max-w-prose flex-col">
		<div class="mb-4 w-full rounded-lg bg-white shadow md:my-4">
			<InkMde
				bind:value={note.content}
				options={{
					readability: true,
					hooks: {
						beforeUpdate: () => {
							debouncedSave(note);
						} // Trying to work out a way to stop navigating to a newly created note in case I manually navigated away from that note.
					}
				}}
			/>
		</div>

		<div class="flex justify-end gap-2">
			<button
				type="button"
				class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
				onclick={() => {
					if (canUploadHandwriting()) dialog?.showModal();
				}}
				disabled={!canUploadHandwriting()}
				title={canUploadHandwriting()
					? 'You need to set up an API key in your settings to use this feature.'
					: ''}
			>
				Upload Handwriting
			</button>

			<button
				type="button"
				class="rounded-lg border border-primary-500 bg-primary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-primary-300 disabled:bg-primary-300"
				onclick={async () => {
					try {
						await saveNote(note);
						Toasts.addToast('success', 'Saved successfully!');
					} catch (e) {
						Toasts.addToast('error', 'Something went wrong and your note was not saved.');
					}
				}}
			>
				Save This Note
			</button>
		</div>
	</div>
</form>
<MetaPanel bind:note {saveNote} />

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
				e.preventDefault(); // Don't close the dialog yet
				const n = await saveNote(note); // In case note does not yet exist, create it
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

					const res = await getText(
						user.handwriting_api_choice || 'GCP',
						apiKey,
						user.handwriting_api_choice === 'ChatGPT' && resizedFile?.b64 ? resizedFile?.b64 : b64
					);
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

<style lang="postcss">
	::backdrop {
		@apply bg-secondary-700/50;
	}

	/* Editor style overrides */
	:global(.ink) {
		@apply !border-0 focus:outline-none;
	}

	:global(.ink-mde) {
		@apply !border-0;
	}

	:global(.ink-mde .ink-mde-editor) {
		@apply !p-4;
	}

	:global(.ink-mde-details) {
		@apply !bg-secondary-50;
	}

	:global(.cm-focused) {
		@apply !outline-none;
	}
</style>
