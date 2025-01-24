<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import Sidebar from '$lib/components/sidebar.svelte';
	let { children, data }: { data: LayoutData; children: Snippet } = $props();
	const { db } = $derived(data);
	import PersistenceWarning from '$lib/components/PersistenceWarning.svelte';
	import Toasts from '$lib/components/Toaster/Toasts.svelte';
	let warnOnNonPersistence = $state(false);
	$effect(() => {
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
	<div class="relative flex h-screen flex-col overflow-hidden">
		{#if warnOnNonPersistence}
			<PersistenceWarning {warnOnNonPersistence}></PersistenceWarning>
		{/if}
		<div class="relative h-full flex-1 overflow-hidden @container md:flex">
			<div class="relative hidden md:block"><Sidebar /></div>

			<main class="h-full flex-1 overflow-y-auto" style="scrollbar-gutter: stable">
				<svelte:boundary>
					{@render children()}

					{#snippet failed(error, reset)}
						<div class="prose p-4">
							<h1>Something went wrong</h1>
							<button
								onclick={reset}
								class="not-prose block rounded-lg border border-secondary-500 bg-secondary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-secondary-700 hover:bg-secondary-700 focus:ring focus:ring-secondary-200 disabled:cursor-not-allowed disabled:border-secondary-300 disabled:bg-secondary-300"
								>Try again?</button
							>
						</div>
					{/snippet}
				</svelte:boundary>
				<Toasts />
			</main>
		</div>
		<div class="border-t border-primary-100 bg-primary-50 py-2 md:hidden"><Sidebar /></div>
	</div>
{/await}
