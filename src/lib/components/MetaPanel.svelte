<script lang="ts">
	import Lightbox from './Lightbox.svelte';

	import dayjs from '$lib/utils/dayjs';
	import InputField from '$lib/components/InputField.svelte';
	import DeleteNoteModal from '$lib/components/DeleteNoteModal.svelte';
	import Trash_2 from 'lucide-svelte/icons/trash-2';
	let { note = $bindable(), saveNote } = $props();
	let showMeta = $state(false);
	let showDeleteModal = $state(false);
	let showLightbox = $state('');
</script>

<div
	class="max-w-screen group absolute bottom-0 right-0 top-0 w-full transform border-s border-secondary-50 bg-secondary-100 p-4 shadow-sm transition-transform md:max-w-lg"
	class:translate-x-full={!showMeta}
>
	<button
		class="absolute left-0 -translate-x-full transform rounded-l-full bg-secondary-100 px-3 py-1 text-2xl"
		onclick={() => (showMeta = !showMeta)}
	>
		<span class="inline-block transform transition-transform" class:rotate-180={showMeta}
			>&larr;</span
		>
	</button>
	<div class="h-full overflow-y-auto">
		<button
			class="absolute right-2 inline-block bg-secondary-100 px-3 py-1 text-2xl md:hidden"
			onclick={() => (showMeta = !showMeta)}
		>
			<span class="inline-block transform transition-transform" class:rotate-180={showMeta}
				>&larr;</span
			>
		</button>
		<h2 class="mb-2 mt-1 text-2xl font-semibold text-secondary-900">Metadata</h2>

		<div class="w-full pb-4 text-secondary-500">
			<InputField
				id="keywords"
				label="Keywords"
				bind:value={note.keywords}
				onChange={() => saveNote(note)}
			/>
			<InputField
				id="summary"
				label="Summary"
				bind:value={note.summary}
				onChange={() => saveNote(note)}
				type="textarea"
			/>
		</div>

		<InputField
			id="created_at"
			label="Created Date"
			bind:value={() => dayjs(note.created_at).format('YYYY-MM-DD'),
			(v) => (note.created_at = new Date(v).toISOString())}
			onChange={() => saveNote}
			type="date"
		/>

		<InputField
			id="last_updated"
			label="Last Updated"
			type="date"
			bind:value={() => dayjs(note.last_updated).format('YYYY-MM-DD'),
			(v) => (note.last_updated = new Date(v).toISOString())}
			onChange={() => saveNote(note)}
		/>

		{#if note.transcriptions && note.transcriptions.length}
			<div class="mb-2">
				<p class="block text-xs font-medium text-gray-700">Associated Images</p>
				<div class="grid grid-cols-2 gap-2">
					{#each note.transcriptions as transcription, i}
						<div class="relative">
							<button
								class="absolute right-0 top-2 grid h-8 w-8 place-items-center rounded-l-full bg-red-500/40 p-1 py-2 text-white transition-colors hover:bg-red-500"
								><Trash_2 class="h-4 w-4" /></button
							>
							<button
								onclick={() => (showLightbox = transcription.image)}
								class="overflow-hidden rounded shadow"
							>
								<img src={`${transcription.image}`} alt={note.summary} class="w-full" />
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<button
			class="flex items-center gap-1 whitespace-nowrap rounded-lg border border-red-500 bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-red-700 hover:bg-red-700 focus:ring focus:ring-red-200 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-300"
			onclick={() => (showDeleteModal = true)}
			>Delete This Note
		</button>
	</div>
</div>

{#if showDeleteModal}
	<DeleteNoteModal bind:id={note.id} />
{/if}

<Lightbox img={showLightbox} />

<style lang="postcss">
	::backdrop {
		@apply bg-secondary-700/50;
	}
</style>
