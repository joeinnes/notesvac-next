<script lang="ts">
	import Search from './Search.svelte';

	import { page } from '$app/stores';

	import FilePlus2 from 'lucide-svelte/icons/file-plus-2';
	import House from 'lucide-svelte/icons/house';
	import Icon from '$lib/icon/Icon.svelte';
	import NotebookText from 'lucide-svelte/icons/notebook-text';
	import SearchIcon from 'lucide-svelte/icons/search';
	import Settings from 'lucide-svelte/icons/settings';
	import Trash_2 from 'lucide-svelte/icons/trash-2';

	const { user, q } = $derived($page.data);

	let query = $state('');
	$effect(() => {
		query = q;
	});
</script>

<div class="sticky inset-x-0 bottom-0 flex w-screen items-center justify-center gap-8 md:hidden">
	<a href="/" class="w-8 md:w-full"><Icon /></a>
	<a href="/note/new" class="rounded p-1 transition-colors hover:bg-secondary-200 md:hidden">
		<FilePlus2 />
	</a>
	<a href="/search" class="rounded p-1 transition-colors hover:bg-secondary-200"> <SearchIcon /></a>
	<a href="/transcriptions" class="rounded p-1 transition-colors hover:bg-secondary-200"
		><NotebookText /></a
	>
	<a href="/deleted" class="rounded p-1 transition-colors hover:bg-secondary-200"><Trash_2 /></a>

	<a href="/settings" class="mt-auto rounded p-1 transition-colors hover:bg-secondary-200"
		><Settings /></a
	>
</div>
<div
	class="!relative @lg:sticky @lg:top-0 @lg:flex @lg:h-full @lg:w-[320px] @lg:min-w-[320px] @lg:flex-shrink-0 @lg:flex-grow-0 @lg:flex-col @lg:justify-between @lg:overflow-hidden"
>
	<div
		class="max-w-screen relative hidden h-full flex-col-reverse overflow-hidden bg-secondary-50 shadow-md md:flex md:flex-row"
	>
		<div
			class="flex min-w-[50px] items-center justify-center gap-8 border-e border-secondary-100 p-1 md:relative md:h-full md:flex-col"
		>
			<a href="/" class="w-8 md:w-full"><Icon /></a>
			<a href="/note/new" class="rounded p-1 transition-colors hover:bg-secondary-200 md:hidden">
				<FilePlus2 />
			</a>
			<a
				href="/"
				class="hidden rounded p-1 transition-colors hover:bg-secondary-200 md:inline-block"
				><House /></a
			>
			<a href="/transcriptions" class="rounded p-1 transition-colors hover:bg-secondary-200"
				><NotebookText /></a
			>
			<a href="/deleted" class="rounded p-1 transition-colors hover:bg-secondary-200"><Trash_2 /></a
			>

			<a href="/settings" class="mt-auto rounded p-1 transition-colors hover:bg-secondary-200"
				><Settings /></a
			>
		</div>
		<div
			class="relative flex h-full flex-1 flex-col overflow-hidden border-e border-secondary-100 bg-secondary-50"
		>
			<div class="relative h-full w-full flex-1 overflow-y-auto px-2 py-6 pt-2">
				<div class="text-foreground p-2 text-base font-medium">NotesVac</div>

				<Search />
			</div>

			<div class="hidden w-full px-2 py-2 md:block">
				<a
					href="/note/new"
					class="block rounded-lg border border-primary-500 bg-primary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-primary-300 disabled:bg-primary-300"
				>
					+ New Note
				</a>
			</div>

			{#if user && (user.name || user.avatar)}
				<div class="hidden border-t border-gray-100 md:block">
					<a href="/" class="flex items-center gap-2 p-2 px-4 hover:bg-gray-50 md:py-4">
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
</div>

<style lang="postcss">
	::backdrop {
		@apply bg-secondary-700/50;
	}
</style>
