<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import Sidebar from '$lib/components/sidebar.svelte';
	let { children, data }: { data: LayoutData; children: Snippet } = $props();
	const { db } = $derived(data);
	// import { db } from '$lib/db/db.svelte';
	import PersistenceWarning from '$lib/components/PersistenceWarning.svelte';
	import Toasts from '$lib/components/Toaster/Toasts.svelte';
	let warnOnNonPersistence = $state(false);
	$effect(() => {
		/*import('$lib/db').then(async ({ db: database }) => {
			const thisDb = await database();
			db.db = thisDb;
		});*/
		navigator.storage.persist().then((granted) => {
			warnOnNonPersistence = !granted;
			if (!granted) {
				console.warn(
					'User has not enabled persistent storage. Storage may be cleared under storage pressure.'
				);
			}
		});
	});
</script>

<svelte:head><title>NotesVac</title></svelte:head>
{#await db then db}
	<div class="flex h-screen max-h-screen flex-col">
		{#if warnOnNonPersistence}
			<PersistenceWarning {warnOnNonPersistence}></PersistenceWarning>
		{/if}
		<div class="flex h-full max-h-full flex-1 @container">
			<div
				class="@lg:sticky @lg:top-0 @lg:flex @lg:h-full @lg:w-[320px] @lg:min-w-[320px] @lg:flex-shrink-0 @lg:flex-grow-0 @lg:flex-col @lg:justify-between @lg:overflow-hidden"
			>
				<Sidebar />
			</div>
			<main class="h-full flex-1 overflow-y-auto">
				<svelte:boundary>
					{@render children()}

					{#snippet failed(error, reset)}
						<div class="prose">
							<h1>Something went wrong</h1>
							<button
								onclick={reset}
								class="block rounded-lg border border-secondary-500 bg-secondary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-secondary-700 hover:bg-secondary-700 focus:ring focus:ring-secondary-200 disabled:cursor-not-allowed disabled:border-secondary-300 disabled:bg-secondary-300"
								>Try again</button
							>
						</div>
					{/snippet}
				</svelte:boundary>
				<Toasts />
			</main>
		</div>
	</div>
{/await}
