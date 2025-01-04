<script lang="ts">
	import debounce from 'lodash.debounce';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { page } from '$app/stores';
	dayjs.extend(relativeTime);

	import Icon from '$lib/icon/Icon.svelte';
	import Settings from 'lucide-svelte/icons/settings';
	import Trash_2 from 'lucide-svelte/icons/trash-2';

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
</script>

<div class="flex">
	<div class="flex h-full min-w-[50px] flex-col items-center justify-between border-e p-2">
		<a href="/" class="w-full"><Icon /></a>
		<a href="/settings"><Settings /></a>
	</div>
	<div class="flex h-screen flex-col overflow-hidden border-e bg-white">
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
				{:then notes}
					{#each notes as note (note.id)}
						<li class="w-full py-4">
							<a
								href="/note/{note.id}"
								class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex max-w-full flex-col items-start gap-2 whitespace-nowrap border-b text-sm leading-tight last:border-b-0"
							>
								<span class="w-full truncate"
									>{#key note.content}{note.content}
									{/key}</span
								>
								<div class="flex w-full gap-1">
									<span class="ml-auto text-xs">{dayjs(note.createdAt).fromNow()}</span>
									<Trash_2 class="h-4 w-4 flex-shrink-0" />
								</div>
							</a>
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
