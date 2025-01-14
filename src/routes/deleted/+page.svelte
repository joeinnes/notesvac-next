<script lang="ts">
	import type { PageData } from './$types';
	const { data }: { data: PageData } = $props();
	const { deletedNotes, deletedTranscriptions } = $derived(data);
	import Undo2 from 'lucide-svelte/icons/undo-2';
	import dayjs from '$lib/utils/dayjs';
	import { invalidateAll } from '$app/navigation';
	import Trash_2 from 'lucide-svelte/icons/trash-2';
	const { db } = $derived(data);

	const undeleteNote = async (id: string) => {
		if (!db) return;
		await db
			.updateTable('note')
			.set({
				is_deleted: false
			})
			.where('id', '=', id)
			.execute();
		invalidateAll();
	};

	const undeleteTranscription = async (id: string) => {
		if (!db) return;
		await db
			.updateTable('transcription')
			.set({
				is_deleted: false
			})
			.where('id', '=', id)
			.execute();
		invalidateAll();
	};

	let idToDelete = $state('');

	const permaDelete = async (id: string, type: 'note' | 'transcription') => {
		if (!db) return;
		await db.deleteFrom('note').where('id', '=', id).execute();
		invalidateAll();
	};
	let tab: 'notes' | 'transcriptions' = $state('notes');
</script>

<div class="p-4">
	<div class="mb-1 text-2xl font-semibold">
		<h1>Deleted {tab}</h1>
	</div>
	<div>
		<div class="border-b border-b-gray-100">
			<ul class="-mb-px flex items-center gap-4 text-sm font-medium">
				<li>
					<button
						onclick={() => (tab = 'notes')}
						class="inline-flex cursor-pointer items-center gap-2 px-1 py-3 text-primary-700 hover:text-primary-700 {tab ===
							'notes' &&
							'relative text-primary-700  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary-700'}"
					>
						Notes</button
					>
				</li>
				<li>
					<button
						onclick={() => (tab = 'transcriptions')}
						class="inline-flex cursor-pointer items-center gap-2 px-1 py-3 text-primary-700 hover:text-primary-700 {tab ===
							'transcriptions' &&
							'relative text-primary-700  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary-700'}"
					>
						Transcriptions</button
					>
				</li>
			</ul>
		</div>

		<div class="py-3">
			{#if tab === 'notes'}
				{#await deletedNotes}
					Loading...
				{:then deletedNotes}
					{#if deletedNotes && deletedNotes.length}
						<div class="space-y-2">
							{#each deletedNotes as note}
								<div class="mx-auto w-full rounded-lg bg-white shadow">
									<div class="flex w-full items-center justify-center gap-2 p-4">
										<div class="w-full">
											<p class="mt-1 line-clamp-3 w-full flex-1 text-gray-500">
												{note.content}
											</p>
											<span class="text-xs text-gray-700"
												>{dayjs.utc(note.created_at).fromNow()}</span
											>
										</div>
										<button
											class="flex items-center gap-1 rounded-lg border border-secondary-500 bg-secondary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-secondary-700 hover:bg-secondary-700 focus:ring focus:ring-secondary-200 disabled:cursor-not-allowed disabled:border-secondary-300 disabled:bg-secondary-300"
											onclick={() => undeleteNote(note.id)}
											><Undo2 class="w-4" /> Restore
										</button>
										<button
											class="flex items-center gap-1 whitespace-nowrap rounded-lg border border-red-500 bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-red-700 hover:bg-red-700 focus:ring focus:ring-red-200 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-300"
											onclick={() => (idToDelete = note.id)}
											><Trash_2 class="w-4" />Delete Permanently
										</button>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="prose">
							<p>You haven't got any deleted notes.</p>
							<a href="/">Go home &rarr;</a>
						</div>
					{/if}
				{/await}
			{:else}{#await deletedTranscriptions}
					Loading...
				{:then deletedTranscriptions}
					{#if deletedTranscriptions && deletedTranscriptions.length}
						<div class="space-y-2">
							{#each deletedTranscriptions as transcription}
								<div class="mx-auto w-full rounded-lg bg-white shadow">
									<div class="flex w-full items-center justify-center gap-2 p-4">
										<div class="w-full">
											<p class="mt-1 line-clamp-3 w-full flex-1 text-gray-500">
												{transcription.content}
											</p>
											<span class="text-xs text-gray-700"
												>{dayjs.utc(transcription.created_at).fromNow()}</span
											>
										</div>
										<button
											class="flex items-center gap-1 rounded-lg border border-secondary-500 bg-secondary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-secondary-700 hover:bg-secondary-700 focus:ring focus:ring-secondary-200 disabled:cursor-not-allowed disabled:border-secondary-300 disabled:bg-secondary-300"
											onclick={() => undeleteTranscription(transcription.id)}
											><Undo2 class="w-4" /> Restore
										</button>
										<button
											class="flex items-center gap-1 whitespace-nowrap rounded-lg border border-red-500 bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-red-700 hover:bg-red-700 focus:ring focus:ring-red-200 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-300"
											onclick={() => (idToDelete = transcription.id)}
											><Trash_2 class="w-4" />Delete Permanently
										</button>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="prose">
							<p>You haven't got any deleted transcriptions.</p>
							<a href="/">Go home &rarr;</a>
						</div>
					{/if}
				{/await}{/if}
		</div>
	</div>
</div>
{#if idToDelete}
	<div class="absolute">
		<div class="h-full">
			<div class="fixed inset-0 z-10 bg-secondary-700/50"></div>
			<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
				<div class="mx-auto overflow-hidden rounded-lg bg-white shadow-xl sm:w-full sm:max-w-xl">
					<div class="relative p-6">
						<button
							type="button"
							aria-label="Close"
							onclick={() => {
								idToDelete = '';
							}}
							class="absolute right-4 top-4 rounded-lg p-1 text-center font-medium text-secondary-500 transition-all hover:bg-secondary-100"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								class="h-6 w-6"
							>
								<path
									d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
								/>
							</svg>
						</button>
						<h3 class="text-lg font-medium text-secondary-900">Delete Item</h3>
						<div class="mt-2 text-sm text-secondary-500">
							Are you sure you want to delete this? There is no way to undo this, your item will be
							lost forever!
						</div>
					</div>
					<div class="flex justify-end gap-3 bg-secondary-50 px-6 py-3">
						<button
							type="button"
							onclick={() => {
								idToDelete = '';
							}}
							class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
							>Cancel</button
						>
						<button
							type="button"
							class="rounded-lg border border-red-500 bg-red-500 px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-red-700 hover:bg-red-700 focus:ring focus:ring-red-200 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-300"
							onclick={() => {
								if (idToDelete) permaDelete(idToDelete, tab === 'notes' ? 'note' : 'transcription');
								idToDelete = '';
							}}>Delete Permanently</button
						>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
