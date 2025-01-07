<script lang="ts">
	import debounce from 'lodash.debounce';
	import { page } from '$app/stores';

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import utc from 'dayjs/plugin/utc';
	dayjs.extend(utc);
	dayjs.extend(relativeTime);

	import { Toasts } from './Toaster/toaster.svelte';

	import Icon from '$lib/icon/Icon.svelte';
	import Settings from 'lucide-svelte/icons/settings';
	import Trash_2 from 'lucide-svelte/icons/trash-2';
	import { db } from '$lib/db/db.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	let query = $state('');

	let noteToDelete = $state('');
	let showDeleteModal = $derived(noteToDelete !== '');
	const { notes, user } = $derived($page.data);

	const debouncedSearch = debounce(
		(e: KeyboardEvent) => {
			(e?.target as HTMLInputElement)?.form?.requestSubmit();
		},
		200,
		{
			maxWait: 2000 // If the user keeps typing for more than 2 seconds, don't debounce continuously, just return after 2 seconds
		}
	);

	const deleteNote = async (id: string) => {
		try {
			const currentPage = $page.data?.id;
			if (currentPage === id) {
				await goto('/');
			}
			await db.db
				?.updateTable('note')
				.set({
					is_deleted: true
				})
				.where('id', '=', id)
				.execute();
			Toasts.addToast('error', 'Note deleted.');
		} catch (e) {
			console.error(e);
			Toasts.addToast('error', 'Something went wrong and your note could not be deleted.');
		}
		invalidateAll();
	};
</script>

<div class="flex h-full overflow-hidden">
	<div class="flex h-full min-w-[50px] flex-col items-center gap-4 border-e p-1">
		<a href="/" class="w-full"><Icon /></a>
		<a href="/deleted" class="rounded p-1 transition-colors hover:bg-secondary-200"><Trash_2 /></a>
		<a href="/settings" class="mt-auto rounded p-1 transition-colors hover:bg-secondary-200"
			><Settings /></a
		>
	</div>
	<div class="flex h-full flex-col overflow-hidden border-e bg-white">
		<div class="flex-1 px-4 py-6 pt-2">
			<div class="flex w-full items-center justify-between py-2">
				<div class="text-foreground text-base font-medium">NotesVac</div>
			</div>
			<form method="GET" action="" data-sveltekit-keepfocus>
				<div class="relative">
					<label for="Search" class="sr-only"> Search </label>

					<input
						type="text"
						id="Search"
						placeholder="Search for..."
						name="q"
						bind:value={query}
						onkeyup={debouncedSearch}
						data-sveltekit-replacestate
						data-sveltekit-keepfocus
						class="w-full rounded-md border-gray-200 py-2.5 pe-10 shadow-sm sm:text-sm"
					/>

					<span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
						<button type="button" class="text-gray-600 hover:text-gray-700">
							<span class="sr-only">Search</span>

							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-4"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
								/>
							</svg>
						</button>
					</span>
				</div>
			</form>

			<ul class="mt-2 w-full flex-1 divide-y overflow-hidden">
				{#await notes}
					<li><p>Loading</p></li>
				{:then noteList}
					{#each noteList as note (note.id)}
						{@const createdAt = dayjs.utc(note.created_at)}
						<li
							class="group flex w-full max-w-full items-center overflow-hidden border-b border-t-0 py-4 last:border-b-0"
						>
							<a
								href="/note/{note.id}{query && '?q=' + query}"
								class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full max-w-full flex-col items-start justify-center gap-2 whitespace-nowrap text-sm leading-tight"
							>
								<div class="flex w-full justify-between">
									<span class="block w-full truncate"
										>{#key note.content}{note.content}
										{/key}</span
									>
								</div>

								<span class="text-xs text-gray-700"
									>{createdAt.add(25, 'days').isBefore(dayjs())
										? createdAt.format('DD-MMM-YYYY')
										: createdAt.fromNow()}</span
								>
							</a>
							<button
								onclick={() => (noteToDelete = note.id)}
								class="absolute right-0 translate-x-full transform rounded-full bg-red-500 p-1 text-white transition-transform group-hover:translate-x-0"
								><Trash_2 class="h-4 w-4 flex-shrink-0" /></button
							>
						</li>
					{:else}
						<li>
							<p class="block rounded-lg py-2 text-sm font-medium text-gray-700">No results</p>
						</li>
					{/each}
				{/await}
			</ul>
		</div>

		<div class="w-full p-2">
			<a
				href="/note/new"
				class="block rounded-lg border border-primary-500 bg-primary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-primary-300 disabled:bg-primary-300"
			>
				+ New Note
			</a>
		</div>

		{#if user && (user.name || user.avatar)}
			<div class="border-t border-gray-100">
				<a href="/me" class="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">
					{#if user.avatar}
						<img alt="" src={user.avatar} class="size-10 rounded-full object-cover" />
					{/if}

					<div>
						<p class="text-xs">
							<strong class="block font-medium">{user.name}</strong>

							<span> {user.username} </span>
						</p>
					</div>
				</a>
			</div>
		{/if}
	</div>
</div>
{#if showDeleteModal}
	<div class="absolute">
		<div class="h-full">
			<div class="fixed inset-0 z-10 bg-secondary-700/50"></div>
			<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
				<div class="mx-auto overflow-hidden rounded-lg bg-white shadow-xl sm:w-full sm:max-w-xl">
					<div class="relative p-6">
						<button
							type="button"
							aria-label="Close"
							onclick={() => (noteToDelete = '')}
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
						<h3 class="text-lg font-medium text-secondary-900">Delete Note</h3>
						<div class="mt-2 text-sm text-secondary-500">
							Are you sure you want to delete this note? You'll be able to find it later in your
							Deleted Notes.
						</div>
					</div>
					<div class="flex justify-end gap-3 bg-secondary-50 px-6 py-3">
						<button
							type="button"
							onclick={() => {
								noteToDelete = '';
							}}
							class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
							>Cancel</button
						>
						<button
							type="button"
							class="rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-primary-300 disabled:bg-primary-300"
							onclick={() => {
								if (noteToDelete) deleteNote(noteToDelete);
								noteToDelete = '';
							}}>Confirm</button
						>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	::backdrop {
		@apply bg-secondary-700/50;
	}
</style>
