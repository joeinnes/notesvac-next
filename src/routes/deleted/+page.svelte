<script lang="ts">
	import type { PageData } from './$types';
	const { data }: { data: PageData } = $props();
	const { db, deletedNotes, deletedTranscriptions, pagination } = $derived(data);
	import Undo2 from 'lucide-svelte/icons/undo-2';
	import dayjs from '$lib/utils/dayjs';
	import { goto, invalidateAll } from '$app/navigation';
	import Trash_2 from 'lucide-svelte/icons/trash-2';

	const ITEMS_PER_PAGE = 20;
	let selected: string[] | undefined = $state();

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

	const permaDelete = async (ids: string | string[], type: 'note' | 'transcription') => {
		if (!db) return;
		const idsArray = Array.isArray(ids) ? ids : [ids];
		await db.deleteFrom(type).where('id', 'in', idsArray).execute();
		selected = undefined;
		invalidateAll();
	};
	let tab: 'note' | 'transcription' = $state('note');

	let currentPage = $state(0);
	const itemsPerPage = $derived(pagination?.itemsPerPage || 20);

	const nextPage = () => {
		currentPage++;
		goto(`?tab=${tab}&deleted_from=${currentPage * itemsPerPage}`, { replaceState: true });
	};

	const prevPage = () => {
		if (currentPage > 0) {
			currentPage--;
			goto(`?tab=${tab}&deleted_from=${currentPage * itemsPerPage}`, { replaceState: true });
		}
	};

	$effect(() => {
		const url = new URL(window.location.href);
		const from = url.searchParams.get('deleted_from');
		const tabParam = url.searchParams.get('tab');
		if (tabParam === 'note' || tabParam === 'transcription') {
			tab = tabParam;
		}
		currentPage = Math.floor(parseInt(from || '0') / itemsPerPage);
	});
</script>

<div class="p-4">
	<div class="mb-1 text-2xl font-semibold">
		<h1>Deleted {tab}s</h1>
	</div>
	<div>
		<div class="border-b border-b-gray-100">
			<ul class="-mb-px flex items-center gap-4 text-sm font-medium">
				<li>
					<button
						onclick={() => (tab = 'note')}
						class="inline-flex cursor-pointer items-center gap-2 px-1 py-3 text-primary-700 hover:text-primary-700 {tab ===
							'note' &&
							'relative text-primary-700  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary-700'}"
					>
						Notes</button
					>
				</li>
				<li>
					<button
						onclick={() => (tab = 'transcription')}
						class="inline-flex cursor-pointer items-center gap-2 px-1 py-3 text-primary-700 hover:text-primary-700 {tab ===
							'transcription' &&
							'relative text-primary-700  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary-700'}"
					>
						Transcriptions</button
					>
				</li>
			</ul>
		</div>

		<div class="flex w-full items-center justify-between px-4 pt-2">
			<div>
				<input
					type="checkbox"
					onclick={() =>
						(selected = selected && selected.length ? [] : deletedNotes?.map((el) => el.id))}
					disabled={!deletedNotes?.length}
					checked={selected && selected.length ? true : false}
					class="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 focus:ring-offset-0 disabled:cursor-not-allowed disabled:text-gray-400"
				/>
				<label for="select_all" class="text-sm font-medium text-gray-700">Select all</label>
			</div>
			<button
				class="flex items-center gap-1 whitespace-nowrap rounded-lg border border-red-500 bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-red-700 hover:bg-red-700 focus:ring focus:ring-red-200 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-300"
				disabled={!selected || !selected.length}
				onclick={() => {
					idToDelete = 'multi';
				}}
				><Trash_2 class="w-4" />Delete Multiple
			</button>
		</div>
		<div class="py-3">
			{#if tab === 'note'}
				{#await deletedNotes}
					Loading...
				{:then deletedNotes}
					{#if deletedNotes && deletedNotes.length}
						<div class="space-y-2">
							{#each deletedNotes as note}
								<div class="mx-auto w-full rounded-lg bg-white shadow">
									<div class="flex w-full items-center justify-center gap-2 p-4">
										<div class="flex items-center space-x-2">
											<input
												type="checkbox"
												name="selected"
												bind:group={selected}
												value={note.id}
												class="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 focus:ring-offset-0 disabled:cursor-not-allowed disabled:text-gray-400"
											/>
										</div>
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
			<div class="fixed inset-0 z-10 bg-gray-700/50"></div>
			<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
				<div class="mx-auto overflow-hidden rounded-lg bg-white shadow-xl sm:w-full sm:max-w-xl">
					<div class="relative p-6">
						<button
							type="button"
							aria-label="Close"
							onclick={() => {
								idToDelete = '';
							}}
							class="absolute right-4 top-4 rounded-lg p-1 text-center font-medium text-gray-500 transition-all hover:bg-gray-100"
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
						<h3 class="text-lg font-medium text-gray-900">Delete Item</h3>
						<div class="mt-2 text-sm text-gray-500">
							Are you sure you want to delete {idToDelete === 'multi' ? 'these' : 'this'}
							{tab}{idToDelete === 'multi' ? 's' : ''}? There is no way to undo this, your {tab}{idToDelete ===
							'multi'
								? 's'
								: ''} will be lost forever!
						</div>
					</div>
					<div class="flex justify-end gap-3 bg-gray-50 px-6 py-3">
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
								if (idToDelete === 'multi') {
									if (!selected) return;
									permaDelete(selected, tab);
								} else {
									permaDelete(idToDelete, tab);
								}
								idToDelete = '';
							}}>Delete Permanently</button
						>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<div class="mb-4 mt-2 flex justify-center">
	<nav aria-label="Pagination">
		<ul class="inline-flex items-center space-x-1 rounded-md text-sm">
			<li>
				<button
					onclick={prevPage}
					disabled={currentPage === 0}
					class="inline-flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-500 hover:bg-gray-50"
				>
					<svg
						class="h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
							clip-rule="evenodd"
						/>
					</svg>
					<span>Previous</span>
				</button>
			</li>
			<li>
				<span class="inline-flex items-center rounded-md bg-white px-4 py-2 text-gray-500"
					>Page <b class="mx-1">{currentPage + 1}</b> of
					<b class="ml-1"
						>{Math.max(
							Math.ceil(
								(tab === 'note'
									? pagination?.notesCount || 0
									: pagination?.transcriptionsCount || 0) /
									(pagination?.itemsPerPage || ITEMS_PER_PAGE)
							),
							1
						)}</b
					></span
				>
			</li>
			<li>
				<button
					onclick={nextPage}
					disabled={tab === 'note'
						? (currentPage + 1) * (pagination?.itemsPerPage || ITEMS_PER_PAGE) >=
							(pagination?.notesCount || 0)
						: (currentPage + 1) * (pagination?.itemsPerPage || ITEMS_PER_PAGE) >=
							(pagination?.transcriptionsCount || 0)}
					class="inline-flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-500 hover:bg-gray-50"
				>
					<span>Next</span>
					<svg
						class="h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</li>
		</ul>
	</nav>
</div>
