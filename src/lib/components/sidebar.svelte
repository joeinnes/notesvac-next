<script lang="ts">
	import DeleteNoteModal from './DeleteNoteModal.svelte';
	import debounce from 'lodash.debounce';
	import { page } from '$app/stores';
	import dayjs from '$lib/utils/dayjs';
	import { Toasts } from './Toaster/toaster.svelte';
	import House from 'lucide-svelte/icons/house';
	import Icon from '$lib/icon/Icon.svelte';
	import NotebookText from 'lucide-svelte/icons/notebook-text';
	import Search from 'lucide-svelte/icons/search';
	import Settings from 'lucide-svelte/icons/settings';
	import Trash_2 from 'lucide-svelte/icons/trash-2';

	import { goto, invalidateAll } from '$app/navigation';

	const { notes, user, db, q, id } = $derived($page.data);

	let query = $state('');
	$effect(() => {
		query = q;
	});

	let noteToDelete = $state('');
	let showDeleteModal = $derived(noteToDelete !== '');

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
			await db
				.updateTable('note')
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

<div class="flex h-full overflow-hidden bg-secondary-50 shadow-md">
	<div
		class="flex h-full min-w-[50px] flex-col items-center gap-4 border-e border-secondary-100 p-1"
	>
		<a href="/" class="w-full"><Icon /></a>
		<a href="/" class="rounded p-1 transition-colors hover:bg-secondary-200"><House /></a>
		<a href="/transcriptions" class="rounded p-1 transition-colors hover:bg-secondary-200"
			><NotebookText /></a
		>
		<a href="/deleted" class="rounded p-1 transition-colors hover:bg-secondary-200"><Trash_2 /></a>

		<a href="/settings" class="mt-auto rounded p-1 transition-colors hover:bg-secondary-200"
			><Settings /></a
		>
	</div>
	<div class="flex h-full flex-col overflow-hidden border-e border-secondary-100 bg-secondary-50">
		<div class="flex-1 px-2 py-6 pt-2">
			<div class="flex w-full items-center justify-between px-4 py-2">
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
						class="w-full rounded-md border-gray-200 py-2.5 pe-10 shadow-sm sm:text-sm"
					/>

					<span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
						<button type="button" class="text-gray-600 hover:text-gray-700">
							<span class="sr-only">Search</span>

							<Search />
						</button>
					</span>
				</div>
			</form>

			<ul class="mt-2 w-full flex-1 overflow-hidden">
				{#await notes}
					<li><p>Loading</p></li>
				{:then noteList}
					{#each noteList as note (note.id)}
						{@const createdAt = dayjs.utc(note.created_at)}
						<li
							class="group flex w-full max-w-full items-center overflow-hidden rounded border-b border-t-0 last:border-b-0"
							class:bg-primary-200={id === note.id}
						>
							<a
								href="/note/{note.id}{query && '?q=' + query}"
								class=" hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full max-w-full flex-col items-start justify-center gap-2 whitespace-nowrap px-2 py-4 text-sm leading-tight"
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
							<div
								class="absolute right-0 translate-x-full transform p-2 transition-transform group-hover:translate-x-0"
							>
								<button
									onclick={() => (noteToDelete = note.id)}
									class="rounded-full bg-red-500 p-1 text-white"
									><Trash_2 class="h-4 w-4 flex-shrink-0" /></button
								>
							</div>
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
				<a href="/" class="flex items-center gap-2 p-4 hover:bg-gray-50">
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
	<DeleteNoteModal bind:id={noteToDelete} />
{/if}

<style lang="postcss">
	::backdrop {
		@apply bg-secondary-700/50;
	}
</style>
