<script lang="ts">
	import debounce from 'lodash.debounce';
	import { page } from '$app/stores';
	import dayjs from '$lib/utils/dayjs';

	import Search from 'lucide-svelte/icons/search';
	import Trash_2 from 'lucide-svelte/icons/trash-2';

	import DeleteNoteModal from './DeleteNoteModal.svelte';
	import { _fetchMore, _LOAD_LIMIT } from '../../routes/+layout';

	const { notes: pageNotes, q, id } = $derived($page.data);

	let offset = $state(0);
	let query = $state('');
	// svelte-ignore state_referenced_locally Because I only want to initialise the state this way
	let notes = $state(pageNotes);
	let loading = $state(false);
	// svelte-ignore state_referenced_locally again, I only want to initialise the state
	let total: number = $state(notes.length);
	let moreToFetch = $derived(total < offset + _LOAD_LIMIT);
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

	async function fetchMore() {
		const newNotes = await _fetchMore(q, offset);
		if (!newNotes) return;
		total = newNotes.total;
		notes = [
			...notes,
			...newNotes.notes.filter((el) => {
				return notes.findIndex((el2) => el2.id === el.id) === -1; // Don't allow duplication.
			})
		];
		loading = false;
	}
	$effect(() => {
		if (offset > 0) {
			loading = true;
			fetchMore();
		}
	});
	$effect(() => {
		notes = pageNotes; // Oh this is uggllleeeee
	});
</script>

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
				class="group relative flex w-full flex-col items-center overflow-hidden rounded border-b border-t-0 last:border-b-0"
				class:bg-primary-200={id === note.id}
			>
				<a
					href="/note/{note.id}{query && '?q=' + query}"
					class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full flex-col items-start justify-center gap-2 whitespace-nowrap px-2 py-2 text-sm leading-tight md:py-4"
				>
					<div class="flex w-full justify-between">
						<span class="block w-full truncate"
							>{#key note.content}{note.content}
							{/key}</span
						>
					</div>

					<span class="hidden text-xs text-gray-700 md:block"
						>{createdAt.add(25, 'days').isBefore(dayjs())
							? createdAt.format('DD-MMM-YYYY')
							: createdAt.fromNow()}</span
					>
				</a>

				<div
					class="absolute bottom-0 right-0 top-0 hidden transform flex-col items-center p-2 pr-4 transition-transform group-hover:translate-x-0 md:flex md:translate-x-full"
				>
					<button
						onclick={() => (noteToDelete = note.id)}
						class="rounded-full bg-red-500 p-1 text-white"
						><Trash_2 class="h-4 w-4 flex-shrink-0" /></button
					>
				</div>
				<div class="w-full gap-2 px-2 md:hidden">
					<a href="/note/{note.id}{query && '?q=' + query}" class="mr-auto">
						<span class="text-xs text-gray-700"
							>{createdAt.add(25, 'days').isBefore(dayjs())
								? createdAt.format('DD-MMM-YYYY')
								: createdAt.fromNow()}</span
						></a
					>
					<button
						onclick={() => (noteToDelete = note.id)}
						class="mb-2 rounded-full bg-red-500 p-1 text-white md:hidden"
						><Trash_2 class="h-4 w-4 flex-shrink-0" /></button
					>
				</div>
			</li>
		{:else}
			<li
				class="group relative flex w-full items-center overflow-hidden rounded border-b border-t-0 last:border-b-0"
			>
				<p class="w-full block rounded-lg py-2 text-sm font-medium text-gray-700">No results</p>
			</li>
		{/each}
		<li
			class="group relative flex w-full items-center overflow-hidden rounded border-b border-t-0 last:border-b-0"
		>
			<button
				onclick={() => (offset += _LOAD_LIMIT)}
				disabled={moreToFetch}
				class="mx-auto mb-2 mt-4 block rounded-lg border border-secondary-500 bg-secondary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-secondary-700 hover:bg-secondary-700 focus:ring focus:ring-secondary-200 disabled:cursor-not-allowed disabled:border-secondary-300 disabled:bg-secondary-300"
				>Load more</button
			>
		</li>
	{/await}
</ul>
{#if showDeleteModal}
	<DeleteNoteModal bind:id={noteToDelete} />
{/if}

<style lang="postcss">
	::backdrop {
		@apply bg-secondary-700/50;
	}
</style>
